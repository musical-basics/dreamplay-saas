import { db } from "@repo/database";
import { createCustomer } from "../actions/customers";
import { UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const customers = await db.customer.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Customer CRM</h1>
            </div>

            {/* Simple Inline Add Form */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase text-slate-500">
                    Add New Customer
                </h2>
                <form action={createCustomer} className="flex gap-4">
                    <input
                        name="name"
                        placeholder="Name"
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                    />
                    <button
                        type="submit"
                        className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Customer
                    </button>
                </form>
            </div>

            {/* Customer Table */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                Shopify ID
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                    {customer.name || "N/A"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    {customer.email}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                    {customer.shopifyCustomerId || "-"}
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-12 text-center text-sm text-slate-500"
                                >
                                    No customers found. Add one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
