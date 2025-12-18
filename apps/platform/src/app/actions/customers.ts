"use server";

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    if (!email) throw new Error("Email is required");

    await db.customer.create({
        data: {
            email,
            name,
        },
    });

    revalidatePath("/customers");
}
