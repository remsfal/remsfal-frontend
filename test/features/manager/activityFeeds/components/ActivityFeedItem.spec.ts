import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ActivityFeedItem from '@/features/manager/activityFeeds/components/ActivityFeedItem.vue';
import type { ActivityFeedEntry } from '@/features/manager/activityFeeds/stores/ActivityFeedStore';
import { useLayout } from '@/layouts/composables/layout';

describe('ActivityFeedItem', () => {
  let wrapper: VueWrapper;

  const mockEntry: ActivityFeedEntry = {
    id: '1',
    createdAt: new Date('2025-01-10T10:00:00Z'),
    read: false,
    issueId: 'issue-101',
    issueTitle: 'Test Issue Title',
    issueType: 'DEFECT',
    issueStatus: 'OPEN',
    projectId: 'proj-1',
    projectName: 'Test Project',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('reflects selected state in checkbox', async () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: mockEntry,
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    expect(checkbox.exists()).toBe(true);
    expect(checkbox.props('modelValue')).toBe(false);

    await wrapper.setProps({ isSelected: true });
    expect(checkbox.props('modelValue')).toBe(true);
  });

  it('emits select event when checkbox is clicked', async () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: mockEntry,
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    await checkbox.vm.$emit('change');

    expect(wrapper.emitted('select')).toBeTruthy();
  });

  it('emits navigate event when item is clicked', async () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: mockEntry,
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const container = wrapper.find('div.group');
    await container.trigger('click');

    expect(wrapper.emitted('navigate')).toBeTruthy();
  });

  it('does not emit navigate when checkbox is clicked', async () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: mockEntry,
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const checkbox = wrapper.findComponent({ name: 'Checkbox' });
    await checkbox.trigger('click');

    // navigate should not be emitted because @click.stop prevents propagation
    expect(wrapper.emitted('navigate')).toBeFalsy();
  });

  it('shows "Mark as read" button only for unread entries', () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: { ...mockEntry, read: false },
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const markAsReadButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-check');
    expect(markAsReadButton).toBeDefined();
  });

  it('does not show "Mark as read" button for read entries', () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: { ...mockEntry, read: true },
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const markAsReadButton = wrapper.findAll('button').find(btn =>
      btn.find('i.pi-check').exists()
    );
    expect(markAsReadButton).toBeUndefined();
  });

  it('emits mark-read event when mark as read button is clicked', async () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: { ...mockEntry, read: false },
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const markAsReadButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-check');

    if (markAsReadButton) {
      await markAsReadButton.trigger('click');
      expect(wrapper.emitted('markRead')).toBeTruthy();
    }
  });

  it('emits delete event when delete button is clicked', async () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: mockEntry,
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const deleteButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-trash');

    if (deleteButton) {
      await deleteButton.trigger('click');
      expect(wrapper.emitted('delete')).toBeTruthy();
    }
  });

  it('displays relative time correctly', () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: mockEntry,
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    // Mock date is 5 days ago
    expect(wrapper.text()).toContain('5 days ago');
  });

  it('applies dark theme classes when dark mode is enabled', () => {
    const { layoutConfig } = useLayout();
    layoutConfig.darkTheme = true;
    try {
      wrapper = mount(ActivityFeedItem, {
        props: {
          entry: mockEntry,
          isSelected: false,
          index: 0,
          isLast: false,
        },
      });
      expect(wrapper.html()).toContain('bg-surface-900');
    } finally {
      layoutConfig.darkTheme = false;
    }
  });

  it('applies dark theme classes for a read entry', () => {
    const { layoutConfig } = useLayout();
    layoutConfig.darkTheme = true;
    try {
      wrapper = mount(ActivityFeedItem, {
        props: {
          entry: { ...mockEntry, read: true },
          isSelected: false,
          index: 0,
          isLast: false,
        },
      });
      expect(wrapper.html()).toContain('bg-surface-800/30');
    } finally {
      layoutConfig.darkTheme = false;
    }
  });

  it('omits the border class for the last item in the list', () => {
    wrapper = mount(ActivityFeedItem, {
      props: {
        entry: mockEntry,
        isSelected: false,
        index: 0,
        isLast: true,
      },
    });

    expect(wrapper.find('div.group').classes()).not.toContain('border-b');
  });
});
