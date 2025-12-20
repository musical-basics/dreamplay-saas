import { db } from "@repo/database";
import { notFound, redirect } from "next/navigation";
import mustache from "mustache";

export const dynamic = "force-dynamic";

interface PageProps {
    params: {
        slug: string;
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function JourneyFlowPage({ params, searchParams }: PageProps) {
    const { slug } = params;

    // 1. Fetch Journey
    const journey = await db.journey.findUnique({
        where: { slug: slug },
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
        return notFound();
    }

    if (journey.status !== "ACTIVE") {
        // Optional: handled differently? For now render anyway for preview or show message
        if (journey.status === "DRAFT" || journey.status === "PAUSED") {
            return <div className="p-10 text-center font-sans">This journey is currently {journey.status.toLowerCase()}.</div>
        }
    }

    // 2. Identify Current Step
    // Use 1-based step index (step=1 means first step, step=2 means second step, etc.)
    const stepParam = searchParams.step ? parseInt(searchParams.step as string) : 1;
    const stepIndex = isNaN(stepParam) || stepParam < 1 ? 0 : stepParam - 1;

    // Check if journey has no steps
    if (journey.steps.length === 0) {
        return <div className="p-10 text-center font-sans">This journey has no steps configured yet.</div>;
    }

    // If step index is beyond available steps, show completion
    if (stepIndex >= journey.steps.length) {
        return <div className="p-10 text-center font-sans">Journey Completed!</div>;
    }

    // Get current step by array index (steps are already sorted by order)
    const currentStep = journey.steps[stepIndex];

    if (!currentStep || !currentStep.template) {
        return <div className="p-10 text-center font-sans">Step not found or template missing.</div>;
    }

    // 3. Identify Next Step
    const nextStepIndex = stepIndex + 1;
    const hasNextStep = nextStepIndex < journey.steps.length;
    const nextStepUrl = hasNextStep
        ? `/flow/${slug}?step=${nextStepIndex + 1}`
        : "#"; // Or a "completed" URL

    // 4. Data Context Merging (Reusing logic from Smart Templates)
    let data: any = { ...searchParams };

    // Inject next_step variable specially
    data["next_step"] = nextStepUrl;

    // Customer Lookup (supports both customerId and cid from emails)
    const customerId = (searchParams.customerId || searchParams.cid) as string;
    if (customerId) {
        const customer = await db.customer.findUnique({
            where: { id: customerId },
        });
        if (customer) {
            data = { ...data, ...customer };
            // Preserve customerId in next step link
            if (hasNextStep) {
                data["next_step"] = `/flow/${slug}?step=${nextStepIndex + 1}&cid=${customerId}`;
            }
        }
    }

    // 5. Render
    const renderedHtml = mustache.render(currentStep.template.body, data);

    return (
        <main
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
            className="min-h-screen"
        />
    );
}

