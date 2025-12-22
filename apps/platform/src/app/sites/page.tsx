import Link from "next/link";
import { Plus, Globe, Star, ChevronRight } from "lucide-react";
import { getConfigurations, createConfiguration } from "../actions/configurations";

export const dynamic = "force-dynamic";

export default async function SitesPage() {
    const sites = await getConfigurations();

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Sites</h1>
                    <p className="mt-1 text-slate-400">
                        Manage your microsites and landing pages
                    </p>
                </div>
            </div>

            {/* Create New Site Form */}
            <form action={createConfiguration} className="mb-8 rounded-lg border border-slate-700 bg-slate-800 p-4">
                <h2 className="mb-4 text-sm font-medium text-white">Create New Site</h2>
                <div className="flex gap-4">
                    <input
                        name="name"
                        placeholder="Site Name (e.g., Summer Sale)"
                        required
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                        name="slug"
                        placeholder="URL Slug (e.g., summer-sale)"
                        required
                        pattern="[a-z0-9-]+"
                        className="w-48 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                        <Plus className="h-4 w-4" />
                        Create
                    </button>
                </div>
            </form>

            {sites.length === 0 ? (
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
                    <Globe className="mx-auto h-12 w-12 text-slate-600" />
                    <p className="mt-4 text-slate-400">No sites yet. Create one above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sites.map((site) => (
                        <Link
                            key={site.id}
                            href={`/sites/${site.id}`}
                            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 transition-colors hover:border-slate-600 hover:bg-slate-700/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                                    <Globe className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{site.name}</span>
                                        {site.isDefault && (
                                            <span className="flex items-center gap-1 rounded bg-yellow-600/20 px-2 py-0.5 text-xs text-yellow-400">
                                                <Star className="h-3 w-3" /> Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400">/{site.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-400">
                                <span>{site._count.templates} templates</span>
                                <span>{site._count.navLinks} nav links</span>
                                <ChevronRight className="h-5 w-5" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
