// Build trigger: 1779135720
/** @type {import('next').NextConfig} */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://js.stripe.com https://checkout.stripe.com https://www.paypal.com https://*.paypal.com https://www.paypalobjects.com https://*.paypalobjects.com https://app.posthog.com https://*.posthog.com https://*.i.posthog.com https://*.pusher.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' data: blob: https: http:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.groq.com https://openrouter.ai https://api.elevenlabs.io https://api.replicate.com https://api.stability.ai https://api.d-id.com https://api.heygen.com https://api.shotstack.io https://api.cloudinary.com https://*.r2.cloudflarestorage.com https://app.posthog.com https://*.posthog.com https://*.i.posthog.com https://*.pusher.com wss://*.pusher.com https://api.stripe.com https://checkout.stripe.com https://m.stripe.network https://*.stripe.com https://www.paypal.com https://*.paypal.com https://api-m.paypal.com https://api.resend.com https://api.twilio.com",
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://www.paypal.com https://*.paypal.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

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
          { key: 'Content-Security-Policy', value: CSP },
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
  // 2026-09-05: was 0, which meant "no limit" under Next 15 and means ZERO
  // SECONDS under Next 16. Every route failed instantly with "took more than 0
  // seconds" and the build aborted on /robots.txt.
  //
  // A silent meaning change in a config value is the worst kind of upgrade
  // break: the value is still valid, still accepted, and now does the opposite.
  // 120 is Next's own default and is what this was trying to say.
  staticPageGenerationTimeout: 120,
}
module.exports = nextConfig
