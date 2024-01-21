class APIError extends Error {
    constructor(
        message,
        statusCode = httpStatus.INTERNAL_SERVER_ERROR,
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export { APIError }