"use server";

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJourney(formData: FormData) {
    const name = formData.get("name") as string;
    // Simple slug generation: "My Journey" -> "my-journey" + random string if needed? 
    // For now, let's just hyphenate and hope for uniqueness or rely on user to edit.
    // Actually, let's just make a simple slug for V1.
    const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Date.now().toString().slice(-4);

    const journey = await db.journey.create({
        data: {
            name,
            slug,
            status: "DRAFT",
        },
    });

    revalidatePath("/journeys");
    redirect(`/journeys/${journey.id}`);
}

export async function addStep(journeyId: string, templateId: string) {
    // 1. Find the current highest order
    const lastStep = await db.journeyStep.findFirst({
        where: { journeyId },
        orderBy: { order: "desc" },
    });

    const nextOrder = lastStep ? lastStep.order + 1 : 1;

    await db.journeyStep.create({
        data: {
            journeyId,
            templateId,
            order: nextOrder,
        },
    });

    revalidatePath(`/journeys/${journeyId}`);
}

export async function removeStep(stepId: string, journeyId: string) {
    await db.journeyStep.delete({
        where: { id: stepId },
    });
    revalidatePath(`/journeys/${journeyId}`);
}

export async function updateJourneyStatus(id: string, status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED") {
    await db.journey.update({
        where: { id },
        data: { status },
    });
    revalidatePath("/journeys");
    revalidatePath(`/journeys/${id}`);
}

export async function moveStep(journeyId: string, stepId: string, direction: "UP" | "DOWN") {
    const currentStep = await db.journeyStep.findUnique({
        where: { id: stepId },
    });

    if (!currentStep) return;

    const targetOrder = direction === "UP" ? currentStep.order - 1 : currentStep.order + 1;

    // Find the step at the target order
    const swapStep = await db.journeyStep.findFirst({
        where: {
            journeyId,
            order: targetOrder,
        },
    });

    if (swapStep) {
        // Transaction to swap orders
        await db.$transaction([
            db.journeyStep.update({
                where: { id: currentStep.id },
                data: { order: targetOrder },
            }),
            db.journeyStep.update({
                where: { id: swapStep.id },
                data: { order: currentStep.order },
            }),
        ]);
    }

    revalidatePath(`/journeys/${journeyId}`);
}
