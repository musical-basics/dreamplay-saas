import { db } from "@repo/database";
import Link from "next/link";
import { Plus, Send, CheckCircle } from "lucide-react";
import { launchCampaign } from "../actions/campaigns";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
    const campaigns = await db.campaign.findMany({
        orderBy: { createdAt: "desc" },
        include: { template: true, journey: true },
    });

    return (
        <div className="flex h-screen flex-col bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">
                <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
                <Link
                    href="/campaigns/new"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    New Campaign
                </Link>
            </div>

            <div className="p-8">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Name</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Template</th>
                                <th className="px-6 py-3 font-semibold">Journey</th>
                                <th className="px-6 py-3 font-semibold">Sent</th>
                                <th className="px-6 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {campaign.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${campaign.status === "SENT"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{campaign.template.name}</td>
                                    <td className="px-6 py-4">{campaign.journey.name}</td>
                                    <td className="px-6 py-4">{campaign.sentCount}</td>
                                    <td className="px-6 py-4">
                                        {campaign.status === "DRAFT" && (
                                            <form action={launchCampaign.bind(null, campaign.id)}>
                                                <button className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                                                    <Send className="h-3 w-3" />
                                                    Launch
                                                </button>
                                            </form>
                                        )}
                                        {campaign.status === "SENT" && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>Done</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No campaigns yet. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
