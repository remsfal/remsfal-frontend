import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { routeLocationKey } from 'vue-router'
import router from '@/router'
import { config } from '@vue/test-utils'
import AppRoleMobileBar from '@/layouts/components/AppRoleMobileBar.vue'
import type { MobileNavItem } from '@/layouts/composables/useMobileBarActiveState'

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }))
vi.mock('@/helper/platform', () => ({ isNativePlatform: () => false }))
vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: {
    name: 'FontAwesomeIcon', template: '<i class="fa-icon" />', props: ['icon'] 
  },
}))

config.global.plugins = config.global.plugins.filter((p) => p !== router)

const RouterLinkStub = { template: '<a><slot /></a>', props: ['to'] }
const DrawerStub = {
  template: '<div class="p-drawer" v-if="visible"><slot /></div>',
  props: ['visible'],
}

const defaultRoute = {
  path: '/', name: 'Home', params: {}, query: {} 
}

const navItems: MobileNavItem[] = [
  {
    label: 'Dashboard', to: { name: 'ManagerDashboard' }, icon: 'pi-home'
  },
  {
    label: 'Settings', to: { name: 'ManagerSettings' }, icon: 'pi-cog'
  },
]

const mountBar = (
  items = navItems,
  route = defaultRoute,
  isActiveFn?: (item: MobileNavItem) => boolean,
  slot = '<div data-test="menu" />',
) => {
  const routeRef = reactive(route)
  return mount(AppRoleMobileBar, {
    props: { navItems: items, ...(isActiveFn ? { isActiveFn } : {}) },
    slots: { default: slot },
    global: {
      provide: { [routeLocationKey as symbol]: routeRef },
      stubs: { RouterLink: RouterLinkStub, Drawer: DrawerStub },
    },
  })
}

describe('AppRoleMobileBar.vue', () => {
  it('renders all nav items', () => {
    const wrapper = mountBar()
    expect(wrapper.findAll('a.nav-item')).toHaveLength(2)
  })

  it('renders the more button', () => {
    const wrapper = mountBar()
    expect(wrapper.find('.more-btn').exists()).toBe(true)
  })

  it('renders slot content inside drawer after toggle', async () => {
    const wrapper = mountBar()
    await wrapper.find('.more-btn').trigger('click')
    expect(wrapper.find('[data-test="menu"]').exists()).toBe(true)
  })

  it('toggles sidebar via more button', async () => {
    const wrapper = mountBar()
    expect(wrapper.find('.p-drawer').exists()).toBe(false)
    await wrapper.find('.more-btn').trigger('click')
    expect(wrapper.find('.p-drawer').exists()).toBe(true)
    await wrapper.find('.more-btn').trigger('click')
    expect(wrapper.find('.p-drawer').exists()).toBe(false)
  })

  it('marks item active using composable isActive when no isActiveFn provided', () => {
    const route = reactive({
      path: '/', name: 'ManagerDashboard', params: {}, query: {}
    })
    const wrapper = mount(AppRoleMobileBar, {
      props: { navItems },
      slots: { default: '<div />' },
      global: {
        provide: { [routeLocationKey as symbol]: route },
        stubs: { RouterLink: RouterLinkStub, Drawer: DrawerStub },
      },
    })
    const items = wrapper.findAll('a.nav-item')
    expect(items[0].classes()).toContain('active')
    expect(items[1].classes()).not.toContain('active')
  })

  it('uses isActiveFn prop when provided instead of composable logic', () => {
    const alwaysActive = () => true
    const wrapper = mountBar(navItems, defaultRoute, alwaysActive)
    wrapper.findAll('a.nav-item').forEach((item) => {
      expect(item.classes()).toContain('active')
    })
  })

  it('renders PrimeIcon for string icon', () => {
    const items: MobileNavItem[] = [{
      label: 'Test', to: '/', icon: 'pi-star' 
    }]
    const wrapper = mountBar(items)
    const icon = wrapper.find('i.pi')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('pi-star')
  })

  it('renders PrimeIcon for pi-type object icon', () => {
    const items: MobileNavItem[] = [
      {
        label: 'Test', to: '/', icon: { type: 'pi', name: 'pi pi-star' } 
      },
    ]
    const wrapper = mountBar(items)
    const icon = wrapper.find('i.pi')
    expect(icon.exists()).toBe(true)
    expect(icon.classes()).toContain('pi')
  })

  it('renders FontAwesomeIcon for fa-type object icon', () => {
    const items: MobileNavItem[] = [
      {
        label: 'Test', to: '/', icon: { type: 'fa', name: ['fas', 'home'] } 
      },
    ]
    const wrapper = mountBar(items)
    const navItem = wrapper.find('a.nav-item')
    expect(navItem.find('i.fa-icon').exists()).toBe(true)
    expect(navItem.find('i.pi').exists()).toBe(false)
  })

  it('renders sr-only label for each nav item', () => {
    const wrapper = mountBar()
    const labels = wrapper.findAll('.sr-only')
    expect(labels[0].text()).toBe('Dashboard')
    expect(labels[1].text()).toBe('Settings')
  })
})
