import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔄 Starting migration to many-to-many template-configuration relationship...");

    // Step 1: Create the ConfigurationTemplate junction table if it doesn't exist
    // (Prisma db push will handle this)

    // Step 2: Get all templates that have a configurationId
    const templatesWithConfig = await prisma.$queryRaw<
        Array<{ id: string; configurationId: string | null }>
    >`
        SELECT id, "configurationId" FROM "ContentTemplate" 
        WHERE "configurationId" IS NOT NULL
    `;

    console.log(`📄 Found ${templatesWithConfig.length} templates with configurationId to migrate`);

    // Step 3: Create junction records for each template-configuration pair
    for (const template of templatesWithConfig) {
        if (template.configurationId) {
            // Check if junction already exists
            const existingJunction = await prisma.$queryRaw<Array<{ id: string }>>`
                SELECT id FROM "ConfigurationTemplate"
                WHERE "configurationId" = ${template.configurationId}
                AND "templateId" = ${template.id}
            `;

            if (existingJunction.length === 0) {
                await prisma.$executeRaw`
                    INSERT INTO "ConfigurationTemplate" (id, "configurationId", "templateId", "createdAt")
                    VALUES (gen_random_uuid(), ${template.configurationId}, ${template.id}, NOW())
                `;
                console.log(`  ✅ Created junction for template ${template.id}`);
            } else {
                console.log(`  ⏭️  Junction already exists for template ${template.id}`);
            }
        }
    }

    // Step 4: Also link all LANDING/CHECKOUT templates to the default config if not already linked
    const defaultConfig = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "Configuration" WHERE "isDefault" = true LIMIT 1
    `;

    if (defaultConfig.length > 0) {
        const defaultConfigId = defaultConfig[0].id;

        // Get all LANDING/CHECKOUT templates
        const landingTemplates = await prisma.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM "ContentTemplate" 
            WHERE type IN ('LANDING', 'CHECKOUT')
        `;

        for (const template of landingTemplates) {
            // Check if already linked to default config
            const existing = await prisma.$queryRaw<Array<{ id: string }>>`
                SELECT id FROM "ConfigurationTemplate"
                WHERE "configurationId" = ${defaultConfigId}
                AND "templateId" = ${template.id}
            `;

            if (existing.length === 0) {
                await prisma.$executeRaw`
                    INSERT INTO "ConfigurationTemplate" (id, "configurationId", "templateId", "createdAt")
                    VALUES (gen_random_uuid(), ${defaultConfigId}, ${template.id}, NOW())
                `;
                console.log(`  ✅ Linked template ${template.id} to default config`);
            }
        }
    }

    console.log("🎉 Migration completed successfully!");
}

main()
    .catch((e) => {
        console.error("Migration failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
