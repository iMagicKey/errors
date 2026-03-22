export class HttpError extends Error {
    constructor(status = 500, message = 'HTTP Error', details = null) {
        super(message)
        this.name = this.constructor.name
        this.status = status
        this.details = details
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor)
        }
    }

    toJSON() {
        return {
            code: this.name,
            status: this.status,
            message: this.message,
            ...(this.details !== null && { details: this.details }),
        }
    }
}
