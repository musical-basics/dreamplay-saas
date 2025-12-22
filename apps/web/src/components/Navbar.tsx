"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// 1. Type Definitions
interface NavLink {
    id?: string;
    label: string;
    url: string;
    forceRefresh?: boolean; // From database - force full page reload
}

interface NavbarProps {
    links?: NavLink[];
}

export default function Navbar({ links = [] }: NavbarProps) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    // 2. Scroll Event Listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 3. Helper for Active States
    const getLinkClass = (path: string) => {
        const baseClass = "navigation5_link-wrfrm w-nav-link";
        return pathname === path ? `${baseClass} w--current` : baseClass;
    };

    return (
        <div
            data-animation="default"
            className="section_navigation5-wrfrm w-nav"
            data-wf--navbar--variant="base"
            data-duration="400"
            role="banner"
        >
            <div className="navigation5_container">

                {/* --- BRAND / LOGO AREA --- */}
                <Link
                    href="/"
                    aria-current="page"
                    className={`navigation5_logo-link w-nav-brand ${isScrolled ? "scrolled" : ""}`}
                >
                    {/* BIG LOGO (Visible at Top) */}
                    <img
                        loading="lazy"
                        src="/images/Logo.svg"
                        alt="DreamPlay Logo"
                        className="navigation_logo transition-all duration-300 ease-in-out"
                        style={{
                            opacity: isScrolled ? 0 : 1,
                            display: isScrolled ? 'none' : 'block'
                        }}
                    />

                    {/* ICON PILL (Visible when Scrolled) */}
                    <div
                        className="logo-icon-pill transition-all duration-300 ease-in-out"
                        style={{
                            display: isScrolled ? 'flex' : 'none',
                            opacity: isScrolled ? 1 : 0,
                            transform: isScrolled ? 'translateY(0)' : 'translateY(10px)'
                        }}
                    >
                        <img src="/images/Logo-Icon.svg" alt="Icon" className="h-8" />
                        <span className="ml-2 font-bold text-slate-900">DreamPlay</span>
                    </div>
                </Link>

                {/* --- DYNAMIC MENU LINKS --- */}
                <nav role="navigation" className="navigation5_menu-wrfrm is-page-height-tablet w-nav-menu">
                    <div className="navigation5_menu-links">

                        {/* Dynamic Loop from Database */}
                        {links.length > 0 ? (
                            links.map((link, index) => {
                                // Use database field instead of hardcoded URL matching
                                const isHardRefresh = link.forceRefresh === true;

                                return (
                                    <React.Fragment key={link.id || index}>
                                        {isHardRefresh ? (
                                            /* OPTION A: Hard Refresh (<a> tag) */
                                            <a
                                                href={link.url}
                                                className={getLinkClass(link.url)}
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            /* OPTION B: Fast Client Nav (<Link> tag) */
                                            <Link
                                                href={link.url}
                                                className={getLinkClass(link.url)}
                                            >
                                                {link.label}
                                            </Link>
                                        )}

                                        {/* Add Divider except for last item */}
                                        {index < links.length - 1 && (
                                            <div className="nav-divider"></div>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <span className="text-sm text-slate-400 p-4">No links configured</span>
                        )}

                    </div>
                </nav>

                {/* --- HAMBURGER MENU (Mobile) --- */}
                <div className="navigation5_buttons-wrfrm">

                    {/* Mobile Hamburger Icon */}
                    <div className="navigation5_menu-button w-nav-button">
                        <div className="navigation5_menu-icon">
                            <div className="navigation_menu_line-top navigation-menu-line-background-wrfrm"></div>
                            <div className="navigation_menu_line-middle navigation-menu-line-background-wrfrm">
                                <div className="navigation_menu_line-middle-inner"></div>
                            </div>
                            <div className="navigation_menu_line-bottom navigation-menu-line-background-wrfrm"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}