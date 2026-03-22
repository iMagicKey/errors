import { HttpError } from './HttpError.js'
import {
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
} from './errors.js'
import { catchErrors } from './middleware.js'

export {
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
    catchErrors,
}

export function isHttpError(err, status) {
    const isHttp = err instanceof HttpError
    if (status !== undefined) return isHttp && err.status === status
    return isHttp
}
