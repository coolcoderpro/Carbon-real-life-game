# Security Policy

## Security posture

EcoGarden is a fully client-side application. By design it has a deliberately
small attack surface:

- **No backend, no database, no API.** All logic runs in the browser.
- **No user data is collected, transmitted, or persisted.** State lives only in
  memory for the current session and is gone on reload.
- **No external network calls.** No third-party analytics, trackers, or CDNs at
  runtime. The Content-Security-Policy restricts connections to same-origin.
- **No dynamic code execution.** No `eval`, no `new Function`, no
  `dangerouslySetInnerHTML`. User-facing text is rendered by React, which
  escapes by default.
- **Validated input.** The only user input is a preset action id, which is
  validated against a fixed allow-list (`getPreset`) before use; unknown ids are
  ignored by the reducer.

## HTTP security headers

Set in `next.config.mjs` for every response:

| Header | Value / purpose |
|---|---|
| `Content-Security-Policy` | Same-origin by default; locks down scripts, frames, objects |
| `X-Frame-Options` | `DENY` — clickjacking protection |
| `X-Content-Type-Options` | `nosniff` — block MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, mic, geolocation, FLoC all denied |
| `Strict-Transport-Security` | Force HTTPS (HSTS, 2 years, preload) |
| `X-Powered-By` | Removed (no framework fingerprinting) |

## Dependencies

- Production dependencies are limited to the framework and the
  rendering/animation libraries (Next.js, React, Three.js stack, Framer Motion).
- A known `npm audit` advisory (`postcss` XSS, moderate) is a **build-time,
  transitive** dependency bundled inside Next.js. It does not run in the shipped
  client bundle, and the only "fix" `npm audit` offers is a breaking downgrade of
  Next.js to v9, so it is intentionally not applied.

## Reporting a vulnerability

This is a hackathon demo project. If you find a security issue, please open a
private report via the repository's GitHub "Security" tab (Report a
vulnerability) rather than a public issue.
