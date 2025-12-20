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

        // Extract campaignId from tags (safely check if tags is an array)
        let campaignId: string | null = null;

        // Resend may send tags as an array or as an object, handle both
        if (Array.isArray(data?.tags)) {
            const campaignIdTag = data.tags.find((t: any) => t.name === 'campaignId');
            campaignId = campaignIdTag?.value || null;
        } else if (typeof data?.tags === 'object' && data.tags !== null) {
            // Handle if tags is an object like { campaignId: "value" }
            campaignId = data.tags.campaignId || null;
        }

        if (!campaignId) {
            console.log(`[Analytics] Ignored ${type} - No Campaign ID. Tags received:`, JSON.stringify(data?.tags));
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Deduplication: Use email_id + event type to prevent double-counting
        // Resend provides email_id in the webhook payload
        const emailId = data?.email_id;
        const eventType = type === 'email.opened' ? 'EMAIL_OPEN' : 'EMAIL_CLICK';

        if (emailId) {
            // Check if we've already recorded this specific event for this email
            const existingEvent = await db.analyticsEvent.findFirst({
                where: {
                    campaignId: campaignId,
                    type: eventType,
                    meta: {
                        path: ['data', 'email_id'],
                        equals: emailId,
                    },
                },
            });

            if (existingEvent) {
                console.log(`[Analytics] Duplicate ${type} ignored for email ${emailId}`);
                return NextResponse.json({ success: true, deduplicated: true }, { status: 200 });
            }
        }

        await db.analyticsEvent.create({
            data: {
                type: eventType,
                url: type === 'email.clicked' && data.click?.link ? data.click.link : '',
                campaignId: campaignId,
                meta: body, // Store exact payload for debugging and deduplication
            }
        });
        console.log(`[Analytics] Tracked ${type} for Campaign ${campaignId}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

