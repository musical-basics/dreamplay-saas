"use server";

import { db } from "@repo/database";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTemplate(formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as "EMAIL" | "LANDING" | "CHECKOUT";
    const body = formData.get("body") as string;
    const previewDataStr = formData.get("previewData") as string;

    let previewData = {};
    if (previewDataStr) {
        try {
            previewData = JSON.parse(previewDataStr);
        } catch (e) {
            console.error("Failed to parse previewData", e);
        }
    }

    await db.contentTemplate.create({
        data: {
            name,
            slug,
            type,
            body,
            previewData,
        } as any,
    });

    revalidatePath("/templates");
    redirect("/templates");
}

export async function updateTemplate(id: string, data: { body?: string; slug?: string; name?: string; type?: "EMAIL" | "LANDING" | "CHECKOUT"; previewData?: any }) {
    await db.contentTemplate.update({
        where: { id },
        data: data as any,
    });

    revalidatePath(`/templates/${id}`);
    revalidatePath("/templates");
}

export async function createTemplateFromJson(data: { name: string; slug: string; type: "EMAIL" | "LANDING" | "CHECKOUT"; body: string }) {
    const newTemplate = await db.contentTemplate.create({
        data: {
            name: data.name,
            slug: data.slug,
            type: data.type,
            body: data.body,
        },
    });
    revalidatePath("/templates");
    return newTemplate;
}
