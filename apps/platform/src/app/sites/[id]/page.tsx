import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, ExternalLink, Menu } from "lucide-react";
import { getConfigurationById, updateConfiguration, createNavLink, getAvailableTemplates } from "../../actions/configurations";
import { SiteTemplatesManager } from "../../../components/SiteTemplatesManager";
import { NavLinkRow } from "../../../components/NavLinkRow";

export const dynamic = "force-dynamic";

interface PageProps {
    params: { id: string };
}

export default async function SiteDetailPage({ params }: PageProps) {
    const site = await getConfigurationById(params.id);
    const availableTemplates = await getAvailableTemplates(params.id);

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
                            href={`${process.env.NEXT_PUBLIC_WEB_URL || 'https://dreamplay-saas-web.vercel.app'}/${site.slug}`}
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
                {/* Templates Section - Client Component */}
                <SiteTemplatesManager
                    siteId={site.id}
                    siteName={site.name}
                    siteTemplates={site.templates.map(t => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        type: t.type,
                    }))}
                    availableTemplates={availableTemplates.map(t => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        type: t.type,
                    }))}
                />

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
                            <label className="flex items-center gap-1 text-xs text-slate-400" title="Force full page reload for script-heavy pages">
                                <input
                                    name="forceRefresh"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-700"
                                />
                                Hard Refresh
                            </label>
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
                            site.navLinks.map((link: any) => (
                                <NavLinkRow
                                    key={link.id}
                                    link={{
                                        id: link.id,
                                        label: link.label,
                                        url: link.url,
                                        forceRefresh: link.forceRefresh || false,
                                    }}
                                    siteId={site.id}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
