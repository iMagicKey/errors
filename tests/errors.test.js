import { describe, it } from 'node:test'
import { expect } from 'chai'
import {
    HttpError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    MethodNotAllowedError,
    ConflictError,
    UnprocessableEntityError,
    TooManyRequestsError,
    InternalServerError,
    BadGatewayError,
    ServiceUnavailableError,
    isHttpError,
} from '../src/index.js'

describe('HttpError', () => {
    it('is an instance of Error', () => {
        const err = new HttpError(400, 'test')
        expect(err).to.be.instanceOf(Error)
        expect(err).to.be.instanceOf(HttpError)
    })

    it('has correct properties', () => {
        const err = new HttpError(404, 'Not found', { id: 123 })
        expect(err.status).to.equal(404)
        expect(err.message).to.equal('Not found')
        expect(err.details).to.deep.equal({ id: 123 })
        expect(err.name).to.equal('HttpError')
    })

    it('uses defaults when called with no arguments', () => {
        const err = new HttpError()
        expect(err.status).to.equal(500)
        expect(err.message).to.equal('HTTP Error')
        expect(err.details).to.be.null
    })

    it('toJSON includes all fields', () => {
        const err = new HttpError(400, 'Bad', { field: 'email' })
        const json = err.toJSON()
        expect(json.status).to.equal(400)
        expect(json.message).to.equal('Bad')
        expect(json.error).to.equal('HttpError')
        expect(json.details.field).to.equal('email')
    })

    it('toJSON omits details when null', () => {
        const err = new HttpError(500, 'Error')
        const json = err.toJSON()
        expect(json).to.not.have.property('details')
    })

    it('has a stack trace', () => {
        const err = new HttpError(500, 'oops')
        expect(err.stack).to.be.a('string')
    })
})

describe('Error subclasses', () => {
    const cases = [
        [BadRequestError, 400, 'Bad Request'],
        [UnauthorizedError, 401, 'Unauthorized'],
        [ForbiddenError, 403, 'Forbidden'],
        [NotFoundError, 404, 'Not Found'],
        [MethodNotAllowedError, 405, 'Method Not Allowed'],
        [ConflictError, 409, 'Conflict'],
        [UnprocessableEntityError, 422, 'Unprocessable Entity'],
        [TooManyRequestsError, 429, 'Too Many Requests'],
        [InternalServerError, 500, 'Internal Server Error'],
        [BadGatewayError, 502, 'Bad Gateway'],
        [ServiceUnavailableError, 503, 'Service Unavailable'],
    ]

    for (const [ErrorClass, status, defaultMsg] of cases) {
        it(`${ErrorClass.name} has status ${status} and default message`, () => {
            const err = new ErrorClass()
            expect(err.status).to.equal(status)
            expect(err.message).to.equal(defaultMsg)
            expect(err).to.be.instanceOf(HttpError)
            expect(err).to.be.instanceOf(Error)
        })

        it(`${ErrorClass.name} has correct name property`, () => {
            const err = new ErrorClass()
            expect(err.name).to.equal(ErrorClass.name)
        })

        it(`${ErrorClass.name} accepts custom message`, () => {
            const err = new ErrorClass('custom msg')
            expect(err.message).to.equal('custom msg')
        })

        it(`${ErrorClass.name} accepts custom message and details`, () => {
            const err = new ErrorClass('custom msg', { field: 'x' })
            expect(err.message).to.equal('custom msg')
            expect(err.details).to.deep.equal({ field: 'x' })
        })

        it(`${ErrorClass.name} toJSON includes status`, () => {
            const json = new ErrorClass().toJSON()
            expect(json.status).to.equal(status)
            expect(json.error).to.equal(ErrorClass.name)
        })
    }
})

describe('isHttpError', () => {
    it('returns true for HttpError instances', () => {
        expect(isHttpError(new HttpError(400, 'test'))).to.be.true
        expect(isHttpError(new NotFoundError())).to.be.true
    })

    it('returns false for regular errors', () => {
        expect(isHttpError(new Error('test'))).to.be.false
    })

    it('returns false for non-error values', () => {
        expect(isHttpError('string')).to.be.false
        expect(isHttpError(null)).to.be.false
        expect(isHttpError(undefined)).to.be.false
        expect(isHttpError(42)).to.be.false
        expect(isHttpError({})).to.be.false
    })

    it('checks status when provided', () => {
        expect(isHttpError(new NotFoundError(), 404)).to.be.true
        expect(isHttpError(new NotFoundError(), 400)).to.be.false
    })

    it('returns false when status is provided but error is not HttpError', () => {
        expect(isHttpError(new Error('test'), 404)).to.be.false
    })
})
