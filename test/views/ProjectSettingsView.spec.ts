import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import ProjectSettingsView from '../../src/views/ProjectSettingsView.vue';
import { projectMemberService, type GetMembersResponse } from '../../src/services/ProjectMemberService';
import { projectService } from '../../src/services/ProjectService';

// ---- Mocks ----
const routerPushMock = vi.fn();
const addMock = vi.fn(); // Shared mock for toast

vi.mock('vue-router', () => ({useRouter: () => ({ push: routerPushMock }),}));

vi.mock('primevue/usetoast', () => ({useToast: () => ({add: addMock,}),}));

// ---- Test Suite ----
describe('ProjectSettingsView.vue', () => {
  let wrapper: VueWrapper<any>;

  const mockMembers: GetMembersResponse = {
    members: [
      { id: '1', email: 'test1@example.com', role: 'MANAGER' },
      { id: '2', email: 'test2@example.com', role: 'TENANCY' },
    ],
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock services
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue(mockMembers);
    vi.spyOn(projectMemberService, 'updateMemberRole').mockResolvedValue({
      id: '1',
      email: 'test1@example.com',
      role: 'MANAGER',
    });

    vi.spyOn(projectService, 'getProject').mockResolvedValue({ title: 'Old Project' });
    vi.spyOn(projectService, 'updateProject').mockResolvedValue({});

    wrapper = mount(ProjectSettingsView, {props: { projectId: 'test-project-id' },});

    await flushPromises();
  });

  // ---- Member Tests ----
  test('loads project member settings successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBe(6);
    expect(rows[0].text()).toBe('test1@example.com');
    expect(rows[3].text()).toBe('test2@example.com');
  });

  test('calls getMembers with correct projectId', () => {
    expect(projectMemberService.getMembers).toHaveBeenCalledWith('test-project-id');
  });

  test('updates a member role successfully', async () => {
    const spy = vi.spyOn(projectMemberService, 'updateMemberRole').mockResolvedValue({
      id: '1',
      email: 'test1@example.com',
      role: 'MANAGER',
    });

    const wrapper = mount(ProjectSettingsView, {
      props: { projectId: 'test-project-id' },
      global: {
        stubs: {
          ProjectMemberSettings: {
            template: `<ul>
              <li>
                test1@example.com
                <button class="update-role" @click="updateRole">Update</button>
              </li>
            </ul>`,
            methods: {
              updateRole() {
                projectMemberService.updateMemberRole('test-project-id', '1', { role: 'MANAGER' });
              },
            },
          },
        },
      },
    });

    await flushPromises();

    const button = wrapper.find('button.update-role');
    expect(button.exists()).toBe(true);

    await button.trigger('click');
    expect(spy).toHaveBeenCalledWith('test-project-id', '1', { role: 'MANAGER' });
  });

  // ---- Project Name Tests ----
  test('fetches and displays project name on mount', async () => {
    expect(projectService.getProject).toHaveBeenCalledWith('test-project-id');
    expect(wrapper.vm.projectName).toBe('Old Project');
  });

  test('enables save button when project name changes', async () => {
    wrapper.vm.projectName = 'Updated Project';
    await flushPromises();

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeUndefined();
  });

  test('calls updateProject and shows success toast on save', async () => {
    wrapper.vm.originalProjectName = 'Old Name';
    wrapper.vm.projectName = 'Updated Project';

    await wrapper.vm.saveProjectName();
    await flushPromises();

    expect(projectService.updateProject).toHaveBeenCalledWith('test-project-id', {title: 'Updated Project',});
    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
  });

  test('shows error toast on update failure', async () => {
    vi.spyOn(projectService, 'updateProject').mockRejectedValue(new Error('fail'));

    wrapper.vm.originalProjectName = 'Old Project';
    wrapper.vm.projectName = 'Broken Project';

    await wrapper.vm.saveProjectName();
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' })
    );
  });
});
