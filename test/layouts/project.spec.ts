import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import ProjectLayout from '@/layouts/project.vue'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import ProjectMenu from '@/layouts/components/ProjectMenu.vue'
import ProjectMobileBar from '@/layouts/components/ProjectMobileBar.vue'
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

vi.mock('@/layouts/components/ManagerTopbar.vue', () => ({ default: { template: '<div data-test="manager-topbar" />' } }))
vi.mock('@/layouts/components/ProjectMenu.vue', () => ({ default: { template: '<div data-test="project-menu" />' } }))
vi.mock('@/layouts/components/ProjectMobileBar.vue', () => ({ default: { template: '<div data-test="project-mobilebar" />' } }))
vi.mock('@/layouts/components/AppFooter.vue', () => ({ default: { template: '<div data-test="app-footer" />' } }))

describe('layouts/project.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders ManagerTopbar', async () => {
    const wrapper = mount(ProjectLayout)
    await flushPromises()
    expect(wrapper.findComponent(ManagerTopbar).exists()).toBe(true)
  })

  it('renders ProjectMenu', async () => {
    const wrapper = mount(ProjectLayout)
    await flushPromises()
    expect(wrapper.findComponent(ProjectMenu).exists()).toBe(true)
  })

  it('renders ProjectMobileBar', async () => {
    const wrapper = mount(ProjectLayout)
    await flushPromises()
    expect(wrapper.findComponent(ProjectMobileBar).exists()).toBe(true)
  })

  it('renders AppFooter', async () => {
    const wrapper = mount(ProjectLayout)
    await flushPromises()
    expect(wrapper.findComponent(AppFooter).exists()).toBe(true)
  })

  it('renders slot content', async () => {
    const wrapper = mount(ProjectLayout, {slots: { default: '<div data-test="page-content">Seite</div>' },})
    await flushPromises()
    expect(wrapper.find('[data-test="page-content"]').exists()).toBe(true)
  })

  it('calls setFullscreen(false) on mount', async () => {
    mount(ProjectLayout)
    await flushPromises()
    expect(mocks.setFullscreen).toHaveBeenCalledWith(false)
  })

  it('renders layout-wrapper element', async () => {
    const wrapper = mount(ProjectLayout)
    await flushPromises()
    expect(wrapper.find('.layout-wrapper').exists()).toBe(true)
  })
})
