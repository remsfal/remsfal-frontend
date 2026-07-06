import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { useProjectMembers } from '@/composables/useProjectMembers';
import { projectMemberService, type ProjectMemberListJson } from '@/services/ProjectMemberService';
import { organizationMemberService, type OrganizationMemberListJson } from '@/services/OrganizationMemberService';

vi.mock('@/services/ProjectMemberService', async () => {
  const actual = await vi.importActual<typeof import('@/services/ProjectMemberService')>('@/services/ProjectMemberService');
  return {
    ...actual,
    projectMemberService: {getMembers: vi.fn(),},
  };
});

vi.mock('@/services/OrganizationMemberService', async () => {
  const actual = await vi.importActual<typeof import('@/services/OrganizationMemberService')>(
    '@/services/OrganizationMemberService',
  );
  return {
    ...actual,
    organizationMemberService: {getOrganizations: vi.fn(),},
  };
});

const TestComponent = defineComponent({
  props: {projectId: {type: String, required: true,},},
  setup(props) {
    return { ...useProjectMembers(() => props.projectId) };
  },
  template: '<div></div>',
});

describe('useProjectMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns direct project members', async () => {
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [{
        id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' 
      }],
    } as ProjectMemberListJson);
    vi.spyOn(organizationMemberService, 'getOrganizations')
      .mockResolvedValue({ organizations: [] } as OrganizationMemberListJson);

    const wrapper = mount(TestComponent, { props: { projectId: 'project-1' } });
    await flushPromises();

    expect(wrapper.vm.members).toEqual([
      {
        id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' 
      },
    ]);
  });

  it('includes members derived from organizations assigned to the project', async () => {
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [{
        id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' 
      }],
    } as ProjectMemberListJson);
    vi.spyOn(organizationMemberService, 'getOrganizations').mockResolvedValue({
      organizations: [
        {
          organizationId: 'org-1',
          organizationName: 'Test GmbH',
          role: 'STAFF',
          members: [{
            id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF' 
          }],
        },
      ],
    } as OrganizationMemberListJson);

    const wrapper = mount(TestComponent, { props: { projectId: 'project-1' } });
    await flushPromises();

    expect(wrapper.vm.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'user-1', name: 'John Doe' }),
        expect.objectContaining({ id: 'user-2', name: 'Jane Smith' }),
      ]),
    );
    expect(wrapper.vm.members).toHaveLength(2);
  });

  it('dedupes members present both directly and via an organization, keeping the direct entry', async () => {
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [{
        id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' 
      }],
    } as ProjectMemberListJson);
    vi.spyOn(organizationMemberService, 'getOrganizations').mockResolvedValue({
      organizations: [
        {
          organizationId: 'org-1',
          organizationName: 'Test GmbH',
          role: 'STAFF',
          members: [{
            id: 'user-1', name: 'John Doe (Org)', email: 'john@example.com', role: 'STAFF' 
          }],
        },
      ],
    } as OrganizationMemberListJson);

    const wrapper = mount(TestComponent, { props: { projectId: 'project-1' } });
    await flushPromises();

    expect(wrapper.vm.members).toHaveLength(1);
    expect(wrapper.vm.members[0]).toEqual(
      expect.objectContaining({
        id: 'user-1', name: 'John Doe', role: 'MANAGER' 
      }),
    );
  });

  it('still returns direct members when the organizations request fails', async () => {
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [{
        id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' 
      }],
    } as ProjectMemberListJson);
    vi.spyOn(organizationMemberService, 'getOrganizations').mockRejectedValue(new Error('network error'));

    const wrapper = mount(TestComponent, { props: { projectId: 'project-1' } });
    await flushPromises();

    expect(wrapper.vm.members).toEqual([
      {
        id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' 
      },
    ]);
  });

  it('still returns organization members when the direct members request fails', async () => {
    vi.spyOn(projectMemberService, 'getMembers').mockRejectedValue(new Error('network error'));
    vi.spyOn(organizationMemberService, 'getOrganizations').mockResolvedValue({
      organizations: [
        {
          organizationId: 'org-1',
          organizationName: 'Test GmbH',
          role: 'STAFF',
          members: [{
            id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF' 
          }],
        },
      ],
    } as OrganizationMemberListJson);

    const wrapper = mount(TestComponent, { props: { projectId: 'project-1' } });
    await flushPromises();

    expect(wrapper.vm.members).toEqual([
      {
        id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF' 
      },
    ]);
  });

  it('refetches when projectId changes', async () => {
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({ members: [] } as ProjectMemberListJson);
    vi.spyOn(organizationMemberService, 'getOrganizations')
      .mockResolvedValue({ organizations: [] } as OrganizationMemberListJson);

    mount(TestComponent, { props: { projectId: 'project-1' } });
    await flushPromises();

    expect(projectMemberService.getMembers).toHaveBeenCalledWith('project-1');

    const wrapper = mount(TestComponent, { props: { projectId: 'project-2' } });
    await flushPromises();

    expect(projectMemberService.getMembers).toHaveBeenCalledWith('project-2');
    expect(wrapper.vm.loading).toBe(false);
  });
});
