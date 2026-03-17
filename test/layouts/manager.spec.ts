import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import ManagerLayout from '@/layouts/manager.vue'
import ManagerTopbar from '@/layout/ManagerTopbar.vue'
import ManagerMenu from '@/layout/ManagerMenu.vue'
import ManagerMobileBar from '@/layout/ManagerMobileBar.vue'
import AppFooter from '@/layout/AppFooter.vue'

const mocks = vi.hoisted(() => ({ setFullscreen: vi.fn() }))

vi.mock('@/layout/composables/layout', () => ({
  useLayout: () => ({
    layoutConfig: { menuMode: 'static' },
    layoutState: { staticMenuDesktopInactive: false, overlayMenuActive: false, menuHoverActive: false },
    isSidebarActive: ref(false),
    setFullscreen: mocks.setFullscreen,
  }),
}))

vi.mock('@/layout/ManagerTopbar.vue', () => ({ default: { template: '<div data-test="manager-topbar" />' } }))
vi.mock('@/layout/ManagerMenu.vue', () => ({ default: { template: '<div data-test="manager-menu" />' } }))
vi.mock('@/layout/ManagerMobileBar.vue', () => ({ default: { template: '<div data-test="manager-mobilebar" />' } }))
vi.mock('@/layout/AppFooter.vue', () => ({ default: { template: '<div data-test="app-footer" />' } }))

describe('layouts/manager.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders ManagerTopbar', async () => {
    const wrapper = mount(ManagerLayout)
    await flushPromises()
    expect(wrapper.findComponent(ManagerTopbar).exists()).toBe(true)
  })

  it('renders ManagerMenu', async () => {
    const wrapper = mount(ManagerLayout)
    await flushPromises()
    expect(wrapper.findComponent(ManagerMenu).exists()).toBe(true)
  })

  it('renders ManagerMobileBar', async () => {
    const wrapper = mount(ManagerLayout)
    await flushPromises()
    expect(wrapper.findComponent(ManagerMobileBar).exists()).toBe(true)
  })

  it('renders AppFooter', async () => {
    const wrapper = mount(ManagerLayout)
    await flushPromises()
    expect(wrapper.findComponent(AppFooter).exists()).toBe(true)
  })

  it('renders slot content', async () => {
    const wrapper = mount(ManagerLayout, {
      slots: { default: '<div data-test="page-content">Seite</div>' },
    })
    await flushPromises()
    expect(wrapper.find('[data-test="page-content"]').exists()).toBe(true)
  })

  it('calls setFullscreen(false) on mount', async () => {
    mount(ManagerLayout)
    await flushPromises()
    expect(mocks.setFullscreen).toHaveBeenCalledWith(false)
  })

  it('renders layout-wrapper element', async () => {
    const wrapper = mount(ManagerLayout)
    await flushPromises()
    expect(wrapper.find('.layout-wrapper').exists()).toBe(true)
  })
})
