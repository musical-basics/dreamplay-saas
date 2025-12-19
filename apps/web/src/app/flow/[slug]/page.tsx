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
    // Expect ?step=1 for 1st step. Default to 1.
    const stepParam = searchParams.step ? parseInt(searchParams.step as string) : 1;
    const currentOrder = isNaN(stepParam) ? 1 : stepParam;

    // Find the step with this order
    const currentStep = journey.steps.find((s) => s.order === currentOrder);

    if (!currentStep) {
        // If step is out of bounds:
        // If step > total, maybe show completion?
        if (currentOrder > journey.steps.length) {
            return <div className="p-10 text-center font-sans">Journey Completed!</div>
        }
        // If step < 1 or invalid, redirect to step 1
        redirect(`/flow/${slug}?step=1`);
    }

    // 3. Identify Next Step
    const nextStep = journey.steps.find((s) => s.order === currentOrder + 1);
    const nextStepUrl = nextStep
        ? `/flow/${slug}?step=${nextStep.order}`
        : "#"; // Or a "completed" URL

    // 4. Data Context Merging (Reusing logic from Smart Templates)
    let data: any = { ...searchParams };

    // Inject next_step variable specially
    data["next_step"] = nextStepUrl;

    // Customer Lookup
    const customerId = searchParams.customerId as string;
    if (customerId) {
        const customer = await db.customer.findUnique({
            where: { id: customerId },
        });
        if (customer) {
            data = { ...data, ...customer };
            // Maintain customerId in next step link if strictly needed?
            // actually next_step link above doesn't preserve other params.
            // Let's improve next_step to preserve customerId
            if (nextStep) {
                data["next_step"] = `/flow/${slug}?step=${nextStep.order}&customerId=${customerId}`;
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
