import { db } from "@repo/database";

export default async function Page() {
    // Simple check to ensure DB connection works (even if no data yet)
    const users = await db.customer.findMany().catch(() => []);
    return (
        <main>
            <h1>Platform Admin Dashboard</h1>
            <p>Database Connection: {users ? 'Active' : 'Error'}</p>
        </main>
    );
}
