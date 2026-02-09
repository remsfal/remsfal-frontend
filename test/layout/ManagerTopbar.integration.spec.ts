import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { it, expect, vi } from 'vitest'
import ManagerTopbar from '@/layout/ManagerTopbar.vue'
import { useInboxStore } from '@/stores/InboxStore'
import { useUserSessionStore } from '@/stores/UserSession'

// Router mock
const mockPush = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }))

it('updates unread count in topbar when messages change in inbox', async () => {
  const pinia = createTestingPinia({ stubActions: false })
  const inboxStore = useInboxStore(pinia)
  const userStore = useUserSessionStore(pinia)

  userStore.user = { email: 'test@example.com' } as unknown as typeof userStore.user // Mock login

  inboxStore.messages = [
    { id: '1', isRead: false },
    { id: '2', isRead: false },
  ] as unknown as typeof inboxStore.messages

  const topbar = mount(ManagerTopbar, { global: { plugins: [pinia] } })

  // Should now see badge with '2'
  expect(topbar.text()).toContain('2')

  inboxStore.markAsRead(inboxStore.messages[0])
  inboxStore.messages = [...inboxStore.messages]
  await topbar.vm.$nextTick()

  expect(topbar.text()).toContain('1')
})
