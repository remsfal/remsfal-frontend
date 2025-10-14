import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import PrimeVue from 'primevue/config'
import i18n from '../../src/i18n/i18n'
import { describe, it, expect, vi } from 'vitest'
import InboxView from '../../src/views/InboxView.vue'
import ManagerTopbar from '../../src/layout/ManagerTopbar.vue'
import { useInboxStore } from '../../src/stores/InboxStore'
import { useUserSessionStore } from '../../src/stores/UserSession'

// Router mock
const mockPush = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }))

it('updates unread count in topbar when messages change in inbox', async () => {
  const pinia = createTestingPinia({ stubActions: false })
  const inboxStore = useInboxStore(pinia)
  const userStore = useUserSessionStore(pinia)

  userStore.user = { email: 'test@example.com' } as any // Mock login

  inboxStore.messages = [
    { id: '1', isRead: false },
    { id: '2', isRead: false },
  ] as any

  const topbar = mount(ManagerTopbar, { global: { plugins: [pinia, PrimeVue, i18n] } })
  const inbox = mount(InboxView, { global: { plugins: [pinia, PrimeVue, i18n] } })

  // Should now see badge with '2'
  expect(topbar.text()).toContain('2')

  inboxStore.markAsRead(inboxStore.messages[0])
  inboxStore.messages = [...inboxStore.messages]
  await topbar.vm.$nextTick()

  expect(topbar.text()).toContain('1')
})
