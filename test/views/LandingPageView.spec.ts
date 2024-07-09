import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LandingPageView from '@/views/LandingPageView.vue'; // Update this to the correct path

describe('LandingPageView.vue', () => {
    it('has the correct default data', () => {
        const wrapper = mount(LandingPageView);
        expect(wrapper.vm.project_title).toBe('Just a Test'); // Ensure this matches the actual data property
    });

    it('calls login and redirects to the correct URL', () => {
        const wrapper = mount(LandingPageView);

        // Mock window.location.href
        const locationMock = vi.fn();
        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                set href(url) {
                    locationMock(url);
                },
                get href() {
                    return "";
                }
            },
        });

        const route = "http://dummy.com";
        wrapper.vm.login(route);
        expect(locationMock).toHaveBeenCalledWith(`/api/v1/authentication/login?route=${encodeURIComponent(route)}`);
    });
});