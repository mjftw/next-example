import { describe, test, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { createLoggerService, LogLevel, type LoggerService } from './logger';
import { type ConfigurationService } from './configuration';



describe('LoggerService', () => {

    const createMockLoggerService = (level: LogLevel) => {
        const mockConfigService: ConfigurationService = {
            getEnv: vi.fn().mockReturnValue(level)
        };
        const loggerService = createLoggerService(mockConfigService);
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => { });
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => { });
    
        return { loggerService, consoleLogSpy, consoleInfoSpy, consoleWarnSpy, consoleErrorSpy, consoleDebugSpy };
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should log debug messages when log level is debug', () => {
        const { loggerService, consoleDebugSpy } = createMockLoggerService("debug");

        loggerService.debug('Debug message');
        expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"debug","message":"Debug message"'));
    });

    test('should not log debug messages when log level is info', () => {
        const { loggerService, consoleDebugSpy } = createMockLoggerService("info");

        loggerService.debug('Debug message');
        expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    test('should log info messages when log level is info', () => {
        const { loggerService, consoleInfoSpy } = createMockLoggerService("info");

        loggerService.info('Info message');
        expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"info","message":"Info message"'));
    });

    test('should log warn messages when log level is warn', () => {
        const { loggerService, consoleWarnSpy } = createMockLoggerService("warn");

        loggerService.warn('Warning message');
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"warn","message":"Warning message"'));
    });

    test('should log error messages with error object', () => {
        const error = new Error('Test error');
        const { loggerService, consoleErrorSpy } = createMockLoggerService("error");

        loggerService.error('Error message', {}, error);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"level":"error","message":"Error message"'));
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('"name":"Error","message":"Test error"'));
    });

    test('should not log debug messages when log level is info', () => {
        const { loggerService, consoleLogSpy } = createMockLoggerService("info");

        loggerService.debug('Debug message');
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should include metadata in log messages', () => {
        const metadata = { userId: '123', action: 'login' };
        const { loggerService, consoleInfoSpy } = createMockLoggerService("info");

        loggerService.info('User action', metadata);
        expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('"userId":"123","action":"login"'));
    });
});
