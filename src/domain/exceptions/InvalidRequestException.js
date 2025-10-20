export default class InvalidRequestException extends Error {
    constructor(message = 'Requisição inválida') {
        super(message);
        this.name = 'InvalidRequestException';

    }
}