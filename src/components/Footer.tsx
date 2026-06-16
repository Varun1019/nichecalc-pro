import Link from 'next/link';
import { Calculator } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Calculator className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold text-white tracking-wide">
              NicheCalc<span className="text-blue-500"> Pro</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Calculators
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Disclaimers
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} NicheCalc Pro. All rights reserved.
            </p>
            <p className="mt-1 text-[10px] text-slate-600 max-w-[250px]">
              Disclaimer: Math models and results are for educational estimates only. Refer to professional advisors.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
