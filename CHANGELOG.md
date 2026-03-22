# Changelog

## [2.0.0] — 2026-03-22

### Breaking Changes

- `HttpError.toJSON()` field `error` renamed to `code`
  - Before: `{ error: 'NotFoundError', status: 404, message: '...', details? }`
  - After: `{ code: 'NotFoundError', status: 404, message: '...', details? }`

- `catchErrors` middleware now wraps responses in the standard `{ data, error }` envelope
  - Before: `{ error: 'NotFoundError', status: 404, message: '...' }`
  - After: `{ data: null, error: { code: 'NotFoundError', status: 404, message: '...' } }`
  - Unexpected errors also use the same envelope:
    `{ data: null, error: { code: 'InternalServerError', status: 500, message: '...' } }`

### Migration

```js
// Before
const { error, status, message } = JSON.parse(body)

// After
const { data, error } = JSON.parse(body)
const { code, status, message } = error
```
