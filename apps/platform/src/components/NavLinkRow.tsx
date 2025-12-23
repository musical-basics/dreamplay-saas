"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { updateNavLink, deleteNavLink } from "../app/actions/configurations";

interface NavLinkRowProps {
    link: {
        id: string;
        label: string;
        url: string;
        forceRefresh: boolean;
    };
    siteId: string;
}

export function NavLinkRow({ link, siteId }: NavLinkRowProps) {
    const [isPending, startTransition] = useTransition();
    const [forceRefresh, setForceRefresh] = useState(link.forceRefresh);

    const handleToggle = () => {
        const newValue = !forceRefresh;
        setForceRefresh(newValue);
        startTransition(async () => {
            await updateNavLink(link.id, siteId, { forceRefresh: newValue });
        });
    };

    const handleDelete = () => {
        if (confirm("Delete this nav link?")) {
            startTransition(async () => {
                await deleteNavLink(link.id, siteId);
            });
        }
    };

    return (
        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
            <div className="flex items-center gap-2">
                <span className="font-medium text-white">{link.label}</span>
                <span className="text-sm text-slate-400">{link.url}</span>
            </div>
            <div className="flex items-center gap-3">
                <label
                    className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer"
                    title="Force full page reload for script-heavy pages"
                >
                    <input
                        type="checkbox"
                        checked={forceRefresh}
                        onChange={handleToggle}
                        disabled={isPending}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-700 accent-orange-500"
                    />
                    Hard Refresh
                </label>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded p-1 text-slate-400 hover:bg-red-600/20 hover:text-red-400 disabled:opacity-50"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
