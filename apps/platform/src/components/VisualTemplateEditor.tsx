"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Editor from "@monaco-editor/react";
import { updateTemplate, createTemplate } from "../app/actions/templates";
import {
    Save,
    Monitor,
    Smartphone,
    Upload,
    ArrowLeft,
    FileCode,
    Eye,
    Layers,
    Rocket
} from "lucide-react";
import Link from "next/link";
import { AssetPickerModal } from "./AssetPickerModal";

interface VisualTemplateEditorProps {
    initialData?: {
        id: string;
        name: string;
        slug: string;
        type: "EMAIL" | "LANDING" | "CHECKOUT";
        body: string;
    } | null;
}

/**
 * Extract all unique {{variable}} names from HTML string
 */
function extractVariables(html: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    while ((match = regex.exec(html)) !== null) {
        variables.add(match[1].trim());
    }
    return Array.from(variables);
}

/**
 * Replace all {{variable}} with actual values
 */
function renderPreview(html: string, values: Record<string, string>): string {
    let result = html;
    for (const [key, value] of Object.entries(values)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
}

export function VisualTemplateEditor({ initialData }: VisualTemplateEditorProps) {
    // Form state
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [type, setType] = useState<"EMAIL" | "LANDING" | "CHECKOUT">(
        initialData?.type || "EMAIL"
    );
    const [body, setBody] = useState(initialData?.body || "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello {{name}}!</h1>\n</body>\n</html>");

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [assetPickerOpen, setAssetPickerOpen] = useState(false);
    const [activeVariable, setActiveVariable] = useState<string | null>(null);

    const isNew = !initialData;
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Extract variables from HTML
    const detectedVariables = useMemo(() => extractVariables(body), [body]);

    // Initialize variable values when new variables are detected
    useEffect(() => {
        setVariableValues((prev) => {
            const updated = { ...prev };
            for (const variable of detectedVariables) {
                if (!(variable in updated)) {
                    updated[variable] = "";
                }
            }
            // Remove old variables that no longer exist
            for (const key of Object.keys(updated)) {
                if (!detectedVariables.includes(key)) {
                    delete updated[key];
                }
            }
            return updated;
        });
    }, [detectedVariables]);

    // Rendered preview HTML
    const previewHtml = useMemo(() => {
        return renderPreview(body, variableValues);
    }, [body, variableValues]);

    // Update iframe content when preview changes
    useEffect(() => {
        if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(previewHtml);
                doc.close();
            }
        }
    }, [previewHtml]);

    const handleVariableChange = (variable: string, value: string) => {
        setVariableValues((prev) => ({
            ...prev,
            [variable]: value,
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isNew) {
                const formData = new FormData();
                formData.append("name", name);
                formData.append("slug", slug);
                formData.append("type", type);
                formData.append("body", body);
                await createTemplate(formData);
            } else {
                await updateTemplate(initialData.id, { body, slug, name, type });
            }
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (type !== "EMAIL") return;
        const email = window.prompt("Enter email address for test:");
        if (!email) return;

        try {
            const { sendTestEmail } = await import("../app/actions/email");
            const mockData = {
                name: variableValues.name || "Test User",
                journey_url: variableValues.journey_url || "http://localhost:3000/flow/demo",
                ...variableValues,
            };
            const result = await sendTestEmail(email, "[TEST] " + name, body, mockData);
            if (result.success) {
                alert(`Test email sent to ${email}! (ID: ${result.id})`);
            }
        } catch (e: any) {
            console.error(e);
            alert("Failed to send email: " + e.message);
        }
    };

    // Check if variable looks like a URL (for input type hint)
    const isUrlVariable = (name: string) => {
        const urlPatterns = ['url', 'link', 'image', 'img', 'src', 'href'];
        return urlPatterns.some(p => name.toLowerCase().includes(p));
    };

    const openAssetPicker = (variable: string) => {
        setActiveVariable(variable);
        setAssetPickerOpen(true);
    };

    const handleAssetSelect = (url: string) => {
        if (activeVariable) {
            // Replace the variable in the body with the URL
            const regex = new RegExp(`\\{\\{\\s*${activeVariable}\\s*\\}\\}`, 'g');
            const newBody = body.replace(regex, url);
            setBody(newBody);
        }
        setAssetPickerOpen(false);
        setActiveVariable(null);
    };

    return (
        <div className="flex h-screen flex-col bg-slate-900">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
                <div className="flex items-center gap-4">
                    <Link
                        href="/templates"
                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {type === "EMAIL" && (
                        <button
                            onClick={handleSendTest}
                            className="flex items-center gap-2 rounded-md bg-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-600"
                        >
                            Send Test
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                        <Rocket className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Campaign"}
                    </button>
                </div>
            </div>

            {/* Main Three-Pane Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT SIDEBAR - Asset Loader */}
                <div className="flex w-64 flex-col border-r border-slate-700 bg-slate-850 bg-slate-800/50">
                    <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
                        <Layers className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-200">Asset Loader</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <p className="mb-4 text-xs text-slate-500">
                            Variables detected in your template
                        </p>

                        {detectedVariables.length === 0 ? (
                            <p className="rounded-md bg-slate-700/50 p-3 text-center text-xs text-slate-500">
                                No variables found. Use {"{{variable_name}}"} syntax in your HTML.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {detectedVariables.map((variable) => (
                                    <div key={variable} className="space-y-1">
                                        <label className="flex items-center justify-between text-xs text-slate-400">
                                            <span>{`{{${variable}}}`}</span>
                                            {isUrlVariable(variable) && (
                                                <button
                                                    onClick={() => openAssetPicker(variable)}
                                                    className="rounded p-0.5 hover:bg-slate-600"
                                                    title="Browse Assets"
                                                >
                                                    <Upload className="h-3 w-3" />
                                                </button>
                                            )}
                                        </label>
                                        {isUrlVariable(variable) ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={variableValues[variable] || ""}
                                                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full rounded bg-slate-700 px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                                {variableValues[variable] && variableValues[variable].match(/\.(jpg|jpeg|png|gif|webp)/i) && (
                                                    <img
                                                        src={variableValues[variable]}
                                                        alt={variable}
                                                        className="h-16 w-full rounded object-cover"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={variableValues[variable] || ""}
                                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                placeholder={variable}
                                                className="w-full rounded bg-slate-700 px-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Template Metadata at Bottom */}
                    <div className="border-t border-slate-700 p-4 space-y-3">
                        <div>
                            <label className="text-xs text-slate-500">Template Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full rounded bg-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="mt-1 w-full rounded bg-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                                disabled={!isNew}
                                className="mt-1 w-full rounded bg-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <option value="EMAIL">Email</option>
                                <option value="LANDING">Landing Page</option>
                                <option value="CHECKOUT">Checkout</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* CENTER - HTML Editor */}
                <div className="flex flex-1 flex-col border-r border-slate-700">
                    <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-2">
                        <FileCode className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-200">HTML Editor</span>
                        <span className="ml-auto rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
                            index.html
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="html"
                            value={body}
                            onChange={(value) => setBody(value || "")}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                padding: { top: 16 },
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                wordWrap: "on",
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>

                {/* RIGHT - Preview */}
                <div className="flex w-[500px] flex-col bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-200">Preview</span>
                        </div>
                        <div className="flex items-center gap-1 rounded-md bg-slate-700 p-0.5">
                            <button
                                onClick={() => setPreviewMode("desktop")}
                                className={`rounded px-2 py-1 text-xs ${previewMode === "desktop"
                                    ? "bg-slate-600 text-white"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <Monitor className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPreviewMode("mobile")}
                                className={`rounded px-2 py-1 text-xs ${previewMode === "mobile"
                                    ? "bg-slate-600 text-white"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                <Smartphone className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 items-start justify-center overflow-auto bg-slate-850 p-4 bg-[#1a1a1a]">
                        <div
                            className={`relative bg-white shadow-2xl transition-all duration-300 ${previewMode === "mobile"
                                ? "w-[375px] rounded-[2rem] border-4 border-slate-600"
                                : "w-full rounded"
                                }`}
                            style={{
                                minHeight: previewMode === "mobile" ? "667px" : "auto",
                            }}
                        >
                            {previewMode === "mobile" && (
                                <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-700" />
                            )}
                            <iframe
                                ref={iframeRef}
                                className={`h-full w-full ${previewMode === "mobile" ? "rounded-[1.5rem] pt-8" : "rounded"
                                    }`}
                                style={{
                                    minHeight: previewMode === "mobile" ? "667px" : "600px",
                                }}
                                title="Email Preview"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Picker Modal */}
            <AssetPickerModal
                isOpen={assetPickerOpen}
                onClose={() => {
                    setAssetPickerOpen(false);
                    setActiveVariable(null);
                }}
                onSelect={handleAssetSelect}
            />
        </div>
    );
}
