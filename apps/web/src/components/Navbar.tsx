import Link from "next/link";

// Define the shape of a Link
interface NavLink {
    label: string;
    url: string;
}

// Add Props to the Component
interface NavbarProps {
    links?: NavLink[];
}

export function Navbar({ links = [] }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo Area */}
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold text-slate-900">
                        DREAMPLAY
                    </Link>
                </div>

                {/* Dynamic Desktop Navigation */}
                <div className="hidden md:block">
                    <div className="flex items-center gap-8">
                        {links.length > 0 ? (
                            links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                                >
                                    {link.label}
                                </Link>
                            ))
                        ) : null}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button className="p-2 text-slate-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}

// Keep default export for backward compatibility
export default Navbar;
