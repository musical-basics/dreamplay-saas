import { db } from "@repo/database";
import { notFound } from "next/navigation";
import mustache from "mustache";

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
    let configuration = null;
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

    // 3. Fetch Template (scoped to configuration)
    const template = await db.contentTemplate.findFirst({
        where: {
            slug: pageSlug,
            configurationId: configuration?.id || null,
        },
    });

    if (!template) {
        notFound();
    }

    // 4. Context Merging
    let data: any = {
        ...searchParams,
        nav_links: configuration?.navLinks || [],
        site_name: configuration?.name || "Default Site",
    };

    // 5. Customer Lookup
    const customerId = searchParams.customerId as string;
    if (customerId) {
        const customer = await db.customer.findUnique({
            where: { id: customerId },
        });
        if (customer) {
            data = { ...data, ...customer };
        }
    }

    // 6. Render with Mustache
    const renderedHtml = mustache.render(template.body, data);

    return (
        <main
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            className="min-h-screen"
        />
    );
}
