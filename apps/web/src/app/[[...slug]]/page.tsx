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
    // 1. Determine Slug
    const slugArray = params.slug || [];
    const slug = slugArray.length > 0 ? slugArray.join("/") : "home";

    // 2. Fetch Template
    const template = await db.contentTemplate.findUnique({
        where: { slug },
    });

    if (!template) {
        notFound();
    }

    // 3. Context Merging
    let data: any = { ...searchParams };

    // 4. Customer Lookup
    const customerId = searchParams.customerId as string;
    if (customerId) {
        const customer = await db.customer.findUnique({
            where: { id: customerId },
        });
        if (customer) {
            data = { ...data, ...customer };
        }
    }

    // 5. Render with Mustache
    // Disable HTML escaping for specific use cases if needed, but default is safer.
    // User asked for "standard URL characters", Mustache handles basic interpolation.
    // For attributes: <img src="{{profilePic}}" /> works if profilePic is a URL.

    const renderedHtml = mustache.render(template.body, data);

    return (
        <main
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            className="min-h-screen"
        />
    );
}
