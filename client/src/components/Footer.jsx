const Footer = () => {
  return (
    <footer className="bg-[#071B2D] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500">
                <span className="text-sm font-bold text-white">C</span>
              </div>

              <h2 className="text-xl font-bold">
                Civic<span className="text-emerald-400">Care</span>
              </h2>
            </div>

            <p className="max-w-xs text-sm leading-6 text-slate-300">
              A platform connecting citizens with municipalities to report
              and resolve civic issues.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <a
                  href="/"
                  className="transition hover:text-emerald-400"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/about"
                  className="transition hover:text-emerald-400"
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="/how-it-works"
                  className="transition hover:text-emerald-400"
                >
                  How It Works
                </a>
              </li>

              <li>
                <a
                  href="/complaints"
                  className="transition hover:text-emerald-400"
                >
                  Public Complaints
                </a>
              </li>

              <li>
                <a
                  href="/contact"
                  className="transition hover:text-emerald-400"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* For Citizens */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              For Citizens
            </h3>

            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <a
                  href="/report"
                  className="transition hover:text-emerald-400"
                >
                  Report an Issue
                </a>
              </li>

              <li>
                <a
                  href="/complaints"
                  className="transition hover:text-emerald-400"
                >
                  Track Complaints
                </a>
              </li>

              <li>
                <a
                  href="/nearby"
                  className="transition hover:text-emerald-400"
                >
                  Nearby Complaints
                </a>
              </li>

              <li>
                <a
                  href="/login"
                  className="transition hover:text-emerald-400"
                >
                  Login
                </a>
              </li>

              <li>
                <a
                  href="/register"
                  className="transition hover:text-emerald-400"
                >
                  Register
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.515l.6 2.4a2 2 0 01-.45 1.83L8.09 10.03a16.02 16.02 0 005.88 5.88l1.285-1.285a2 2 0 011.83-.45l2.4.6A2 2 0 0121 16.72V20a2 2 0 01-2 2C9.61 22 2 14.39 2 5a2 2 0 012-2z"
                  />
                </svg>

                <span>01-234567</span>
              </li>

              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>

                <span>support@civiccare.gov.np</span>
              </li>

              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"
                  />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>

                <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-700/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-sm text-slate-400 md:flex-row md:px-10 lg:px-16">
          
          <p>
            © 2026 CivicCare. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-5">
            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="transition hover:text-emerald-400"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 8h3V4h-3c-3.31 0-5 1.79-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.67.33-1 1-1z" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href="#"
              aria-label="Twitter"
              className="transition hover:text-emerald-400"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2zm-1.1 17.8h1.73L8.28 4.08H6.42L17.8 19.8z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="transition hover:text-emerald-400"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.7"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;