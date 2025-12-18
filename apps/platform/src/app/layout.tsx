import type { Metadata } from "next";
import { Sidebar } from "../components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
    title: "Platform Admin",
    description: "Admin Dashboard",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="flex h-screen overflow-hidden bg-slate-50">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </body>
        </html>
    );
}
