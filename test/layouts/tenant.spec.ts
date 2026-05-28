import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import TenantLayout from '@/layouts/tenant.vue'
import AppSimpleTopbar from '@/layouts/components/AppSimpleTopbar.vue'
import TenantMenu from '@/layouts/components/TenantMenu.vue'
import TenantMobileBar from '@/layouts/components/TenantMobileBar.vue'
import AppFooter from '@/layouts/components/AppFooter.vue'

const mocks = vi.hoisted(() => ({ setFullscreen: vi.fn() }))

vi.mock('@/layouts/composables/layout', () => ({
  useLayout: () => ({
    layoutConfig: { menuMode: 'static' },
    layoutState: {
 staticMenuDesktopInactive: false, overlayMenuActive: false, menuHoverActive: false 
},
    isSidebarActive: ref(false),
    setFullscreen: mocks.setFullscreen,
  }),
}))

vi.mock('@/layouts/components/AppSimpleTopbar.vue', () => ({ default: { template: '<div data-test="app-simple-topbar" />' } }))
vi.mock('@/layouts/components/TenantMenu.vue', () => ({ default: { template: '<div data-test="tenant-menu" />' } }))
vi.mock('@/layouts/components/TenantMobileBar.vue', () => ({ default: { template: '<div data-test="tenant-mobilebar" />' } }))
vi.mock('@/layouts/components/AppFooter.vue', () => ({ default: { template: '<div data-test="app-footer" />' } }))

describe('layouts/tenant.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders AppSimpleTopbar', async () => {
    const wrapper = mount(TenantLayout)
    await flushPromises()
    expect(wrapper.findComponent(AppSimpleTopbar).exists()).toBe(true)
  })

  it('renders TenantMenu', async () => {
    const wrapper = mount(TenantLayout)
    await flushPromises()
    expect(wrapper.findComponent(TenantMenu).exists()).toBe(true)
  })

  it('renders TenantMobileBar', async () => {
    const wrapper = mount(TenantLayout)
    await flushPromises()
    expect(wrapper.findComponent(TenantMobileBar).exists()).toBe(true)
  })

  it('renders AppFooter', async () => {
    const wrapper = mount(TenantLayout)
    await flushPromises()
    expect(wrapper.findComponent(AppFooter).exists()).toBe(true)
  })

  it('renders slot content', async () => {
    const wrapper = mount(TenantLayout, {slots: { default: '<div data-test="page-content">Seite</div>' },})
    await flushPromises()
    expect(wrapper.find('[data-test="page-content"]').exists()).toBe(true)
  })

  it('calls setFullscreen(false) on mount', async () => {
    mount(TenantLayout)
    await flushPromises()
    expect(mocks.setFullscreen).toHaveBeenCalledWith(false)
  })

  it('renders layout-wrapper element', async () => {
    const wrapper = mount(TenantLayout)
    await flushPromises()
    expect(wrapper.find('.layout-wrapper').exists()).toBe(true)
  })
})
