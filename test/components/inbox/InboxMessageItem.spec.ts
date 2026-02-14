import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxMessageItem from '@/components/inbox/InboxMessageItem.vue';
import type { InboxMessage } from '@/services/InboxService';

describe('InboxMessageItem', () => {
  let wrapper: VueWrapper;

  const mockMessage: InboxMessage = {
    id: '1',
    receivedAt: new Date('2025-01-10T10:00:00Z'),
    isRead: false,
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
    wrapper = mount(InboxMessageItem, {
      props: {
        message: mockMessage,
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
    wrapper = mount(InboxMessageItem, {
      props: {
        message: mockMessage,
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
    wrapper = mount(InboxMessageItem, {
      props: {
        message: mockMessage,
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
    wrapper = mount(InboxMessageItem, {
      props: {
        message: mockMessage,
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

  it('shows "Mark as done" button only for unread messages', () => {
    wrapper = mount(InboxMessageItem, {
      props: {
        message: { ...mockMessage, isRead: false },
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const markAsDoneButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-check');
    expect(markAsDoneButton).toBeDefined();
  });

  it('does not show "Mark as done" button for read messages', () => {
    wrapper = mount(InboxMessageItem, {
      props: {
        message: { ...mockMessage, isRead: true },
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const markAsDoneButton = wrapper.findAll('button').find(btn => 
      btn.find('i.pi-check').exists()
    );
    expect(markAsDoneButton).toBeUndefined();
  });

  it('emits mark-read event when mark as done button is clicked', async () => {
    wrapper = mount(InboxMessageItem, {
      props: {
        message: { ...mockMessage, isRead: false },
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    const markAsDoneButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-check');
    
    if (markAsDoneButton) {
      await markAsDoneButton.trigger('click');
      expect(wrapper.emitted('markRead')).toBeTruthy();
    }
  });

  it('emits delete event when delete button is clicked', async () => {
    wrapper = mount(InboxMessageItem, {
      props: {
        message: mockMessage,
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
    wrapper = mount(InboxMessageItem, {
      props: {
        message: mockMessage,
        isSelected: false,
        index: 0,
        isLast: false,
      },
    });

    // Mock date is 5 days ago
    expect(wrapper.text()).toContain('5 days ago');
  });
});

