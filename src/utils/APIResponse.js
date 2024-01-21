class APIResponse {
    constructor(statusCode, data, message) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.succcess = statusCode < 400
    }
}

export { APIResponse }