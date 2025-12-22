"use client";

import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
    templateName: string;
    deleteAction: () => Promise<void>;
}

export function DeleteTemplateButton({ templateName, deleteAction }: DeleteButtonProps) {
    const handleDelete = async () => {
        if (confirm(`Delete "${templateName}"? This cannot be undone.`)) {
            await deleteAction();
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Delete Template"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
