import { db } from "@repo/database";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        slug?: string[];
    };
}

export default async function Page({ params }: PageProps) {
    // Determine the slug to query
    // content: / -> slug = 'home'
    // content: /test -> slug = 'test'
    // content: /offers/black-friday -> slug = 'offers/black-friday' (if we support nested, or just match last segment? user said "['test']", let's assume joined path)

    // Actually, standard practice for catch-all:
    // params.slug is array of path segments.
    // if undefined or empty -> homepage

    const slugArray = params.slug || [];
    const slug = slugArray.length > 0 ? slugArray.join("/") : "home";

    const template = await db.contentTemplate.findUnique({
        where: { slug },
    });

    if (!template) {
        notFound();
    }

    return (
        <main
            dangerouslySetInnerHTML={{ __html: template.body }}
            className="min-h-screen"
        />
    );
}
