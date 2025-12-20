import { NextResponse } from "next/server";
import { getSupabaseAdmin, getPublicUrl } from "../../../lib/supabase";

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

        // Filter out folders and map to include public URLs
        const assets = (data || [])
            .filter((item) => item.id !== null) // Filter out folders
            .map((item) => ({
                id: item.id,
                name: item.name,
                url: getPublicUrl("assets", item.name),
                path: item.name,
                mimeType: item.metadata?.mimetype,
                size: item.metadata?.size,
                createdAt: item.created_at,
            }));

        return NextResponse.json({ assets });
    } catch (error) {
        console.error("List assets error:", error);
        return NextResponse.json(
            { error: "Failed to list assets: " + (error as Error).message },
            { status: 500 }
        );
    }
}
