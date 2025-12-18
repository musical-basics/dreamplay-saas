"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, Map, BarChart2, Settings } from "lucide-react";
import clsx from "clsx";

const navigation = [
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Templates", href: "/templates", icon: FileText },
    { name: "Journeys", href: "/journeys", icon: Map },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center px-6">
                <h1 className="text-xl font-bold tracking-wider">DREAMPLAY</h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "group flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon
                                className="mr-3 h-5 w-5 flex-shrink-0"
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t border-slate-800 p-4">
                <div className="flex items-center">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs text-slate-500">View Profile</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
