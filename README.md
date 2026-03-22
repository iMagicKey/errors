# imagic-errors

> HTTP error classes and catch-all middleware for Node.js servers.

## Install

```bash
npm install imagic-errors
```

## Quick Start

```js
import { NotFoundError, catchErrors } from 'imagic-errors'

const getUser = catchErrors(async (req, res) => {
    const user = await db.find(req.params.id)
    if (!user) throw new NotFoundError('User not found')
    res.end(JSON.stringify(user))
})
```

## API

### `HttpError`

Base class for all HTTP errors.

```ts
new HttpError(status?: number, message?: string, details?: any)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | `number` | `500` | HTTP status code |
| `message` | `string` | `'HTTP Error'` | Human-readable message |
| `details` | `any` | `null` | Additional data attached to the error |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `.name` | `string` | Constructor name (e.g. `'NotFoundError'`) |
| `.status` | `number` | HTTP status code |
| `.message` | `string` | Error message |
| `.details` | `any \| null` | Extra context |
| `.stack` | `string` | Stack trace |

**Methods:**

```ts
error.toJSON(): { error: string, status: number, message: string, details?: any }
```

Returns a plain object ready for `JSON.stringify`. The `details` field is omitted when it is `null`.

---

### HTTP Error Subclasses

All subclasses extend `HttpError` and accept `(message?, details?)`.

| Class | Status | Default message |
|-------|--------|-----------------|
| `BadRequestError` | 400 | `'Bad Request'` |
| `UnauthorizedError` | 401 | `'Unauthorized'` |
| `ForbiddenError` | 403 | `'Forbidden'` |
| `NotFoundError` | 404 | `'Not Found'` |
| `MethodNotAllowedError` | 405 | `'Method Not Allowed'` |
| `ConflictError` | 409 | `'Conflict'` |
| `UnprocessableEntityError` | 422 | `'Unprocessable Entity'` |
| `TooManyRequestsError` | 429 | `'Too Many Requests'` |
| `InternalServerError` | 500 | `'Internal Server Error'` |
| `BadGatewayError` | 502 | `'Bad Gateway'` |
| `ServiceUnavailableError` | 503 | `'Service Unavailable'` |

```ts
new NotFoundError(message?: string, details?: any)
// .status === 404, .name === 'NotFoundError'
```

Each subclass sets `.status` automatically and sets `.name` to the class name.

---

### `isHttpError(err, status?)`

```ts
isHttpError(err: unknown, status?: number): boolean
```

Returns `true` if `err` is an instance of `HttpError`. When `status` is provided, also checks that `err.status === status`.

```js
isHttpError(new NotFoundError())        // true
isHttpError(new NotFoundError(), 404)   // true
isHttpError(new NotFoundError(), 400)   // false
isHttpError(new Error('plain'))         // false
```

---

### `catchErrors(handler)`

```ts
catchErrors(
    handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>
): (req: IncomingMessage, res: ServerResponse) => Promise<void>
```

Wraps an async route handler. On error:

- `HttpError` → responds with `err.status` and `err.toJSON()` as JSON body.
- Any other error → responds with `500` and a generic JSON body.

Sets `Content-Type: application/json` in both error cases.

```js
const wrapped = catchErrors(async (req, res) => {
    throw new ForbiddenError('Access denied')
})
// responds: 403 { "error": "ForbiddenError", "status": 403, "message": "Access denied" }
```

## Error Handling

| Situation | Result |
|-----------|--------|
| Handler throws `HttpError` | `err.status` response with `err.toJSON()` JSON body |
| Handler throws any other `Error` | `500` response with generic `InternalServerError` JSON body |
| Handler resolves normally | No interference — response is handled by the route handler |

`catchErrors` never re-throws. All errors are converted to JSON HTTP responses.

## Examples

See [`examples/basic.js`](./examples/basic.js) for a working demo with a plain `node:http` server.

```bash
node examples/basic.js
```

## License

MIT
