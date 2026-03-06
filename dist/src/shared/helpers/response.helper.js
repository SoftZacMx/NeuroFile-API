"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data, message = 'Success') => ({
    error: false,
    result: true,
    data,
    message,
    status_code: 200,
});
exports.successResponse = successResponse;
const errorResponse = (message, status_code = 500, data) => ({
    error: true,
    result: false,
    data: data,
    message,
    status_code,
});
exports.errorResponse = errorResponse;
