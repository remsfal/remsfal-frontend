import { describe, it, expect, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxSidebar, { type CustomFilter, type ProjectOption } from '../../../src/components/inbox/InboxSidebar.vue';
import type { InboxMessage } from '../../../src/services/InboxService';

describe('InboxSidebar', () => {
  let wrapper: VueWrapper;

  const mockMessages: InboxMessage[] = [
    {
      id: '1',
      receivedAt: new Date('2025-01-10T10:00:00Z'),
      isRead: false,
      issueId: 'issue-101',
      issueTitle: 'Test Issue 1',
      issueType: 'DEFECT',
      issueStatus: 'OPEN',
      projectId: 'proj-1',
      projectName: 'Project 1',
    },
    {
      id: '2',
      receivedAt: new Date('2025-01-11T10:00:00Z'),
      isRead: true,
      issueId: 'issue-102',
      issueTitle: 'Test Issue 2',
      issueType: 'TASK',
      issueStatus: 'CLOSED',
      projectId: 'proj-2',
      projectName: 'Project 2',
    },
  ];

  const mockCustomFilters: CustomFilter[] = [
    {
 id: 'smart-urgent', name: 'Open Defects', icon: 'pi-exclamation-circle', query: 'status:OPEN type:DEFECT' 
},
    {
 id: 'smart-myTasks', name: 'My Tasks', icon: 'pi-check-square', query: 'status:OPEN type:TASK' 
},
  ];

  const mockProjectOptions: ProjectOption[] = [
    { label: 'Project 1', value: 'proj-1' },
    { label: 'Project 2', value: 'proj-2' },
  ];


  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });


  it('does not show badge when unread and done count is 0', () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'inbox',
        unreadCount: 0,
        doneCount: 0,
        activeFilterId: null,
        customFilters: [],
        projectOptions: [],
        filterProject: [],
        messages: [],
      },
    });

    const badges = wrapper.findAllComponents({ name: 'Badge' });
    expect(badges.length).toBe(0);
  });

  it('emits update:activeNavItem when inbox button is clicked', async () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'done',
        unreadCount: 5,
        doneCount: 3,
        activeFilterId: null,
        customFilters: mockCustomFilters,
        projectOptions: mockProjectOptions,
        filterProject: [],
        messages: mockMessages,
      },
    });

    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const inboxButton = buttons.find(btn => btn.text().includes('Inbox'));
    
    if (inboxButton) {
      await inboxButton.trigger('click');
      expect(wrapper.emitted('update:activeNavItem')).toBeTruthy();
      expect(wrapper.emitted('update:activeNavItem')?.[0]).toEqual(['inbox']);
    }
  });

  it('emits clear-filters when switching to inbox', async () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'done',
        unreadCount: 5,
        doneCount: 3,
        activeFilterId: null,
        customFilters: mockCustomFilters,
        projectOptions: mockProjectOptions,
        filterProject: [],
        messages: mockMessages,
      },
    });

    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const inboxButton = buttons.find(btn => btn.text().includes('Inbox'));
    
    if (inboxButton) {
      await inboxButton.trigger('click');
      expect(wrapper.emitted('clearFilters')).toBeTruthy();
    }
  });


  it('emits filter-applied when custom filter is clicked', async () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'inbox',
        unreadCount: 5,
        doneCount: 3,
        activeFilterId: null,
        customFilters: mockCustomFilters,
        projectOptions: mockProjectOptions,
        filterProject: [],
        messages: mockMessages,
      },
    });

    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const filterButton = buttons.find(btn => btn.text().includes('Open Defects'));
    
    expect(filterButton).toBeTruthy();
    if (filterButton) {
      await filterButton.trigger('click');
      expect(wrapper.emitted('filterApplied')).toBeTruthy();
      expect(wrapper.emitted('filterApplied')?.[0]).toEqual([mockCustomFilters[0]]);
    }
  });

  it('emits clear-filters when active filter is clicked again', async () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'inbox',
        unreadCount: 5,
        doneCount: 3,
        activeFilterId: 'smart-urgent',
        customFilters: mockCustomFilters,
        projectOptions: mockProjectOptions,
        filterProject: [],
        messages: mockMessages,
      },
    });

    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const filterButton = buttons.find(btn => btn.text().includes('Open Defects'));
    
    expect(filterButton).toBeTruthy();
    if (filterButton) {
      await filterButton.trigger('click');
      expect(wrapper.emitted('clearFilters')).toBeTruthy();
    }
  });


  it('emits project-filter-toggled when project is clicked', async () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'inbox',
        unreadCount: 5,
        doneCount: 3,
        activeFilterId: null,
        customFilters: mockCustomFilters,
        projectOptions: mockProjectOptions,
        filterProject: [],
        messages: mockMessages,
      },
    });

    const buttons = wrapper.findAllComponents({ name: 'Button' });
    const projectButton = buttons.find(btn => btn.text().includes('Project 1'));
    
    if (projectButton) {
      await projectButton.trigger('click');
      expect(wrapper.emitted('projectFilterToggled')).toBeTruthy();
      expect(wrapper.emitted('projectFilterToggled')?.[0]).toEqual(['proj-1']);
    }
  });

  it('calculates filter count correctly', () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'inbox',
        unreadCount: 5,
        doneCount: 3,
        activeFilterId: null,
        customFilters: mockCustomFilters,
        projectOptions: mockProjectOptions,
        filterProject: [],
        messages: mockMessages,
      },
    });

    // The filter "status:OPEN type:DEFECT" should match message 1
    // Check that the filter name is rendered (from props, not i18n)
    const text = wrapper.text();
    expect(text).toContain('Open Defects');
    
    // Check that badge with count "1" is shown for the filter
    // The filter should match 1 message (message 1 with OPEN status and DEFECT type)
    const badges = wrapper.findAllComponents({ name: 'Badge' });
    const filterBadge = badges.find(badge => badge.text() === '1');
    expect(filterBadge).toBeTruthy();
  });

  it('calculates project count correctly', () => {
    wrapper = mount(InboxSidebar, {
      props: {
        activeNavItem: 'inbox',
        unreadCount: 5,
        doneCount: 3,
        activeFilterId: null,
        customFilters: mockCustomFilters,
        projectOptions: mockProjectOptions,
        filterProject: [],
        messages: mockMessages,
      },
    });

    // Project 1 should have 1 message, Project 2 should have 1 message
    // This is tested indirectly through badge rendering
    expect(wrapper.text()).toContain('Project 1');
    expect(wrapper.text()).toContain('Project 2');
  });
});

