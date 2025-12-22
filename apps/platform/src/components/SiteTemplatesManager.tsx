"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Plus, ArrowRight, X, GripVertical } from "lucide-react";
import { assignTemplateToConfiguration, removeTemplateFromConfiguration } from "../app/actions/configurations";

interface Template {
    id: string;
    name: string;
    slug: string;
    type: string;
}

interface SiteTemplatesManagerProps {
    siteId: string;
    siteName: string;
    siteTemplates: Template[];
    availableTemplates: Template[];
}

export function SiteTemplatesManager({
    siteId,
    siteName,
    siteTemplates,
    availableTemplates,
}: SiteTemplatesManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [showAvailable, setShowAvailable] = useState(false);

    const handleAssign = (templateId: string) => {
        startTransition(async () => {
            await assignTemplateToConfiguration(templateId, siteId);
        });
    };

    const handleRemove = (templateId: string) => {
        if (confirm("Remove this template from this site? It will be moved to the Default Site.")) {
            startTransition(async () => {
                await removeTemplateFromConfiguration(templateId, siteId);
            });
        }
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-medium text-white">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Templates ({siteTemplates.length})
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAvailable(!showAvailable)}
                        className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                    >
                        <Plus className="h-4 w-4" />
                        {showAvailable ? "Hide Available" : "Add Existing"}
                    </button>
                    <Link
                        href={`/templates/new?configurationId=${siteId}&type=LANDING`}
                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                    >
                        <Plus className="h-4 w-4" />
                        Create New
                    </Link>
                </div>
            </div>

            {/* Available Templates Panel */}
            {showAvailable && (
                <div className="mb-4 rounded-lg border border-green-600/30 bg-green-900/10 p-4">
                    <h3 className="mb-3 text-sm font-medium text-green-400">
                        Available Templates ({availableTemplates.length})
                    </h3>
                    {availableTemplates.length === 0 ? (
                        <p className="text-sm text-slate-400">No templates available to add</p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {availableTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-slate-500" />
                                        <div>
                                            <span className="text-sm font-medium text-white">{template.name}</span>
                                            <span className="ml-2 text-xs text-slate-400">/{template.slug}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(template.id)}
                                        disabled={isPending}
                                        className="flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-500 disabled:opacity-50"
                                    >
                                        <ArrowRight className="h-3 w-3" />
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Current Site Templates */}
            <div className="space-y-2">
                {siteTemplates.length === 0 ? (
                    <p className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-400">
                        No templates yet. Add existing templates or create a new one.
                    </p>
                ) : (
                    siteTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3 transition-colors hover:border-slate-600"
                        >
                            <Link href={`/templates/${template.id}`} className="flex-1">
                                <span className="font-medium text-white">{template.name}</span>
                                <span className="ml-2 text-sm text-slate-400">/{template.slug}</span>
                            </Link>
                            <div className="flex items-center gap-2">
                                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                                    {template.type}
                                </span>
                                <button
                                    onClick={() => handleRemove(template.id)}
                                    disabled={isPending}
                                    className="rounded p-1 text-slate-400 hover:bg-red-600/20 hover:text-red-400 disabled:opacity-50"
                                    title="Remove from site"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
