// Build trigger: 1779135720
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 2026-08-29: required for @craudioviz/platform-sdk. The SDK ships raw
  // TypeScript and Next does not run node_modules through SWC by default, so
  // any import carrying a `type` re-export fails the build without this.
  transpilePackages: ["@craudioviz/platform-sdk"],
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
