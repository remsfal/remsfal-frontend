import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import ProjectSettingsView from '../../src/views/ProjectSettingsView.vue';
import { projectMemberService, type GetMembersResponse } from '../../src/services/ProjectMemberService';

// ---- Router mock ----
const routerPushMock = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

describe('ProjectSettingsView.vue', () => {
  let wrapper: VueWrapper<any>;

  // ---- Mock data ----
  const mockMembers: GetMembersResponse = {
    members: [
      { id: '1', email: 'test1@example.com', role: 'MANAGER' },
      { id: '2', email: 'test2@example.com', role: 'TENANCY' },
    ],
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock service methods
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue(mockMembers);
    vi.spyOn(projectMemberService, 'updateMemberRole').mockResolvedValue({
      id: '1',
      email: 'test1@example.com',
      role: 'MANAGER',
    });

    wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'test-project-id' },
    });

    // wait for API + DOM updates
    await flushPromises();
  });

  test('loads project member settings successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBe(6); // 2 members x 3 columns
    expect(rows[0].text()).toBe('test1@example.com');
    expect(rows[3].text()).toBe('test2@example.com');
  });

  test('calls getMembers with correct projectId', () => {
    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
  });

  test('updates a member role successfully', async () => {
    // grab first select (role for first member)
    const select = wrapper.findAllComponents({ name: 'Select' })[0];

    // simulate user selecting a new role
    await select.setValue('MANAGER');

    expect(projectMemberService.updateMemberRole).toHaveBeenCalledWith(
      'test-project-id',
      '1',
      { role: 'MANAGER' }
    );
  });
});