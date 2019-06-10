module.exports = class ResponseStatus {
    constructor(status, message, data = null){
        this.success = status;
        this.msg = message;
        this.data = data;
    }
}