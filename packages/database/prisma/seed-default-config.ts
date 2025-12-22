/**
 * Seed script for Multi-Configuration Migration
 * 
 * Run this IMMEDIATELY after `prisma db push` to migrate existing templates
 * to the default configuration.
 * 
 * Usage: pnpm tsx packages/database/prisma/seed-default-config.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting default configuration seed...");

    // Step 1: Check if a default configuration exists
    let defaultConfig = await prisma.configuration.findFirst({
        where: { isDefault: true },
    });

    if (!defaultConfig) {
        // Create the default configuration
        defaultConfig = await prisma.configuration.create({
            data: {
                name: "Default Site",
                slug: "main",
                isDefault: true,
            },
        });
        console.log("✅ Created default configuration:", defaultConfig.id);
    } else {
        console.log("ℹ️  Default configuration already exists:", defaultConfig.id);
    }

    // Step 2: Find all LANDING and CHECKOUT templates without a configuration
    const templatesWithoutConfig = await prisma.contentTemplate.findMany({
        where: {
            configurationId: null,
            type: { in: ["LANDING", "CHECKOUT"] },
        },
    });

    console.log(`📄 Found ${templatesWithoutConfig.length} templates to migrate`);

    // Step 3: Update them to use the default configuration
    if (templatesWithoutConfig.length > 0) {
        const result = await prisma.contentTemplate.updateMany({
            where: {
                id: { in: templatesWithoutConfig.map((t) => t.id) },
            },
            data: {
                configurationId: defaultConfig.id,
            },
        });
        console.log(`✅ Migrated ${result.count} templates to default configuration`);
    }

    // Step 4: Report EMAIL templates (they stay null)
    const emailTemplates = await prisma.contentTemplate.count({
        where: { type: "EMAIL" },
    });
    console.log(`📧 ${emailTemplates} EMAIL templates remain configuration-agnostic`);

    console.log("🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
