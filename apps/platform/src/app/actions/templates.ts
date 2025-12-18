"use server";

import { db } from "@repo/database";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTemplate(formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const type = formData.get("type") as "EMAIL" | "LANDING" | "CHECKOUT";
    const body = formData.get("body") as string;

    await db.contentTemplate.create({
        data: {
            name,
            slug,
            type,
            body,
        },
    });

    revalidatePath("/templates");
    redirect("/templates");
}

export async function updateTemplate(id: string, data: { body?: string; slug?: string; name?: string; type?: "EMAIL" | "LANDING" | "CHECKOUT" }) {
    await db.contentTemplate.update({
        where: { id },
        data: data,
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
