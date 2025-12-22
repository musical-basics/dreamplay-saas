import { db } from "@repo/database";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
    const emails = await db.contentTemplate.findMany({
        where: { type: "EMAIL" },
        orderBy: { updatedAt: "desc" },
    });

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Email Templates</h1>
                    <p className="mt-1 text-slate-400">
                        Manage your email templates for campaigns
                    </p>
                </div>
                <Link
                    href="/templates/new?type=EMAIL"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                    <Plus className="h-4 w-4" />
                    New Email
                </Link>
            </div>

            {emails.length === 0 ? (
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
                    <p className="text-slate-400">No email templates yet.</p>
                    <Link
                        href="/templates/new?type=EMAIL"
                        className="mt-4 inline-block text-blue-400 hover:underline"
                    >
                        Create your first email template
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {emails.map((email) => (
                        <div
                            key={email.id}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium text-white">{email.name}</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        /{email.slug}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/templates/${email.id}`}
                                        className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-slate-500">
                                Updated {new Date(email.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
