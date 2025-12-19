"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { trackEvent } from "../app/actions/analytics";

export default function AnalyticsTracker() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const initialized = useRef(false);

    useEffect(() => {
        // Only run once per navigation (Pathname change)
        // React Strict Mode might run this twice in dev, so we can use a ref or just accept it.
        // However, useEffect dependencies [pathname, searchParams] handle navigation.

        const track = async () => {
            let cid = searchParams.get("cid");

            // 1. Persistence Logic (Cookie)
            if (cid) {
                document.cookie = `customer_id=${cid}; path=/; max-age=31536000`; // 1 year
            } else {
                // Try to recover from cookie
                const match = document.cookie.match(new RegExp('(^| )customer_id=([^;]+)'));
                if (match) cid = match[2];
            }

            // 2. Track Event
            const fullUrl = window.location.href;
            await trackEvent({
                type: "VIEW",
                url: fullUrl,
                customerId: cid || undefined,
                meta: {
                    userAgent: navigator.userAgent,
                    pathname
                }
            });
        };

        track();
    }, [pathname, searchParams]);

    return null; // Invisible component
}
