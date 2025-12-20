import { createClient } from "@supabase/supabase-js";

// Admin client with service role key for full bucket access
// Used for server-side operations (uploads, deletes, listing)
export function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
        );
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Get public URL for a file in a bucket
export function getPublicUrl(bucket: string, path: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
