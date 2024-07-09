import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from '@/views/LandingPageView.vue'

describe('Component', () => {
    it('has the correct default data', () => {
        const wrapper = mount(Component)
        expect(wrapper.vm.project_title).toBe('Just a Test')
    })

    it('calls login and redirects to the correct URL', () => {
        const wrapper = mount(Component)
        global.window = Object.create(window)
        const route = "http://dummy.com"
        Object.defineProperty(window, 'location', {
            value: {
                href: '',
            },
            writable: true,
        })

        wrapper.vm.login(route)
        expect(window.location.href).toBe(`/api/v1/authentication/login?route=${encodeURIComponent(route)}`)
    })
})
