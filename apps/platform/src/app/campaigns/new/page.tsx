import { db } from "@repo/database";
import { createCampaign } from "../../actions/campaigns";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
    // Fetch available templates (EMAIL only) and journeys
    const emailTemplates = await db.contentTemplate.findMany({
        where: { type: "EMAIL" },
        orderBy: { name: "asc" },
    });

    const journeys = await db.journey.findMany({
        where: { status: "ACTIVE" }, // Only active journeys
        orderBy: { name: "asc" },
    });

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-bold text-slate-900">Create Campaign</h1>

                <form action={createCampaign} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700">
                            Campaign Name
                        </label>
                        <input
                            name="name"
                            id="name"
                            required
                            placeholder="e.g. Beta Launch"
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="templateId" className="text-sm font-medium text-slate-700">
                            Email Template
                        </label>
                        <select
                            name="templateId"
                            id="templateId"
                            required
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select a template...</option>
                            {emailTemplates.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="audience" className="text-sm font-medium text-slate-700">
                            Target Audience
                        </label>
                        <select
                            name="audience"
                            id="audience"
                            required
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="ALL">All Customers</option>
                            <option value="TEST_GROUP">Test Group (Internal Only)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="journeyId" className="text-sm font-medium text-slate-700">
                            Target Journey
                        </label>
                        <select
                            name="journeyId"
                            id="journeyId"
                            required
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select a journey...</option>
                            {journeys.map((j) => (
                                <option key={j.id} value={j.id}>
                                    {j.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500">
                            This journey will be linked in the email via {"{{journey_url}}"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        {/* Cancel Link/Button could go here */}
                        <button
                            type="submit"
                            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Create Draft
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
