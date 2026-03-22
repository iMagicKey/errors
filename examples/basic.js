import { NotFoundError, ForbiddenError, isHttpError, catchErrors } from '../src/index.js'
import http from 'node:http'

// Example: using imagic-errors with a plain node:http server
const server = http.createServer((req, res) => {
    const handler = catchErrors(async (request, response) => {
        if (request.url === '/') {
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ ok: true }))
        } else if (request.url === '/forbidden') {
            throw new ForbiddenError('Access denied')
        } else {
            throw new NotFoundError(`Route ${request.url} not found`)
        }
    })
    handler(req, res)
})

server.listen(3001, '127.0.0.1', () => {
    console.log('Server running on http://127.0.0.1:3001')
    console.log('Try: curl http://127.0.0.1:3001/missing')
    console.log('Try: curl http://127.0.0.1:3001/forbidden')

    // Demo isHttpError usage
    const err = new NotFoundError('demo')
    console.log('isHttpError(new NotFoundError()):', isHttpError(err))
    console.log('isHttpError(err, 404):', isHttpError(err, 404))
    console.log('isHttpError(err, 400):', isHttpError(err, 400))
    console.log('isHttpError(new Error()):', isHttpError(new Error('plain')))

    // Auto-close after 2s for demo
    setTimeout(() => {
        server.close()
        console.log('Server closed.')
    }, 2000)
})
