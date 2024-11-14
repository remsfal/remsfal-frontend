import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LegalNoticeView from '@/views/LegalNoticeView.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Create a mock router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: { template: '<div>Home</div>' }
        }
    ]
});

describe('LegalNoticeView', () => {
    it('renders properly', () => {
        const wrapper = mount(LegalNoticeView, {
            global: {
                plugins: [router] // Provide the router to the component
            }
        });

        expect(wrapper.exists()).toBe(true);
    });

    it('navigates to home when button is clicked', async () => {
        const wrapper = mount(LegalNoticeView, {
            global: {
                plugins: [router]
            }
        });

        const button = wrapper.find('button');
        await button.trigger('click');

        // Check if router was called with correct path
        expect(router.currentRoute.value.path).toBe('/');
    });
});