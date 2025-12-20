import { db } from "@repo/database";
import { createJourney } from "../actions/journeys";
import { Plus, Map, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JourneysPage() {
    const journeys = await db.journey.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { steps: true },
            },
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Journeys</h1>
                    <p className="text-sm text-slate-500">Create multi-step flows</p>
                </div>
            </div>

            {/* Create New Journey Form */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase text-slate-500">
                    Start a New Journey
                </h2>
                <form action={createJourney} className="flex gap-4">
                    <input
                        name="name"
                        placeholder="Journey Name (e.g. Welcome Series)"
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                    />
                    <button
                        type="submit"
                        className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Journey
                    </button>
                </form>
            </div>

            {/* Journeys Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {journeys.map((journey) => (
                    <Link
                        key={journey.id}
                        href={`/journeys/${journey.id}`}
                        className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                    <Map className="h-6 w-6" />
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${journey.status === "ACTIVE"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-slate-100 text-slate-800"
                                        }`}
                                >
                                    {journey.status}
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                                {journey.name}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                /{journey.slug}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-sm font-medium text-slate-600">
                                {journey._count.steps} Steps
                            </span>
                            <div className="flex items-center gap-3">
                                <a
                                    href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/flow/${journey.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
                                    title="View Journey"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <span className="flex items-center text-sm font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                                    Edit Builder <ArrowRight className="ml-1 h-4 w-4" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
                {journeys.length === 0 && (
                    <div className="col-span-full rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
                        <Map className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No journeys</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by creating a new journey above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
