import { describe, it } from 'node:test'
import { expect } from 'chai'
import { NotFoundError, BadRequestError, HttpError, catchErrors } from '../src/index.js'

function makeMock() {
    const headers = {}
    let statusCode = 200
    let body = ''
    const res = {
        get statusCode() {
            return statusCode
        },
        set statusCode(v) {
            statusCode = v
        },
        writeHead(code, hdrs) {
            statusCode = code
            Object.assign(headers, hdrs || {})
        },
        end(data) {
            body = data || ''
        },
        headers,
        get body() {
            return body
        },
    }
    const req = {}
    return { req, res }
}

describe('catchErrors', () => {
    it('calls handler normally when no error', async () => {
        const { req, res } = makeMock()
        let called = false
        const handler = catchErrors(async (_req, _res) => {
            called = true
        })
        await handler(req, res)
        expect(called).to.be.true
    })

    it('returns JSON error for HttpError', async () => {
        const { req, res } = makeMock()
        const handler = catchErrors(async () => {
            throw new NotFoundError('User not found')
        })
        await handler(req, res)
        expect(res.statusCode).to.equal(404)
        const parsed = JSON.parse(res.body)
        expect(parsed.data).to.be.null
        expect(parsed.error.status).to.equal(404)
        expect(parsed.error.message).to.equal('User not found')
        expect(parsed.error.code).to.equal('NotFoundError')
    })

    it('returns 500 for non-HttpError', async () => {
        const { req, res } = makeMock()
        const handler = catchErrors(async () => {
            throw new Error('unexpected')
        })
        await handler(req, res)
        expect(res.statusCode).to.equal(500)
        const parsed = JSON.parse(res.body)
        expect(parsed.data).to.be.null
        expect(parsed.error.status).to.equal(500)
        expect(parsed.error.code).to.equal('InternalServerError')
    })

    it('sets Content-Type to application/json on error', async () => {
        const { req, res } = makeMock()
        const handler = catchErrors(async () => {
            throw new BadRequestError('bad input')
        })
        await handler(req, res)
        expect(res.headers['Content-Type']).to.equal('application/json')
    })

    it('sets Content-Type to application/json on unexpected error', async () => {
        const { req, res } = makeMock()
        const handler = catchErrors(async () => {
            throw new TypeError('oops')
        })
        await handler(req, res)
        expect(res.headers['Content-Type']).to.equal('application/json')
    })

    it('passes req and res to handler', async () => {
        const { req, res } = makeMock()
        let receivedReq, receivedRes
        const handler = catchErrors(async (r, s) => {
            receivedReq = r
            receivedRes = s
        })
        await handler(req, res)
        expect(receivedReq).to.equal(req)
        expect(receivedRes).to.equal(res)
    })

    it('includes details in error response when provided', async () => {
        const { req, res } = makeMock()
        const handler = catchErrors(async () => {
            throw new HttpError(400, 'Validation failed', { field: 'email' })
        })
        await handler(req, res)
        const parsed = JSON.parse(res.body)
        expect(parsed.error.details.field).to.equal('email')
    })

    it('handles synchronous throws in wrapped handler', async () => {
        const { req, res } = makeMock()
        const handler = catchErrors((_req, _res) => {
            throw new NotFoundError('sync throw')
        })
        await handler(req, res)
        expect(res.statusCode).to.equal(404)
    })
})
