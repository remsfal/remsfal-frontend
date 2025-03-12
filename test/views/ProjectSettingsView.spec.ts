import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ProjectSettingsView from '../../src/views/ProjectSettingsView.vue';
import { type MemberList, projectMemberService } from '../../src/services/ProjectMemberService';

describe('ProjectSettingsView.vue', () => {
  let wrapper: VueWrapper;

  vi.mock('@/services/ProjectMemberService');

  beforeEach(async () => {
    const mockMembers: MemberList = {
      members: [
        { id: '1', email: 'test1@example.com', role: 'MANAGER' },
        { id: '2', email: 'test2@example.com', role: 'TENANCY' },
      ],
    };
    vi.mocked(projectMemberService.getMembers).mockResolvedValue(mockMembers);
    wrapper = mount(ProjectSettingsView, {
      propsData: {
        projectId: 'test-project-id',
      },
    });
    vi.clearAllMocks();
  });

  test('loads project member settings successfully', async () => {
    const rows = wrapper.findAll('td');
    expect(rows.length).toBe(6);
    expect(rows.at(0).text()).toEqual('test1@example.com');
    expect(rows.at(3).text()).toEqual('test2@example.com');
  });
});
