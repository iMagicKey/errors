# AGENT — imagic-errors

## Purpose

Provides typed HTTP error classes and a `catchErrors` middleware wrapper that converts thrown errors into structured JSON HTTP responses.

## Package

- npm: `imagic-errors`
- import (local): `import { NotFoundError, catchErrors, isHttpError } from '../src/index.js'`
- import (installed): `import { NotFoundError, catchErrors, isHttpError } from 'imagic-errors'`
- zero runtime deps

## Exports

### `HttpError(status, message, details)`

Base error class.

- `status` {number} [500] — HTTP status code
- `message` {string} ['HTTP Error'] — human-readable message
- `details` {any} [null] — optional structured context (e.g. validation errors)
- `.name` — set to constructor name
- `.toJSON()` — returns `{ error: string, status: number, message: string, details?: any }` (details omitted when null)
- throws: nothing on construction

### `BadRequestError(message?, details?)` → status 400
### `UnauthorizedError(message?, details?)` → status 401
### `ForbiddenError(message?, details?)` → status 403
### `NotFoundError(message?, details?)` → status 404
### `MethodNotAllowedError(message?, details?)` → status 405
### `ConflictError(message?, details?)` → status 409
### `UnprocessableEntityError(message?, details?)` → status 422
### `TooManyRequestsError(message?, details?)` → status 429
### `InternalServerError(message?, details?)` → status 500
### `BadGatewayError(message?, details?)` → status 502
### `ServiceUnavailableError(message?, details?)` → status 503

All subclasses: `(message?: string, details?: any)`
- `message` {string} [class default] — overrides the default message
- `details` {any} [null] — extra context attached to the error
- returns: `HttpError` instance with `.status`, `.name`, `.message`, `.details`

### `isHttpError(err, status?): boolean`

- `err` {unknown} — value to check
- `status` {number} [undefined] — optional status code filter
- returns: `true` if `err instanceof HttpError`; when `status` provided, also checks `err.status === status`
- throws: never

### `catchErrors(handler): AsyncMiddleware`

- `handler` {async (req, res) => void} — route handler to wrap
- returns: async function with same signature
- throws: never (all errors are converted to JSON responses)

When handler throws:
- `HttpError` → `err.status` response with `Content-Type: application/json` and `err.toJSON()` body
- Any other error → `500` response with `{ error: 'InternalServerError', status: 500, message: 'Internal Server Error' }`

## Usage Patterns

### Throwing in a route handler

```js
import { NotFoundError, BadRequestError, catchErrors } from '../src/index.js'

const handler = catchErrors(async (req, res) => {
    if (!req.params.id) throw new BadRequestError('id is required')
    const user = await db.find(req.params.id)
    if (!user) throw new NotFoundError('User not found', { id: req.params.id })
    res.end(JSON.stringify(user))
})
```

### Attaching validation details

```js
throw new UnprocessableEntityError('Validation failed', {
    fields: { email: 'invalid format', age: 'must be positive' }
})
// toJSON() → { error: 'UnprocessableEntityError', status: 422,
//              message: 'Validation failed', details: { fields: ... } }
```

### Checking error type in middleware

```js
function errorHandler(err, req, res) {
    if (isHttpError(err)) {
        res.writeHead(err.status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(err.toJSON()))
    } else {
        res.writeHead(500)
        res.end('Internal Server Error')
    }
}
```

### Checking for a specific status

```js
if (isHttpError(err, 429)) {
    // handle rate limit error specifically
}
```

### Custom base HttpError

```js
throw new HttpError(418, "I'm a teapot")
```

## Constraints / Gotchas

- `catchErrors` only wraps **async** handlers; synchronous throws inside it are still caught because async functions return rejected promises.
- `details` is omitted from `toJSON()` output when it is `null` — do not rely on its presence in the serialized form.
- `catchErrors` does not call a `next` function — it sends the response directly. Do not use it as a connect-style middleware itself; it is a route handler wrapper.
- All 11 subclasses set `.name` to the class name (e.g. `'NotFoundError'`), not `'HttpError'`. Use this field in client error parsing.
- `isHttpError` uses `instanceof` — errors crossing module boundaries (different copies of the package) may return `false`. Use a single installation.

---

## Knowledge Base

**KB tags for this library:** `imagic-errors, error-handling`

Before COMPLEX tasks — invoke `knowledge-reader` with tags above + task-specific tags.
After completing a task — if a reusable pattern, error, or decision emerged, invoke `knowledge-writer` with `source: imagic-errors`.

See `CLAUDE.md` §Knowledge Base Protocol for the full workflow.
