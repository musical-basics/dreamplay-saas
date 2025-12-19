import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
                <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                    <div className="pb-6">
                        <Link href="/terms" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                            Terms
                        </Link>
                    </div>
                    <div className="pb-6">
                        <Link href="/privacy" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                            Privacy
                        </Link>
                    </div>
                    <div className="pb-6">
                        <Link href="/contact" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                            Contact
                        </Link>
                    </div>
                </nav>
                <p className="mt-10 text-center text-xs leading-5 text-gray-500">
                    &copy; {year} DreamPlay SaaS. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
