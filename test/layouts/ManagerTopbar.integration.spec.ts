import { mount } from '@vue/test-utils'
import { it, expect, vi } from 'vitest'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import { useInboxStore } from '@/features/manager/inbox/stores/InboxStore'
import { useUserSessionStore } from '@/stores/UserSession'

// Router mock
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({
    params: {}, query: {}, fullPath: '/', name: undefined, meta: {}
  }),
  RouterLink: { template: '<a><slot /></a>' },
}))

it('updates unread count in topbar when messages change in inbox', async () => {
  const inboxStore = useInboxStore()
  const userStore = useUserSessionStore()

  userStore.user = { email: 'test@example.com' } as unknown as typeof userStore.user

  inboxStore.messages = [
    { id: '1', isRead: false },
    { id: '2', isRead: false },
  ] as unknown as typeof inboxStore.messages

  const topbar = mount(ManagerTopbar)

  // Should now see badge with '2'
  expect(topbar.text()).toContain('2')

  inboxStore.markAsRead(inboxStore.messages[0])
  inboxStore.messages = [...inboxStore.messages]
  await topbar.vm.$nextTick()

  expect(topbar.text()).toContain('1')
})
