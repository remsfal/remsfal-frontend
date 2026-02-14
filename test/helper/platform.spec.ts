import { describe, it, expect } from 'vitest';
import { isNativePlatform, isDevMode, shouldShowDevLogin } from '@/helper/platform';

describe('Platform Helper', () => {
    describe('isNativePlatform', () => {
        it('should return false when running in web/test environment', () => {
            // In test environment (jsdom), we're always on web platform
            const result = isNativePlatform();
            expect(result).toBe(false);
        });

        it('should return a boolean value', () => {
            const result = isNativePlatform();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('isDevMode', () => {
        it('should return true in test/development environment', () => {
            // DEV is true during vitest run
            const result = isDevMode();
            expect(result).toBe(true);
        });

        it('should return a boolean value', () => {
            const result = isDevMode();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('shouldShowDevLogin', () => {
        it('should return false when on web platform (test environment)', () => {
            // In test environment (web), Dev Login should not be shown
            const result = shouldShowDevLogin();
            expect(result).toBe(false);
        });

        it('should return a boolean value', () => {
            const result = shouldShowDevLogin();
            expect(typeof result).toBe('boolean');
        });

        it('should only return true on native platforms', () => {
            // Since we're in web/test environment, this should always be false
            // This tests the function's behavior, not the implementation
            const result = shouldShowDevLogin();
            expect(result).toBe(isNativePlatform());
        });
    });
});
