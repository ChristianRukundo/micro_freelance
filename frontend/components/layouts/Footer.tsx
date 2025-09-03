import Link from 'next/link';
import { Logo } from '@/components/common/Logo';
import { ExternalLinkIcon } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-neutral-200 bg-neutral-50 py-12 text-neutral-600">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2" aria-label="Home">
            <Logo className="h-8 w-auto text-primary-500" />
            <span className="text-h5 font-semibold text-neutral-800">FreelanceHub</span>
          </Link>
          <p className="text-body-sm">
            Your trusted platform for connecting talent with opportunity.
          </p>
          <p className="text-caption">
            &copy; {currentYear} FreelanceHub. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="text-h6 font-semibold text-neutral-800 mb-4">Company</h3>
          <ul className="space-y-2 text-body-sm">
            <li><Link href="/about" className="hover:text-primary-500 transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-primary-500 transition-colors">Contact</Link></li>
            <li><Link href="/careers" className="hover:text-primary-500 transition-colors">Careers</Link></li>
            <li><Link href="/blog" className="hover:text-primary-500 transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-h6 font-semibold text-neutral-800 mb-4">Support</h3>
          <ul className="space-y-2 text-body-sm">
            <li><Link href="/help" className="hover:text-primary-500 transition-colors">Help Center</Link></li>
            <li><Link href="/faq" className="hover:text-primary-500 transition-colors">FAQ</Link></li>
            <li><Link href="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-h6 font-semibold text-neutral-800 mb-4">Connect</h3>
          <ul className="space-y-2 text-body-sm">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary-500 transition-colors">
                Twitter <ExternalLinkIcon className="ml-1 h-3 w-3" />
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary-500 transition-colors">
                LinkedIn <ExternalLinkIcon className="ml-1 h-3 w-3" />
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary-500 transition-colors">
                Facebook <ExternalLinkIcon className="ml-1 h-3 w-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}