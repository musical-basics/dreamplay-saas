import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Navbar removed - now rendered dynamically in page.tsx
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
            <head>
                {/* --- 1. LOCAL WEBFLOW STYLES (Served from /public/css/) --- */}
                {/* These make your Navbar and Pages look correct immediately */}
                <link href="/css/normalize.css" rel="stylesheet" type="text/css" />
                <link href="/css/webflow.css" rel="stylesheet" type="text/css" />
                <link href="/css/lionels-stunning-site-07720d.webflow.css" rel="stylesheet" type="text/css" />

                {/* --- 2. WEBFLOW FONTS (Lato & Manrope) --- */}
                <link href="https://fonts.googleapis.com" rel="preconnect" />
                <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
                <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
                <script
                    type="text/javascript"
                    dangerouslySetInnerHTML={{
                        __html: `WebFont.load({ google: { families: ["Lato:100,300,400,700,900","Manrope:regular,500,600,700,800"] } });`
                    }}
                />
            </head>

            <body className={inter.className}>
                <Suspense fallback={null}>
                    <AnalyticsTracker />
                </Suspense>

                {/* The Navbar (from page.tsx) and Page Content inject here */}
                {children}

                <Footer />
            </body>
        </html>
    );
}