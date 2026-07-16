import { describe, it, expect, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxSidebar, { type CustomFilter, type ProjectOption } from '@/components/inbox/InboxSidebar.vue';
import type { InboxMessage } from '@/services/InboxService';
import { createMockInboxMessage } from '../../utils/testHelpers';

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
    activeNavItem: 'inbox' | 'done';
    unreadCount: number;
    doneCount: number;
    activeFilterId: string | null;
    customFilters: CustomFilter[];
    projectOptions: ProjectOption[];
    filterProject: string[];
    messages: InboxMessage[];
  }>) => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: overrides?.activeNavItem ?? 'inbox',
        unreadCount: overrides?.unreadCount ?? 5,
        doneCount: overrides?.doneCount ?? 3,
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


  it('does not show badge when unread and done count is 0', () => {
    mountWithProps({
      unreadCount: 0,
      doneCount: 0,
      customFilters: [],
      projectOptions: [],
      messages: [],
    });
    const badges = wrapper.findAllComponents({ name: 'Badge' });
    expect(badges.length).toBe(0);
  });

  it('emits update:activeNavItem when inbox button is clicked', async () => {
    mountWithProps({ activeNavItem: 'done' });
    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const inboxButton = buttons.find(btn => btn.text().includes('Inbox'));
    if (inboxButton) {
      await inboxButton.trigger('click');
      expect(wrapper.emitted('update:activeNavItem')).toBeTruthy();
      expect(wrapper.emitted('update:activeNavItem')?.[0]).toEqual(['inbox']);
    }
  });

  it('emits clearFilters when switching to inbox', async () => {
    mountWithProps({ activeNavItem: 'done' });
    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const inboxButton = buttons.find(btn => btn.text().includes('Inbox'));
    if (inboxButton) {
      await inboxButton.trigger('click');
      expect(wrapper.emitted('clearFilters')).toBeTruthy();
    }
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
});

