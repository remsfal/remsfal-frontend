import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxEmptyState from '../../../src/components/inbox/InboxEmptyState.vue';

describe('InboxEmptyState', () => {
  let wrapper: VueWrapper;


  beforeEach(() => {
    wrapper = mount(InboxEmptyState, {props: {hasSearchQuery: false,},});
  });

  it('renders inbox icon when hasSearchQuery is false', () => {
    const icon = wrapper.find('i.pi-inbox');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('pi-inbox');
  });

  it('renders search icon when hasSearchQuery is true', async () => {
    await wrapper.setProps({ hasSearchQuery: true });
    const icon = wrapper.find('i.pi-search');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('pi-search');
  });

  it('displays text when hasSearchQuery is false', () => {
    const text = wrapper.find('span.text-lg');
    expect(text.exists()).toBe(true);
    expect(text.text().length).toBeGreaterThan(0);
  });

  it('displays text when hasSearchQuery is true', async () => {
    await wrapper.setProps({ hasSearchQuery: true });
    const text = wrapper.find('span.text-lg');
    expect(text.exists()).toBe(true);
    expect(text.text().length).toBeGreaterThan(0);
  });

  it('does not show "Try different search" message when hasSearchQuery is false', () => {
    const tryDifferentSearch = wrapper.find('span.text-sm');
    expect(tryDifferentSearch.exists()).toBe(false);
  });

  it('shows additional message when hasSearchQuery is true', async () => {
    await wrapper.setProps({ hasSearchQuery: true });
    const tryDifferentSearch = wrapper.find('span.text-sm');
    expect(tryDifferentSearch.exists()).toBe(true);
    expect(tryDifferentSearch.text().length).toBeGreaterThan(0);
  });

  it('has correct CSS classes for styling', () => {
    const container = wrapper.find('div');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('flex-col');
    expect(container.classes()).toContain('items-center');
    expect(container.classes()).toContain('justify-center');
    expect(container.classes()).toContain('h-64');
    expect(container.classes()).toContain('text-surface-400');
  });
});

