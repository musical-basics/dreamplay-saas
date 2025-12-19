"use client";

import { Send } from "lucide-react";
import { launchCampaign } from "../app/actions/campaigns";
import { useTransition } from "react";

interface LaunchButtonProps {
    campaignId: string;
    campaignName: string;
    audience: string;
}

export function LaunchButton({ campaignId, campaignName, audience }: LaunchButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleLaunch = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to launch "${campaignName}" to ${audience}? This cannot be undone.`
        );

        if (confirmed) {
            startTransition(async () => {
                await launchCampaign(campaignId);
            });
        }
    };

    return (
        <button
            onClick={handleLaunch}
            disabled={isPending}
            className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
            <Send className="h-3 w-3" />
            {isPending ? "Sending..." : "Launch"}
        </button>
    );
}
