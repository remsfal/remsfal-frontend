import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MemberAutoComplete from '@/components/MemberAutoComplete.vue';
import { type ProjectMemberListJson, projectMemberService } from '@/services/ProjectMemberService';
import { type OrganizationMemberListJson, organizationMemberService } from '@/services/OrganizationMemberService';
import AutoComplete from 'primevue/autocomplete';

vi.mock('@/services/ProjectMemberService', { spy: true });
vi.mock('@/services/OrganizationMemberService', { spy: true });

describe('MemberAutoComplete.vue', () => {
  beforeEach(() => {
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [
        {
          id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER',
        },
        {
          id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF',
        },
      ],
    } as ProjectMemberListJson);
    vi.spyOn(organizationMemberService, 'getOrganizations')
      .mockResolvedValue({ organizations: [] } as OrganizationMemberListJson);
  });

  it('loads members on mount', async () => {
    mount(MemberAutoComplete, {
      props: {
        modelValue: null,
        projectId: 'project-123',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(projectMemberService.getMembers).toHaveBeenCalledWith('project-123');
  });

  it('filters members by name', async () => {
    const wrapper = mount(MemberAutoComplete, {
      props: {
        modelValue: null,
        projectId: 'project-123',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const vm = wrapper.vm as InstanceType<typeof MemberAutoComplete>;
    vm.searchMembers({ query: 'John' });

    expect(vm.filteredMembers).toHaveLength(1);
    expect(vm.filteredMembers[0].name).toBe('John Doe');
  });

  it('emits member ID on selection', async () => {
    const wrapper = mount(MemberAutoComplete, {
      props: {
        modelValue: null,
        projectId: 'project-123',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const vm = wrapper.vm as InstanceType<typeof MemberAutoComplete>;
    vm.onMemberChange({
      id: 'user-1', name: 'John Doe', email: 'john@example.com',
    });

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([
      'user-1',
    ]);
  });

  it('shows loading state while fetching', async () => {
    // Create a delayed promise to catch loading state
    let resolvePromise: (value: ProjectMemberListJson) => void;
    const delayedPromise = new Promise<ProjectMemberListJson>((resolve) => {
      resolvePromise = resolve;
    });

    vi.spyOn(projectMemberService, 'getMembers').mockReturnValue(delayedPromise);

    const wrapper = mount(MemberAutoComplete, {
      props: {
        modelValue: null,
        projectId: 'project-123',
      },
    });

    // Check loading state before promise resolves
    await wrapper.vm.$nextTick();
    const autoComplete = wrapper.findComponent(AutoComplete);
    expect(autoComplete.props('loading')).toBe(true);

    // Resolve the promise to clean up
    resolvePromise({ members: [] });
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  it('includes members that are only assigned to the project via an organization', async () => {
    vi.spyOn(organizationMemberService, 'getOrganizations').mockResolvedValue({
      organizations: [
        {
          organizationId: 'org-1',
          organizationName: 'Test GmbH',
          role: 'STAFF',
          members: [
            {
              id: 'org-user-1', name: 'Org Member', email: 'org-member@example.com', role: 'STAFF' 
            },
          ],
        },
      ],
    } as OrganizationMemberListJson);

    const wrapper = mount(MemberAutoComplete, {
      props: {
        modelValue: null,
        projectId: 'project-123',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const vm = wrapper.vm as InstanceType<typeof MemberAutoComplete>;
    vm.searchMembers({ query: 'Org Member' });

    expect(vm.filteredMembers).toHaveLength(1);
    expect(vm.filteredMembers[0].id).toBe('org-user-1');
  });

  it('emits null when member is deselected', async () => {
    const wrapper = mount(MemberAutoComplete, {
      props: {
        modelValue: null,
        projectId: 'project-123',
      },
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const vm = wrapper.vm as InstanceType<typeof MemberAutoComplete>;
    vm.onMemberChange(null);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([
      null,
    ]);
  });
});
