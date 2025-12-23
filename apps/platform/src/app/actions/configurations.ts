"use server";

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getConfigurations() {
    return db.configuration.findMany({
        include: {
            _count: {
                select: { templates: true, navLinks: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function createConfiguration(formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    await db.configuration.create({
        data: {
            name,
            slug,
            isDefault: false,
        },
    });

    revalidatePath("/sites");
    redirect("/sites");
}

export async function getConfigurationById(id: string) {
    const config = await db.configuration.findUnique({
        where: { id },
        include: {
            templates: {
                include: {
                    template: true,
                },
                orderBy: { createdAt: "desc" },
            },
            navLinks: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!config) return null;

    // Transform to flatten the junction table
    return {
        ...config,
        templates: config.templates.map((ct: any) => ct.template),
    };
}

export async function updateConfiguration(id: string, data: { name?: string; slug?: string; isDefault?: boolean }) {
    // If setting as default, unset other defaults first
    if (data.isDefault) {
        await db.configuration.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
        });
    }

    await db.configuration.update({
        where: { id },
        data,
    });

    revalidatePath("/sites");
    revalidatePath(`/sites/${id}`);
}

export async function deleteConfiguration(id: string) {
    // Delete all junction records first (cascade should handle this, but be explicit)
    await (db as any).configurationTemplate.deleteMany({
        where: { configurationId: id },
    });

    // Delete nav links
    await db.navLink.deleteMany({
        where: { configurationId: id },
    });

    // Delete the configuration
    await db.configuration.delete({
        where: { id },
    });

    revalidatePath("/sites");
    redirect("/sites");
}

export async function createNavLink(configurationId: string, formData: FormData) {
    const label = formData.get("label") as string;
    const url = formData.get("url") as string;
    const forceRefresh = formData.get("forceRefresh") === "on";

    // Get the highest order number
    const lastLink = await db.navLink.findFirst({
        where: { configurationId },
        orderBy: { order: "desc" },
    });

    await db.navLink.create({
        data: {
            label,
            url,
            order: (lastLink?.order || 0) + 1,
            forceRefresh,
            configurationId,
        },
    });

    revalidatePath(`/sites/${configurationId}`);
}

export async function deleteNavLink(id: string, configurationId: string) {
    await db.navLink.delete({
        where: { id },
    });

    revalidatePath(`/sites/${configurationId}`);
}

export async function updateNavLink(id: string, configurationId: string, data: { forceRefresh?: boolean }) {
    await db.navLink.update({
        where: { id },
        data,
    });

    revalidatePath(`/sites/${configurationId}`);
}

export async function getAvailableTemplates(excludeConfigurationId: string) {
    // Get all LANDING and CHECKOUT templates that are NOT already in this configuration
    const allTemplates = await db.contentTemplate.findMany({
        where: {
            type: { in: ["LANDING", "CHECKOUT"] },
        },
        include: {
            configurations: {
                where: { configurationId: excludeConfigurationId },
            },
        },
        orderBy: { name: "asc" },
    });

    // Filter to only templates not in this configuration
    return allTemplates.filter((t: any) => t.configurations.length === 0);
}

export async function assignTemplateToConfiguration(templateId: string, configurationId: string) {
    // Create junction record (idempotent - will fail silently if already exists due to unique constraint)
    try {
        await (db as any).configurationTemplate.create({
            data: {
                templateId,
                configurationId,
            },
        });
    } catch (e: any) {
        // Ignore unique constraint violation
        if (!e.code || e.code !== "P2002") {
            throw e;
        }
    }

    revalidatePath(`/sites/${configurationId}`);
    revalidatePath("/sites");
    revalidatePath("/templates");
}

export async function removeTemplateFromConfiguration(templateId: string, configurationId: string) {
    // Delete the junction record
    await (db as any).configurationTemplate.deleteMany({
        where: {
            templateId,
            configurationId,
        },
    });

    revalidatePath(`/sites/${configurationId}`);
    revalidatePath("/sites");
    revalidatePath("/templates");
}
