"use server";

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import mustache from "mustache";
import { redirect } from "next/navigation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createCampaign(formData: FormData) {
    const name = formData.get("name") as string;
    const templateId = formData.get("templateId") as string;
    const journeyId = formData.get("journeyId") as string;

    if (!name || !templateId || !journeyId) {
        throw new Error("Missing required fields");
    }

    await db.campaign.create({
        data: {
            name,
            templateId,
            journeyId,
            status: "DRAFT",
        },
    });

    revalidatePath("/campaigns");
    redirect("/campaigns"); // Redirect to list view
}

export async function launchCampaign(campaignId: string) {
    console.log("Launching campaign:", campaignId);

    // 1. Fetch Campaign Details
    const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        include: {
            template: true,
            journey: true,
        },
    });

    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "SENT") throw new Error("Campaign already sent");

    // 2. Fetch Audience (All Customers for now)
    const customers = await db.customer.findMany();
    console.log(`Found ${customers.length} customers`);

    let sentCount = 0;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 3. Loop and Send
    for (const customer of customers) {
        try {
            // Construct personalized journey link
            // e.g. http://localhost:3000/flow/onboarding?cid=123
            const journeyUrl = `${baseUrl}/flow/${campaign.journey.slug}?cid=${customer.id}`;

            // Render Template
            // Context includes customer fields + journey_url
            // Context includes customer fields + journey_url
            const context = {
                ...customer, // Base customer fields
                name: customer.name || "Friend", // Override if needed or default
                email: customer.email,
                journey_url: journeyUrl,
            };

            const renderedBody = mustache.render(campaign.template.body, context);

            // Send via Resend
            const { error } = await resend.emails.send({
                from: "DreamPlay <updates@resend.dev>", // TODO: Configurable sender
                to: [customer.email],
                subject: `[Campaign] ${campaign.name}`,
                html: renderedBody,
            });

            if (error) {
                console.error(`Failed to send to ${customer.email}:`, error);
            } else {
                sentCount++;
            }

        } catch (err) {
            console.error(`Error processing customer ${customer.id}:`, err);
        }
    }

    // 4. Update Campaign Status
    await db.campaign.update({
        where: { id: campaignId },
        data: {
            status: "SENT",
            sentCount: sentCount,
        },
    });

    revalidatePath("/campaigns");
    // return { success: true, sentCount }; // Void return for action compatibility
}
