> **DEPRECATED — NO LONGER MAINTAINED.** This project is discontinued, so the items below will not be carried out. They are kept for reference only.

# UPDATE — imagic-errors

> Audit performed: 2026-04-07. Version at time of audit: 2.0.1

---

## Critical bugs (fix immediately)

`catchErrors` (`src/middleware.js`), found by the Stage 1 review of `imagic-web-server`:

- [ ] **Re-throws after headers are sent.** The README says it never re-throws, but `writeHead` in the catch block throws `ERR_HTTP_HEADERS_SENT` once a handler has written. This rejection exits a plain `node:http` server. `imagic-web-server` survives it, but its error handlers receive `ERR_HTTP_HEADERS_SENT` and the original error is lost. Should destroy the response instead
- [ ] **Writes headers before stringifying.** Circular or BigInt `details` throw in `JSON.stringify` after `writeHead`, which drops the connection. Should stringify first, and fall back to a body without `details`
- [ ] **Keeps stale framing headers.** A `Content-Length` or `Content-Encoding` set by the failed handler stays on the JSON error response, which corrupts it. Should remove them, as the `imagic-web-server` default response does
- [ ] **Hides non-HttpError failures.** They become a generic 500 with no way to observe the original error: no callback, no re-throw, and the server's `onError` never runs. Needs a reporting path
- [ ] **Accepts non-error statuses.** `new HttpError(200)` is sent as a 200 with an error body. Should validate the status as an integer from 400 to 599, at construction or in `catchErrors`

---

## API improvements (backlog)

- [ ] `ValidationError` with per-field form details

---

## Backlog

- [ ] Integration examples with imagic-web-server
