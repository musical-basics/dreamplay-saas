import Link from "next/link";
import { db } from "@repo/database";
import { Plus, Edit, ExternalLink, Copy } from "lucide-react";
import { deleteTemplate, duplicateTemplate } from "../actions/templates";
import { DeleteTemplateButton } from "../../components/DeleteTemplateButton";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
    const templates = await db.contentTemplate.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Content Templates</h1>
                <Link
                    href="/templates/new"
                    className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                </Link>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Type
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {templates.map((template) => (
                            <tr key={template.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                    {template.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                                        {template.type}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {template.type !== "EMAIL" && (
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${template.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                title="View Template"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                        <Link
                                            href={`/templates/${template.id}`}
                                            className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                                            title="Edit Template"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                        <form action={duplicateTemplate.bind(null, template.id)}>
                                            <button
                                                type="submit"
                                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                title="Duplicate Template"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </form>
                                        <DeleteTemplateButton
                                            templateName={template.name}
                                            deleteAction={deleteTemplate.bind(null, template.id)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-6 py-12 text-center text-sm text-slate-500"
                                >
                                    No templates found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

