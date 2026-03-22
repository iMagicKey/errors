import { HttpError } from './HttpError.js'

function createHttpErrorClass(name, status, defaultMessage) {
    class SpecificError extends HttpError {
        constructor(message = defaultMessage, details = null) {
            super(status, message, details)
            this.name = name
        }
    }
    Object.defineProperty(SpecificError, 'name', { value: name })
    return SpecificError
}

export const BadRequestError = createHttpErrorClass('BadRequestError', 400, 'Bad Request')
export const UnauthorizedError = createHttpErrorClass('UnauthorizedError', 401, 'Unauthorized')
export const ForbiddenError = createHttpErrorClass('ForbiddenError', 403, 'Forbidden')
export const NotFoundError = createHttpErrorClass('NotFoundError', 404, 'Not Found')
export const MethodNotAllowedError = createHttpErrorClass('MethodNotAllowedError', 405, 'Method Not Allowed')
export const ConflictError = createHttpErrorClass('ConflictError', 409, 'Conflict')
export const UnprocessableEntityError = createHttpErrorClass('UnprocessableEntityError', 422, 'Unprocessable Entity')
export const TooManyRequestsError = createHttpErrorClass('TooManyRequestsError', 429, 'Too Many Requests')
export const InternalServerError = createHttpErrorClass('InternalServerError', 500, 'Internal Server Error')
export const BadGatewayError = createHttpErrorClass('BadGatewayError', 502, 'Bad Gateway')
export const ServiceUnavailableError = createHttpErrorClass('ServiceUnavailableError', 503, 'Service Unavailable')
