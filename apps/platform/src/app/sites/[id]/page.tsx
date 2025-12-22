import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash2, Star, ExternalLink, FileText, Menu } from "lucide-react";
import { getConfigurationById, updateConfiguration, createNavLink, deleteNavLink } from "../../actions/configurations";

export const dynamic = "force-dynamic";

interface PageProps {
    params: { id: string };
}

export default async function SiteDetailPage({ params }: PageProps) {
    const site = await getConfigurationById(params.id);

    if (!site) {
        notFound();
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link
                    href="/sites"
                    className="mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sites
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{site.name}</h1>
                            {site.isDefault && (
                                <span className="flex items-center gap-1 rounded bg-yellow-600/20 px-2 py-1 text-xs text-yellow-400">
                                    <Star className="h-3 w-3" /> Default Site
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-slate-400">/{site.slug}</p>
                    </div>
                    <div className="flex gap-3">
                        {!site.isDefault && (
                            <form action={async () => {
                                "use server";
                                await updateConfiguration(site.id, { isDefault: true });
                            }}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                                >
                                    <Star className="h-4 w-4" />
                                    Set as Default
                                </button>
                            </form>
                        )}
                        <a
                            href={`/${site.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Visit Site
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Templates Section */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-medium text-white">
                            <FileText className="h-5 w-5 text-blue-400" />
                            Templates ({site.templates.length})
                        </h2>
                        <Link
                            href={`/templates/new?configurationId=${site.id}&type=LANDING`}
                            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                        >
                            <Plus className="h-4 w-4" />
                            Add Template
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {site.templates.length === 0 ? (
                            <p className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-400">
                                No templates yet
                            </p>
                        ) : (
                            site.templates.map((template) => (
                                <Link
                                    key={template.id}
                                    href={`/templates/${template.id}`}
                                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3 transition-colors hover:border-slate-600"
                                >
                                    <div>
                                        <span className="font-medium text-white">{template.name}</span>
                                        <span className="ml-2 text-sm text-slate-400">/{template.slug}</span>
                                    </div>
                                    <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                                        {template.type}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Navigation Links Section */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <h2 className="flex items-center gap-2 text-lg font-medium text-white">
                            <Menu className="h-5 w-5 text-green-400" />
                            Nav Links ({site.navLinks.length})
                        </h2>
                    </div>

                    {/* Add Nav Link Form */}
                    <form action={createNavLink.bind(null, site.id)} className="mb-4 rounded-lg border border-slate-700 bg-slate-800 p-3">
                        <div className="flex gap-2">
                            <input
                                name="label"
                                placeholder="Label"
                                required
                                className="flex-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white placeholder-slate-400"
                            />
                            <input
                                name="url"
                                placeholder="URL (e.g., /about)"
                                required
                                className="flex-1 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white placeholder-slate-400"
                            />
                            <button
                                type="submit"
                                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500"
                            >
                                Add
                            </button>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {site.navLinks.length === 0 ? (
                            <p className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center text-slate-400">
                                No nav links yet
                            </p>
                        ) : (
                            site.navLinks.map((link) => (
                                <div
                                    key={link.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3"
                                >
                                    <div>
                                        <span className="font-medium text-white">{link.label}</span>
                                        <span className="ml-2 text-sm text-slate-400">{link.url}</span>
                                    </div>
                                    <form action={async () => {
                                        "use server";
                                        await deleteNavLink(link.id, site.id);
                                    }}>
                                        <button
                                            type="submit"
                                            className="rounded p-1 text-slate-400 hover:bg-red-600/20 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
