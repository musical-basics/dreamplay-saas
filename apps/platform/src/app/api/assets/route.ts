import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase";

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        // List all files in the assets bucket
        const { data, error } = await supabase.storage
            .from("assets")
            .list("", {
                limit: 100,
                offset: 0,
                sortBy: { column: "created_at", order: "desc" },
            });

        if (error) {
            console.error("Supabase list error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        console.log("Raw storage list response:", JSON.stringify(data, null, 2));

        // Filter out folders (items without an id) and .emptyFolderPlaceholder files
        const files = (data || []).filter(
            (item) => item.id !== null && !item.name.startsWith(".")
        );

        // Map to include public URLs using Supabase's getPublicUrl method
        const assets = files.map((item) => {
            const { data: urlData } = supabase.storage
                .from("assets")
                .getPublicUrl(item.name);

            return {
                id: item.id,
                name: item.name,
                url: urlData.publicUrl,
                path: item.name,
                mimeType: item.metadata?.mimetype,
                size: item.metadata?.size,
                createdAt: item.created_at,
            };
        });

        console.log("Returning assets:", assets.length);

        return NextResponse.json({ assets });
    } catch (error) {
        console.error("List assets error:", error);
        return NextResponse.json(
            { error: "Failed to list assets: " + (error as Error).message },
            { status: 500 }
        );
    }
}

