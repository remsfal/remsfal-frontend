import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import TenantLayout from '@/layouts/tenant.vue'
import AppSimpleTopbar from '@/layout/AppSimpleTopbar.vue'
import TenantMenu from '@/layout/TenantMenu.vue'
import TenantMobileBar from '@/layout/TenantMobileBar.vue'
import AppFooter from '@/layout/AppFooter.vue'

const mocks = vi.hoisted(() => ({ setFullscreen: vi.fn() }))

vi.mock('@/layout/composables/layout', () => ({
  useLayout: () => ({
    layoutConfig: { menuMode: 'static' },
    layoutState: {
 staticMenuDesktopInactive: false, overlayMenuActive: false, menuHoverActive: false 
},
    isSidebarActive: ref(false),
    setFullscreen: mocks.setFullscreen,
  }),
}))

vi.mock('@/layout/AppSimpleTopbar.vue', () => ({ default: { template: '<div data-test="app-simple-topbar" />' } }))
vi.mock('@/layout/TenantMenu.vue', () => ({ default: { template: '<div data-test="tenant-menu" />' } }))
vi.mock('@/layout/TenantMobileBar.vue', () => ({ default: { template: '<div data-test="tenant-mobilebar" />' } }))
vi.mock('@/layout/AppFooter.vue', () => ({ default: { template: '<div data-test="app-footer" />' } }))

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
