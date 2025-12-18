import { db } from "@repo/database";
import { TemplateEditor } from "../../../components/TemplateEditor";
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

    return (
        <div className="h-full">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900">
                    {isNew ? "Create New Template" : `Edit: ${template?.name}`}
                </h1>
            </div>
            <TemplateEditor initialData={template} />
        </div>
    );
}
