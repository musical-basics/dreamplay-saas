import { db } from "@repo/database";
import { VisualTemplateEditorSafe } from "../../../components/VisualTemplateEditorSafe";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TemplatePage({
    params,
}: {
    params: { id: string };
}) {
    const isNew = params.id === "new";
    let template = null;

    if (!isNew) {
        template = await db.contentTemplate.findUnique({
            where: { id: params.id },
        });

        if (!template) {
            notFound();
        }
    }

    return <VisualTemplateEditorSafe initialData={template} />;
}

