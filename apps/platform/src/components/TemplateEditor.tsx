"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { createTemplate, updateTemplate } from "../app/actions/templates";
import { Save } from "lucide-react";

interface TemplateEditorProps {
    initialData?: {
        id: string;
        name: string;
        slug: string;
        type: "EMAIL" | "LANDING" | "CHECKOUT";
        body: string;
    } | null;
}

export function TemplateEditor({ initialData }: TemplateEditorProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
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
            // Dynamically import to ensure server action is handled correctly if needed, though direct import usually works in Next.js
            const { sendTestEmail } = await import("../app/actions/email");

            const mockData = {
                name: "Test User",
                journey_url: "http://localhost:3000/flow/demo",
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
                            // disabled={!isNew} // Allow editing name
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. Welcome Email"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase text-slate-500">
                            Slug
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. welcome-email"
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
                <div className="flex items-center gap-2">
                    {type === "EMAIL" && (
                        <button
                            onClick={handleSendTest}
                            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50"
                        >
                            Send Test
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : isNew ? "Create Template" : "Update Template"}
                    </button>
                </div>
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
