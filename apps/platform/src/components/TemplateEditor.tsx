"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { createTemplate, updateTemplate } from "../app/actions/templates";
import { Save } from "lucide-react";

interface TemplateEditorProps {
    initialData?: {
        id: string;
        name: string;
        type: "EMAIL" | "LANDING" | "CHECKOUT";
        body: string;
    } | null;
}

export function TemplateEditor({ initialData }: TemplateEditorProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [type, setType] = useState<"EMAIL" | "LANDING" | "CHECKOUT">(
        initialData?.type || "EMAIL"
    );
    const [body, setBody] = useState(initialData?.body || "<h1>Hello World</h1>");
    const [isSaving, setIsSaving] = useState(false);

    const isNew = !initialData;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isNew) {
                const formData = new FormData();
                formData.append("name", name);
                formData.append("type", type);
                formData.append("body", body);
                await createTemplate(formData);
            } else {
                await updateTemplate(initialData.id, body);
            }
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase text-slate-500">
                            Template Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isNew}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. Welcome Email"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase text-slate-500">
                            Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            disabled={!isNew}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="EMAIL">Email</option>
                            <option value="LANDING">Landing Page</option>
                            <option value="CHECKOUT">Checkout</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : isNew ? "Create Template" : "Update Template"}
                </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={body}
                    onChange={(value) => setBody(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                    }}
                />
            </div>
        </div>
    );
}
