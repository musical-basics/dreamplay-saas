import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getPublicUrl } from "../../../lib/supabase";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "Only image files are allowed" },
                { status: 400 }
            );
        }

        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size exceeds 50MB limit" },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename with original extension
        const ext = file.name.split(".").pop() || "png";
        const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

        // Upload to Supabase Storage
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.storage
            .from("assets")
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // Get the public URL
        const publicUrl = getPublicUrl("assets", data.path);

        return NextResponse.json({
            success: true,
            asset: {
                id: data.path,
                name: file.name,
                url: publicUrl,
                path: data.path,
                mimeType: file.type,
                size: file.size,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed: " + (error as Error).message },
            { status: 500 }
        );
    }
}
