import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold text-slate-900 hover:opacity-80">
                        DREAMPLAY
                    </Link>
                </div>
                <div className="hidden space-x-8 md:flex">
                    <Link href="/" className="text-sm font-medium text-slate-700 hover:text-blue-600">
                        Home
                    </Link>
                    <Link href="/faq" className="text-sm font-medium text-slate-700 hover:text-blue-600">
                        FAQ
                    </Link>
                    <Link href="/shipping" className="text-sm font-medium text-slate-700 hover:text-blue-600">
                        Shipping
                    </Link>
                </div>
            </div>
        </nav>
    );
}
