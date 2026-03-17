import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import ContractorLayout from '@/layouts/contractor.vue'
import AppSimpleTopbar from '@/layout/AppSimpleTopbar.vue'
import ContractorMenu from '@/layout/ContractorMenu.vue'
import ContractorMobileBar from '@/layout/ContractorMobileBar.vue'
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

vi.mock('@/layout/AppSimpleTopbar.vue', () => ({ default: { template: '<div data-test="app-simple-topbar" />' } }))
vi.mock('@/layout/ContractorMenu.vue', () => ({ default: { template: '<div data-test="contractor-menu" />' } }))
vi.mock('@/layout/ContractorMobileBar.vue', () => ({ default: { template: '<div data-test="contractor-mobilebar" />' } }))
vi.mock('@/layout/AppFooter.vue', () => ({ default: { template: '<div data-test="app-footer" />' } }))

describe('layouts/contractor.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders AppSimpleTopbar', async () => {
    const wrapper = mount(ContractorLayout)
    await flushPromises()
    expect(wrapper.findComponent(AppSimpleTopbar).exists()).toBe(true)
  })

  it('renders ContractorMenu', async () => {
    const wrapper = mount(ContractorLayout)
    await flushPromises()
    expect(wrapper.findComponent(ContractorMenu).exists()).toBe(true)
  })

  it('renders ContractorMobileBar', async () => {
    const wrapper = mount(ContractorLayout)
    await flushPromises()
    expect(wrapper.findComponent(ContractorMobileBar).exists()).toBe(true)
  })

  it('renders AppFooter', async () => {
    const wrapper = mount(ContractorLayout)
    await flushPromises()
    expect(wrapper.findComponent(AppFooter).exists()).toBe(true)
  })

  it('renders slot content', async () => {
    const wrapper = mount(ContractorLayout, {
      slots: { default: '<div data-test="page-content">Seite</div>' },
    })
    await flushPromises()
    expect(wrapper.find('[data-test="page-content"]').exists()).toBe(true)
  })

  it('calls setFullscreen(false) on mount', async () => {
    mount(ContractorLayout)
    await flushPromises()
    expect(mocks.setFullscreen).toHaveBeenCalledWith(false)
  })

  it('renders layout-wrapper element', async () => {
    const wrapper = mount(ContractorLayout)
    await flushPromises()
    expect(wrapper.find('.layout-wrapper').exists()).toBe(true)
  })
})
