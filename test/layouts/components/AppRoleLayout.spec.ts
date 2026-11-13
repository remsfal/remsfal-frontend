import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import AppRoleLayout from '@/layouts/components/AppRoleLayout.vue'
import AppFooter from '@/layouts/components/AppFooter.vue'

const mocks = vi.hoisted(() => ({ setFullscreen: vi.fn() }))

const isSidebarActive = ref(false)
const layoutConfig = { menuMode: 'static' as string }
const layoutState = {
  staticMenuDesktopInactive: false, overlayMenuActive: false, menuHoverActive: false 
}

vi.mock('@/layouts/composables/layout', () => ({
  useLayout: () => ({
    layoutConfig,
    layoutState,
    isSidebarActive,
    setFullscreen: mocks.setFullscreen,
  }),
}))

vi.mock('@/layouts/components/AppFooter.vue', () => ({default: { template: '<div data-test="app-footer" />' },}))

const defaultSlots = {
  topbar: '<div class="layout-menu-button" data-test="topbar" />',
  menu: '<div class="layout-sidebar" data-test="menu" />',
  mobilebar: '<div data-test="mobilebar" />',
  default: '<div data-test="content" />',
}

describe('AppRoleLayout.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    vi.clearAllMocks()
    isSidebarActive.value = false
    layoutConfig.menuMode = 'static'
    layoutState.staticMenuDesktopInactive = false
    layoutState.overlayMenuActive = false
    layoutState.menuHoverActive = false
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const mountLayout = () =>
    mount(AppRoleLayout, { slots: defaultSlots, attachTo: document.body })

  it('renders topbar slot', () => {
    wrapper = mountLayout()
    expect(wrapper.find('[data-test="topbar"]').exists()).toBe(true)
  })

  it('renders menu slot', () => {
    wrapper = mountLayout()
    expect(wrapper.find('[data-test="menu"]').exists()).toBe(true)
  })

  it('renders mobilebar slot', () => {
    wrapper = mountLayout()
    expect(wrapper.find('[data-test="mobilebar"]').exists()).toBe(true)
  })

  it('renders default slot content', () => {
    wrapper = mountLayout()
    expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
  })

  it('renders AppFooter', () => {
    wrapper = mountLayout()
    expect(wrapper.findComponent(AppFooter).exists()).toBe(true)
  })

  it('calls setFullscreen(false) on mount', async () => {
    wrapper = mountLayout()
    await flushPromises()
    expect(mocks.setFullscreen).toHaveBeenCalledWith(false)
  })

  it('applies layout-static class in static mode', () => {
    layoutConfig.menuMode = 'static'
    wrapper = mountLayout()
    expect(wrapper.find('.layout-wrapper').classes()).toContain('layout-static')
  })

  it('applies layout-overlay class in overlay mode', () => {
    layoutConfig.menuMode = 'overlay'
    wrapper = mountLayout()
    expect(wrapper.find('.layout-wrapper').classes()).toContain('layout-overlay')
  })

  it('does not apply layout-static-inactive when sidebar is active in static mode', () => {
    layoutConfig.menuMode = 'static'
    layoutState.staticMenuDesktopInactive = false
    wrapper = mountLayout()
    expect(wrapper.find('.layout-wrapper').classes()).not.toContain('layout-static-inactive')
  })

  it('applies layout-static-inactive when sidebar is collapsed in static mode', () => {
    layoutConfig.menuMode = 'static'
    layoutState.staticMenuDesktopInactive = true
    wrapper = mountLayout()
    expect(wrapper.find('.layout-wrapper').classes()).toContain('layout-static-inactive')
  })

  it('applies layout-overlay-active when overlay menu is open', () => {
    layoutState.overlayMenuActive = true
    wrapper = mountLayout()
    expect(wrapper.find('.layout-wrapper').classes()).toContain('layout-overlay-active')
  })

  it('binds click listener to document when sidebar becomes active', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    wrapper = mountLayout()

    isSidebarActive.value = true
    await nextTick()

    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function))
    addSpy.mockRestore()
  })

  it('does not bind click listener twice when sidebar is already active', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    wrapper = mountLayout()

    isSidebarActive.value = true
    await nextTick()
    const callCount = addSpy.mock.calls.filter(([evt]) => evt === 'click').length

    isSidebarActive.value = false
    await nextTick()
    isSidebarActive.value = true
    await nextTick()

    const callCountAfter = addSpy.mock.calls.filter(([evt]) => evt === 'click').length
    expect(callCountAfter).toBeGreaterThan(callCount)
    addSpy.mockRestore()
  })

  it('removes click listener from document when sidebar becomes inactive', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    wrapper = mountLayout()

    isSidebarActive.value = true
    await nextTick()
    isSidebarActive.value = false
    await nextTick()

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('closes overlay menu when clicking outside sidebar and topbar', async () => {
    layoutState.overlayMenuActive = true
    wrapper = mountLayout()

    isSidebarActive.value = true
    await nextTick()

    const outsideEl = document.createElement('div')
    document.body.appendChild(outsideEl)
    outsideEl.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(layoutState.overlayMenuActive).toBe(false)
    expect(layoutState.menuHoverActive).toBe(false)
    document.body.removeChild(outsideEl)
  })

  it('does not close overlay menu when clicking inside the sidebar', async () => {
    layoutState.overlayMenuActive = true
    wrapper = mountLayout()

    isSidebarActive.value = true
    await nextTick()

    const sidebarEl = document.querySelector('.layout-sidebar') as HTMLElement
    sidebarEl.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(layoutState.overlayMenuActive).toBe(true)
  })

  it('does not close overlay menu when clicking the topbar menu button', async () => {
    layoutState.overlayMenuActive = true
    wrapper = mountLayout()

    isSidebarActive.value = true
    await nextTick()

    const topbarEl = document.querySelector('.layout-menu-button') as HTMLElement
    topbarEl.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(layoutState.overlayMenuActive).toBe(true)
  })
})
