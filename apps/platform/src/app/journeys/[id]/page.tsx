import { db } from "@repo/database";
import { addStep, removeStep, moveStep, updateJourneyStatus } from "../../actions/journeys";
import { Plus, Trash, ArrowUp, ArrowDown, CheckCircle, PauseCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface BuilderPageProps {
    params: {
        id: string;
    };
}

export default async function JourneyBuilderPage({ params }: BuilderPageProps) {
    const journey = await db.journey.findUnique({
        where: { id: params.id },
        include: {
            steps: {
                orderBy: { order: "asc" },
                include: {
                    template: true,
                },
            },
        },
    });

    if (!journey) {
        return <div>Journey not found</div>;
    }

    const allTemplates = await db.contentTemplate.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{journey.name}</h1>
                    <p className="text-sm text-slate-500">
                        Slug: /{journey.slug} • {journey.steps.length} Steps
                    </p>
                </div>
                <div className="flex gap-2">
                    <form action={updateJourneyStatus.bind(null, journey.id, journey.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}>
                        <button
                            className={`flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${journey.status === 'ACTIVE' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {journey.status === 'ACTIVE' ? <PauseCircle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {journey.status === 'ACTIVE' ? 'Pause Journey' : 'Activate Journey'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Journey Steps */}
                <div className="col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Journey Steps</h2>
                    <div className="space-y-3">
                        {journey.steps.map((step, index) => (
                            <div
                                key={step.id}
                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                        {step.order}
                                    </span>
                                    <div>
                                        <h3 className="font-medium text-slate-900">
                                            {step.template.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            /{step.template.slug} • {step.template.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <form action={moveStep.bind(null, journey.id, step.id, "UP")}>
                                        <button title="Move Up" disabled={index === 0} className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30">
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                    </form>
                                    <form action={moveStep.bind(null, journey.id, step.id, "DOWN")}>
                                        <button title="Move Down" disabled={index === journey.steps.length - 1} className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30">
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </form>
                                    <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                    <form action={removeStep.bind(null, step.id, journey.id)}>
                                        <button title="Remove" className="p-2 text-slate-400 hover:text-red-600">
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                        {journey.steps.length === 0 && (
                            <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
                                <p className="text-sm text-slate-500">This journey is empty. Add steps from the right.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Available Templates */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Available Templates</h2>
                    <div className="space-y-2">
                        {allTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3"
                            >
                                <div className="overflow-hidden">
                                    <h4 className="truncate text-sm font-medium text-slate-900">
                                        {template.name}
                                    </h4>
                                    <p className="truncate text-xs text-slate-500">
                                        /{template.slug}
                                    </p>
                                </div>
                                <form action={addStep.bind(null, journey.id, template.id)}>
                                    <button className="rounded-md bg-white p-1.5 text-blue-600 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        ))}
                        {allTemplates.length === 0 && (
                            <div className="py-4 text-center text-sm text-slate-500">
                                No templates found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
