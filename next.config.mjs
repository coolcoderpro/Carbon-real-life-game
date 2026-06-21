/** @type {import('next').NextConfig} */

/**
 * Content Security Policy. This app is fully client-side and makes no external
 * network calls, so the policy is tight:
 *  - default to same-origin only
 *  - allow data:/blob: images & media (the 3D world builds smoke textures on a
 *    canvas and streams a local WebM video texture)
 *  - allow blob: workers (used by the WebGL/3D stack)
 *  - 'unsafe-inline' is required for Next's bootstrap script + injected styles
 *    (no nonce pipeline here); everything else is locked down.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt-and-braces clickjacking protection alongside frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers MIME-sniffing responses away from their declared type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to other origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This app needs no powerful browser features — deny them all.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Force HTTPS for two years, including subdomains.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework/version in responses.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
