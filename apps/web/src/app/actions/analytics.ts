"use server";

import { db } from "@repo/database";

interface TrackEventData {
    type: string;
    url: string;
    customerId?: string;
    meta?: any;
}

export async function trackEvent(data: TrackEventData) {
    try {
        await db.analyticsEvent.create({
            data: {
                type: data.type,
                url: data.url,
                customerId: data.customerId || null,
                meta: data.meta ? data.meta : undefined,
            },
        });
    } catch (error) {
        console.error("Failed to track event:", error);
        // Don't throw, just log. Analytics shouldn't break the app.
    }
}
