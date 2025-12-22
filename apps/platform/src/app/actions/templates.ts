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
    const configurationId = formData.get("configurationId") as string | null;

    let previewData = {};
    if (previewDataStr) {
        try {
            previewData = JSON.parse(previewDataStr);
        } catch (e) {
            console.error("Failed to parse previewData", e);
        }
    }

    try {
        // Create the template
        const template = await db.contentTemplate.create({
            data: {
                name,
                slug,
                type,
                body,
                previewData,
            } as any,
        });

        // If configurationId provided, link it to that site
        // Otherwise, link to default site for LANDING/CHECKOUT templates
        if (type === "LANDING" || type === "CHECKOUT") {
            let targetConfigId = configurationId;
            if (!targetConfigId) {
                const defaultConfig = await db.configuration.findFirst({
                    where: { isDefault: true },
                });
                targetConfigId = defaultConfig?.id || null;
            }

            if (targetConfigId) {
                await (db as any).configurationTemplate.create({
                    data: {
                        templateId: template.id,
                        configurationId: targetConfigId,
                    },
                });
            }
        }

        revalidatePath("/templates");
        revalidatePath("/sites");
    } catch (error) {
        console.error("FATAL: Failed to create template:", error);
        throw error;
    }
    redirect("/templates");
}

export async function updateTemplate(id: string, data: { body?: string; slug?: string; name?: string; type?: "EMAIL" | "LANDING" | "CHECKOUT"; previewData?: any }) {
    try {
        console.log("Updating template with data:", JSON.stringify(data, null, 2));
        await db.contentTemplate.update({
            where: { id },
            data: data as any,
        });

        revalidatePath(`/templates/${id}`);
        revalidatePath("/templates");
    } catch (error) {
        console.error("FATAL: Failed to update template:", error);
        throw error;
    }
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

export async function deleteTemplate(id: string) {
    // First, remove template from any junction records
    await (db as any).configurationTemplate.deleteMany({
        where: { templateId: id },
    });

    // Remove from any journey steps
    await db.journeyStep.deleteMany({
        where: { templateId: id },
    });

    // Delete the template
    await db.contentTemplate.delete({
        where: { id },
    });

    revalidatePath("/templates");
    revalidatePath("/emails");
    revalidatePath("/sites");
}

export async function duplicateTemplate(id: string) {
    // Get the original template with its configurations
    const original = await db.contentTemplate.findUnique({
        where: { id },
        include: {
            configurations: true,
        },
    });

    if (!original) {
        throw new Error("Template not found");
    }

    // Generate a unique slug
    const baseSlug = `${original.slug}-copy`;
    let newSlug = baseSlug;
    let counter = 1;

    // Check if slug exists and increment until unique
    while (true) {
        const existing = await db.contentTemplate.findFirst({
            where: { slug: newSlug },
        });
        if (!existing) break;
        newSlug = `${baseSlug}-${counter}`;
        counter++;
    }

    // Create the duplicate
    const newTemplate = await db.contentTemplate.create({
        data: {
            name: `${original.name} (Copy)`,
            slug: newSlug,
            type: original.type,
            body: original.body,
            previewData: original.previewData || undefined,
        } as any,
    });

    // Copy junction records to link to same configurations
    for (const config of (original as any).configurations) {
        await (db as any).configurationTemplate.create({
            data: {
                templateId: newTemplate.id,
                configurationId: config.configurationId,
            },
        });
    }

    revalidatePath("/templates");
    revalidatePath("/emails");
    revalidatePath("/sites");
}
