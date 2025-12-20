"use server";

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";

/**
 * Get all assets from the database
 */
export async function getAssets() {
    const assets = await db.asset.findMany({
        orderBy: { createdAt: "desc" },
    });
    return assets;
}

/**
 * Create a new asset record
 */
export async function createAsset(data: {
    name: string;
    url: string;
    mimeType?: string;
    size?: number;
}) {
    const asset = await db.asset.create({
        data: {
            name: data.name,
            url: data.url,
            mimeType: data.mimeType,
            size: data.size,
        },
    });
    revalidatePath("/templates");
    return asset;
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: string) {
    await db.asset.delete({
        where: { id },
    });
    revalidatePath("/templates");
}
