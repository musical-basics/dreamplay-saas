"use server";

import { Resend } from "resend";
import mustache from "mustache";

// Initialize Resend with API Key from env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestEmail(
    to: string,
    subject: string,
    templateBody: string,
    mockData: any
) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not defined");
    }

    // 1. Render the HTML body using Mustache
    const renderedBody = mustache.render(templateBody, mockData);

    // 2. Send via Resend
    const { data, error } = await resend.emails.send({
        from: "DreamPlay <onboarding@resend.dev>", // Default Resend Testing Domain
        to: [to], // In test mode, must be the account owner's email usually
        subject: subject,
        html: renderedBody,
    });

    if (error) {
        console.error("Resend Error:", error);
        throw new Error(error.message);
    }

    return { success: true, id: data?.id };
}
