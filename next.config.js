// Build trigger: 1779135720
/** @type {import('next').NextConfig} */
const nextConfig = {
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
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: false,
  // Prevent any static generation - all pages dynamic
  staticPageGenerationTimeout: 0,
}
module.exports = nextConfig
