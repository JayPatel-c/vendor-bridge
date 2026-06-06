import React from 'react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Changelog', 'Integrations'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Status', 'Support'],
  Legal: ['Privacy', 'Terms', 'Security', 'GDPR'],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 15h20" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 19V5M17 19V5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 5c2.5 6 7.5 6 10 0" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 5C4 7 2 11 2 15M17 5c3 2 5 6 5 10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v5M9.5 8v7M14.5 8v7" />
              </svg>
              <span className="text-lg font-semibold tracking-tight text-white">
                VendorBridge
              </span>
            </div>
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              Modern procurement platform for forward-thinking teams.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h5 className="text-xs font-medium uppercase tracking-widest text-green-400 mb-4">{category}</h5>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-green-400 transition-colors duration-300 font-light"
                      data-cursor="pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-xs text-gray-600 font-light">
            © 2026 VendorBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-gray-600 hover:text-green-400 transition-colors duration-300 font-light"
                data-cursor="pointer"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
