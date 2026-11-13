import { mount } from '@vue/test-utils'
import { it, expect, vi } from 'vitest'
import ManagerTopbar from '@/layouts/components/ManagerTopbar.vue'
import { useActivityFeedStore } from '@/features/manager/activityFeeds/stores/ActivityFeedStore'
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

it('updates unread count in topbar when entries change in activity feed', async () => {
  const activityFeedStore = useActivityFeedStore()
  const userStore = useUserSessionStore()

  userStore.user = { email: 'test@example.com' } as unknown as typeof userStore.user

  activityFeedStore.entries = [
    { id: '1', read: false },
    { id: '2', read: false },
  ] as unknown as typeof activityFeedStore.entries

  const topbar = mount(ManagerTopbar)

  // Should now see badge with '2'
  expect(topbar.text()).toContain('2')

  activityFeedStore.markAsRead(activityFeedStore.entries[0])
  activityFeedStore.entries = [...activityFeedStore.entries]
  await topbar.vm.$nextTick()

  expect(topbar.text()).toContain('1')
})
