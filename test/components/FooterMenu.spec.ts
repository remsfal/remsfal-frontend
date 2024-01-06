import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from "@/router"
import FooterMenu from '@/components/FooterMenu.vue'

describe('FooterMenu', () => {
  test('renders properly', async () => {
    const wrapper = mount(FooterMenu, {plugins: [router]})
    console.log(wrapper.html())
    expect(wrapper.text()).toContain('Impressum')
    expect(wrapper.text()).toContain('Datenschutz')
  })
})
