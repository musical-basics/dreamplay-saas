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
    const audience = (formData.get("audience") as string) || "ALL";

    if (!name || !templateId || !journeyId) {
        throw new Error("Missing required fields");
    }

    await db.campaign.create({
        data: {
            name,
            templateId,
            journeyId,
            audience,
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

    // 2. Fetch Audience
    const allCustomers = await db.customer.findMany();
    let customers = allCustomers;

    if (campaign.audience === "TEST_GROUP") {
        customers = allCustomers.filter(c =>
            c.email.endsWith("@musicalbasics.com") ||
            c.email.endsWith("@dreamplaypianos.com")
        );
        console.log(`Test Group: Filtered ${allCustomers.length} down to ${customers.length} recipients.`);
    }

    console.log(`Sending to ${customers.length} customers...`);

    let sentCount = 0;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 3. Loop and Send (Sequential with Delay)
    for (const customer of customers) {
        // Rate Limiting: 500ms delay to prevent 429s from Resend
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Construct personalized journey link
            const journeyUrl = `${baseUrl}/flow/${campaign.journey.slug}?cid=${customer.id}`;

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
                from: "DreamPlay <hello@dreamplaypianos.com>",
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

export async function duplicateCampaign(campaignId: string) {
    const original = await db.campaign.findUnique({
        where: { id: campaignId },
    });

    if (!original) throw new Error("Campaign not found");

    await db.campaign.create({
        data: {
            name: `Copy of ${original.name}`,
            templateId: original.templateId,
            journeyId: original.journeyId,
            audience: original.audience,
            status: "DRAFT",
        },
    });

    revalidatePath("/campaigns");
    redirect("/campaigns");
}
