import { db } from "@repo/database";
import { notFound } from "next/navigation";
import mustache from "mustache";
import Navbar from "../../components/Navbar";
import HtmlWithScripts from "../../components/HtmlWithScripts";

export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        slug?: string[];
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params, searchParams }: PageProps) {
    const slugArray = params.slug || [];

    // 1. Determine Configuration and Page Slug
    let configuration: any = null;
    let pageSlug = "home";

    if (slugArray.length > 0) {
        // Check if first segment is a configuration slug
        const possibleConfigSlug = slugArray[0];
        configuration = await db.configuration.findUnique({
            where: { slug: possibleConfigSlug },
            include: { navLinks: { orderBy: { order: "asc" } } },
        });

        if (configuration) {
            // First segment was a config - rest is the page slug
            // If slice is empty, join returns "", so we default to "home"
            pageSlug = slugArray.slice(1).join("/") || "home";
        } else {
            // Not a config - use full path as page slug
            pageSlug = slugArray.join("/");
        }
    }

    // 2. If no configuration found, load the default
    if (!configuration) {
        configuration = await db.configuration.findFirst({
            where: { isDefault: true },
            include: { navLinks: { orderBy: { order: "asc" } } },
        });
    }

    // 3. Fetch Template (via junction table - template must be linked to this configuration)
    let template: any = null;

    if (configuration) {
        // Look for template linked to this configuration via junction table
        const junction = await (db as any).configurationTemplate.findFirst({
            where: {
                configurationId: configuration.id,
                template: {
                    slug: pageSlug,
                },
            },
            include: {
                template: true,
            },
        });
        template = junction?.template || null;
    }

    // 4. If not found in junction, try finding template by slug directly (fallback)
    if (!template) {
        template = await db.contentTemplate.findFirst({
            where: {
                slug: pageSlug,
                type: { in: ["LANDING", "CHECKOUT"] },
            },
        });
    }

    if (!template) {
        notFound();
    }

    // 5. Context Merging
    let data: any = {
        ...searchParams,
        nav_links: configuration?.navLinks || [],
        site_name: configuration?.name || "Default Site",
    };

    // 6. Customer Lookup
    const customerId = searchParams.customerId as string;
    if (customerId) {
        const customer = await db.customer.findUnique({
            where: { id: customerId },
        });
        if (customer) {
            data = { ...data, ...customer };
        }
    }

    // 7. Render with Mustache
    const renderedHtml = mustache.render(template.body, data);

    // --- NEW LOGIC: Dynamic Padding via Database Field ---
    // Trust the database setting. If undefined/null, default to FALSE (add padding).
    const isTransparent = template.transparentHeader === true;

    return (
        <>
            {/* Dynamic Navbar */}
            <Navbar links={configuration?.navLinks || []} />

            {/* Render the Page Content */}
            {/* If isTransparent (True): pt-0. Navbar floats over content.
               If isTransparent (False): pt-32. Pushes content down ~128px to clear Navbar.
            */}
            {/* Use the Helper Component to execute inline JS */}
            <HtmlWithScripts
                html={renderedHtml}
                className={`min-h-screen ${isTransparent ? "pt-0" : "pt-32"}`}
            />
        </>
    );
}