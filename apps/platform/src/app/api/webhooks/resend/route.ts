import { db } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Resend sends an array of events or a single event, usually a single event per hook
        // but let's handle single object for now based on standard docs
        const { type, data } = body;

        // Ensure it's an event we care about
        if (type !== 'email.opened' && type !== 'email.clicked') {
            return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
        }

        // Extract campaignId from tags
        const campaignIdTag = data.tags?.find((t: any) => t.name === 'campaignId');
        const campaignId = campaignIdTag ? campaignIdTag.value : null;

        if (campaignId) {
            await db.analyticsEvent.create({
                data: {
                    type: type === 'email.opened' ? 'EMAIL_OPEN' : 'EMAIL_CLICK',
                    url: type === 'email.clicked' ? data.click.link : '', // Store clicked link if available
                    campaignId: campaignId,
                    meta: body, // Store exact payload for debugging
                }
            });
            console.log(`[Analytics] Tracked ${type} for Campaign ${campaignId}`);
        } else {
            console.log(`[Analytics] Ignored ${type} - No Campaign ID`);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
