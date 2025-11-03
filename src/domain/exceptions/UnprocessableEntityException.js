'use strict';
export default class ConflictException extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictException';
    this.status = 409;
  }
}