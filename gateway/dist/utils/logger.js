"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), config_1.IS_PRODUCTION
    ? winston_1.default.format.json()
    : winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`)));
// Create logger instance
const logger = winston_1.default.createLogger({
    level: config_1.LOG_LEVEL,
    format: logFormat,
    transports: [
        new winston_1.default.transports.Console(),
        // Add file transport for production
        ...(config_1.IS_PRODUCTION
            ? [
                new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'combined.log' }),
            ]
            : []),
    ],
});
exports.default = logger;
