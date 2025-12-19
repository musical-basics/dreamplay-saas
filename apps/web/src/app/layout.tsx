import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnalyticsTracker from "../components/AnalyticsTracker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DreamPlay SaaS",
    description: "Public Renderer",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Navbar />
                <Suspense fallback={null}>
                    <AnalyticsTracker />
                </Suspense>
                {children}
                <Footer />
            </body>
        </html>
    );
}

