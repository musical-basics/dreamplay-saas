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
    return db.configuration.findUnique({
        where: { id },
        include: {
            templates: {
                orderBy: { updatedAt: "desc" },
            },
            navLinks: {
                orderBy: { order: "asc" },
            },
        },
    });
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
    // First, unassign all templates (set configurationId to null)
    await db.contentTemplate.updateMany({
        where: { configurationId: id },
        data: { configurationId: null },
    });

    // Delete nav links (cascade should handle this, but be explicit)
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
