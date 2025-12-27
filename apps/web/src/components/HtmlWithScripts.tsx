"use client";

import { useEffect, useRef } from "react";

interface HtmlWithScriptsProps {
    html: string;
    className?: string;
}

export default function HtmlWithScripts({ html, className }: HtmlWithScriptsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Find all script tags that were injected but ignored by React
        const scripts = containerRef.current.querySelectorAll("script");

        scripts.forEach((oldScript) => {
            // 2. Create a new, "live" script element
            const newScript = document.createElement("script");

            // 3. Copy all attributes (src, type, id, etc.)
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });

            // 4. Copy the code inside the script
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));

            // 5. Append it to the document body to force execution
            // We perform this separately to ensure the browser sees it as a new action
            try {
                document.body.appendChild(newScript);
            } catch (e) {
                console.error("Error executing injected script:", e);
            }
        });

        // Cleanup: We don't remove the scripts because your page logic 
        // might rely on them persisting (like global event listeners).
    }, [html]);

    return (
        <div
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
