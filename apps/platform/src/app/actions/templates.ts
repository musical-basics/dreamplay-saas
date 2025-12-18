"use server";

import { db } from "@repo/database";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTemplate(formData: FormData) {
    const name = formData.get("name") as string;
    const type = formData.get("type") as "EMAIL" | "LANDING" | "CHECKOUT";
    const body = formData.get("body") as string;

    await db.contentTemplate.create({
        data: {
            name,
            type,
            body,
        },
    });

    revalidatePath("/templates");
    redirect("/templates");
}

export async function updateTemplate(id: string, bodyContent: string) {
    await db.contentTemplate.update({
        where: { id },
        data: { body: bodyContent },
    });

    revalidatePath(`/templates/${id}`);
    revalidatePath("/templates");
}

export async function createTemplateFromJson(data: { name: string; type: "EMAIL" | "LANDING" | "CHECKOUT"; body: string }) {
    const newTemplate = await db.contentTemplate.create({
        data: {
            name: data.name,
            type: data.type,
            body: data.body,
        },
    });
    revalidatePath("/templates");
    return newTemplate;
}
