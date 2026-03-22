import { HttpError } from './HttpError.js'

/**
 * Wraps a route handler in try/catch, catches HttpError instances,
 * and sends JSON error responses.
 *
 * Usage:
 *   server.createRoute({ url: '/users', methods: ['GET'] }, catchErrors(async (req, res) => {
 *       throw new NotFoundError('User not found')
 *   }))
 */
export function catchErrors(handler) {
    return async (req, res) => {
        try {
            await handler(req, res)
        } catch (err) {
            if (err instanceof HttpError) {
                res.writeHead(err.status, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ data: null, error: err.toJSON() }))
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ data: null, error: { code: 'InternalServerError', status: 500, message: 'An unexpected error occurred' } }))
            }
        }
    }
}
