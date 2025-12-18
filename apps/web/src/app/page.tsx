import { db } from "@repo/database";

export default async function Page() {
    const users = await db.customer.findMany().catch(() => []);
    return (
        <main>
            <h1>Public Landing Page</h1>
            <p>Database Connection: {users ? 'Active' : 'Error'}</p>
        </main>
    );
}
