import { describe, it, expect, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxSidebar, { type CustomFilter, type ProjectOption } from '@/features/manager/inbox/components/InboxSidebar.vue';
import type { InboxMessage } from '@/features/manager/inbox/services/InboxService';
import { createMockInboxMessage } from '../../../../utils/testHelpers';
import { useLayout } from '@/layouts/composables/layout';

describe('InboxSidebar', () => {
  let wrapper: VueWrapper;

  const mockMessages: InboxMessage[] = [
    createMockInboxMessage({
      id: '1',
      issueId: 'issue-101',
      issueType: 'DEFECT',
      issueStatus: 'OPEN',
      projectId: 'proj-1',
      projectName: 'Project 1',
    }),
    createMockInboxMessage({
      id: '2',
      receivedAt: new Date('2025-01-11T10:00:00Z'),
      isRead: true,
      issueId: 'issue-102',
      issueType: 'TASK',
      issueStatus: 'CLOSED',
      projectId: 'proj-2',
      projectName: 'Project 2',
    }),
  ];

  const mockCustomFilters: CustomFilter[] = [
    {
      id: 'smart-urgent',
      name: 'Open Defects',
      icon: 'pi-exclamation-circle',
      query: 'status:OPEN type:DEFECT',
    },
    {
      id: 'smart-myTasks',
      name: 'My Tasks',
      icon: 'pi-check-square',
      query: 'status:OPEN type:TASK',
    },
  ];

  const mockProjectOptions: ProjectOption[] = [
    { label: 'Project 1', value: 'proj-1' },
    { label: 'Project 2', value: 'proj-2' },
  ];

  const mountWithProps = (overrides?: Partial<{
    activeFilterId: string | null;
    customFilters: CustomFilter[];
    projectOptions: ProjectOption[];
    filterProject: string[];
    messages: InboxMessage[];
  }>) => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeFilterId: overrides?.activeFilterId ?? null,
        customFilters: overrides?.customFilters ?? mockCustomFilters,
        projectOptions: overrides?.projectOptions ?? mockProjectOptions,
        filterProject: overrides?.filterProject ?? [],
        messages: overrides?.messages ?? mockMessages,
      },
    });
    return wrapper;
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });


  it('does not show badge when there are no filter or project matches', () => {
    mountWithProps({
      customFilters: [],
      projectOptions: [],
      messages: [],
    });
    const badges = wrapper.findAllComponents({ name: 'Badge' });
    expect(badges).toHaveLength(0);
  });

  it('emits filterApplied when custom filter is clicked', async () => {
    mountWithProps({});
    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const filterButton = buttons.find(btn => btn.text().includes('Open Defects'));
    expect(filterButton).toBeTruthy();
    if (filterButton) {
      await filterButton.trigger('click');
      expect(wrapper.emitted('filterApplied')).toBeTruthy();
      expect(wrapper.emitted('filterApplied')?.[0]).toEqual([mockCustomFilters[0]]);
    }
  });

  it('emits clearFilters when active filter is clicked again', async () => {
    mountWithProps({ activeFilterId: 'smart-urgent' });
    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const filterButton = buttons.find(btn => btn.text().includes('Open Defects'));
    expect(filterButton).toBeTruthy();
    if (filterButton) {
      await filterButton.trigger('click');
      expect(wrapper.emitted('clearFilters')).toBeTruthy();
    }
  });

  it('emits projectFilterToggled when project is clicked', async () => {
    mountWithProps({});
    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const projectButton = buttons.find(btn => btn.text().includes('Project 1'));
    if (projectButton) {
      await projectButton.trigger('click');
      expect(wrapper.emitted('projectFilterToggled')).toBeTruthy();
      expect(wrapper.emitted('projectFilterToggled')?.[0]).toEqual(['proj-1']);
    }
  });

  it('calculates filter count correctly', () => {
    mountWithProps({});
    const text = wrapper.text();
    expect(text).toContain('Open Defects');
    const badges = wrapper.findAllComponents({ name: 'Badge' });
    const filterBadge = badges.find(badge => badge.text() === '1');
    expect(filterBadge).toBeTruthy();
  });

  it('calculates project count correctly', () => {
    mountWithProps({});
    expect(wrapper.text()).toContain('Project 1');
    expect(wrapper.text()).toContain('Project 2');
  });

  const mixedCustomFilters: CustomFilter[] = [
    {
      id: 'smart-urgent', name: 'Smart Urgent', icon: 'pi-exclamation-circle', query: 'status:OPEN type:DEFECT' 
    },
    {
      id: 'status-open', name: 'Status Open', icon: 'pi-clock', query: 'status:OPEN' 
    },
    {
      id: 'type-defect', name: 'Type Defect', icon: 'pi-wrench', query: 'type:DEFECT' 
    },
  ];

  it.each([
    ['smart-urgent'],
    ['status-open'],
    ['type-defect'],
  ])('applies dark theme classes with %s active', (activeFilterId) => {
    const { layoutConfig } = useLayout();
    layoutConfig.darkTheme = true;
    try {
      mountWithProps({
        activeFilterId,
        filterProject: ['proj-1'],
        customFilters: mixedCustomFilters,
      });
      expect(wrapper.html()).toContain('bg-surface-900');
    } finally {
      layoutConfig.darkTheme = false;
    }
  });

  it('renders and activates status filters', async () => {
    mountWithProps({
      activeFilterId: 'status-open',
      customFilters: [
        {
          id: 'status-open', name: 'Status Open', icon: 'pi-clock', query: 'status:OPEN' 
        },
      ],
    });

    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const statusButton = buttons.find(btn => btn.text().includes('Status Open'));
    expect(statusButton).toBeTruthy();

    await statusButton!.trigger('click');
    expect(wrapper.emitted('clearFilters')).toBeTruthy();
  });

  it('renders and activates type filters', async () => {
    mountWithProps({
      activeFilterId: 'type-defect',
      customFilters: [
        {
          id: 'type-defect', name: 'Type Defect', icon: 'pi-wrench', query: 'type:DEFECT' 
        },
        {
          id: 'type-task', name: 'Type Task', icon: 'pi-list', query: 'type:TASK' 
        },
      ],
    });

    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const activeTypeButton = buttons.find(btn => btn.text().includes('Type Defect'));
    expect(activeTypeButton?.props('severity')).toBe('success');
    await activeTypeButton!.trigger('click');
    expect(wrapper.emitted('clearFilters')).toBeTruthy();

    const inactiveTypeButton = buttons.find(btn => btn.text().includes('Type Task'));
    expect(inactiveTypeButton?.props('severity')).toBe('secondary');
    await inactiveTypeButton!.trigger('click');
    expect(wrapper.emitted('filterApplied')).toBeTruthy();
  });

  it('marks the active project button', () => {
    mountWithProps({ filterProject: ['proj-1'] });
    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const projectButton = buttons.find(btn => btn.text().includes('Project 1'));
    expect(projectButton?.props('severity')).toBe('success');
  });

  it('treats filter query parts with unknown keys as always matching', () => {
    mountWithProps({
      customFilters: [
        {
          id: 'status-custom', name: 'Custom', icon: 'pi-star', query: 'foo:bar' 
        },
      ],
      messages: [createMockInboxMessage({ id: 'x1' })],
      projectOptions: [],
    });

    const badges = wrapper.findAllComponents({ name: 'Badge' });
    const badge = badges.find(b => b.text() === '1');
    expect(badge).toBeTruthy();
  });
});

