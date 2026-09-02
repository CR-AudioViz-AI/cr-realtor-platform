// Build trigger: 1779135720
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // 2026-09-02: this app served ONE of six security headers while core served
    // all six. Verify's own security-posture check found it against the live
    // site, which is the point of the product.
    //
    // X-Frame-Options: without it the page can be framed and overlaid, so a user
    // clicks an invisible target instead of the button they can see. On a page
    // with a buy button that is a real attack.
    // nosniff: without it a user-uploaded file can be coaxed into executing.
    // HSTS: without it the FIRST request of a session can be downgraded before
    // any redirect fires, and a padlock later does not undo that.
    // Referrer-Policy: full URLs — including tokens and ids in them — leak to
    // every third party the page contacts.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  // 2026-08-20: /harvey was `redirect('/demo/premiere-plus')` inside a page
  // component, which in Next returns HTTP 200 with a rendered shell - a BLANK
  // PAGE, not a redirect. Route aliases belong here, where they are a real 308 at
  // the edge that crawlers follow and that actually moves the visitor.
  //
  // The same defect was found 36 times in the core platform and 19 more across
  // the fleet; scripts/audit-ecosystem.mjs now fails the build on it.
  async redirects() {
    return [
      { source: "/harvey", destination: "/demo/premiere-plus", permanent: true },
    ]
  },
  typescript: {
    // 2026-08-21: was ignoreBuildErrors: true. With checking off, this repo
    // carried lib/observability/error-tracking.ts - a file containing JSX with a
    // .ts extension, which cannot parse. 29 syntax errors, and it had NEVER
    // compiled. Nothing imported it, so Sentry error tracking has never actually
    // been wired up here and no one could tell.
    //
    // Type errors: 29 to 0. Do not turn this back off.
    ignoreBuildErrors: false,
  },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  // Prevent any static generation - all pages dynamic
  staticPageGenerationTimeout: 0,
}
module.exports = nextConfig
