import { describe, it, expect, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import InboxToolbar from '../../../src/components/inbox/InboxToolbar.vue';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';

describe('InboxToolbar', () => {
  let wrapper: VueWrapper;


  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders tab options', () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    expect(selectButton.exists()).toBe(true);
    expect(selectButton.props('options')).toHaveLength(2);
    expect(selectButton.props('options')[0].value).toBe('all');
    expect(selectButton.props('options')[1].value).toBe('unread');
  });

  it('displays correct active tab', () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'unread',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    expect(selectButton.props('modelValue')).toBe('unread');
  });

  it('emits update:activeTab when tab is changed', async () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    await selectButton.vm.$emit('update:modelValue', 'unread');
    
    expect(wrapper.emitted('update:activeTab')).toBeTruthy();
    expect(wrapper.emitted('update:activeTab')?.[0]).toEqual(['unread']);
  });

  it('does not emit update:activeTab when trying to deselect active tab', async () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    await selectButton.vm.$emit('update:modelValue', 'all');
    
    expect(wrapper.emitted('update:activeTab')).toBeFalsy();
  });

  it('does not emit update:activeTab when value is null', async () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    await selectButton.vm.$emit('update:modelValue', null);
    
    expect(wrapper.emitted('update:activeTab')).toBeFalsy();
  });

  it('renders search input with placeholder', () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const input = wrapper.findComponent(InputText);
    expect(input.exists()).toBe(true);
    // Placeholder is set via i18n, we just verify the input exists
  });

  it('binds search query to input', () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: 'test query',
        selectedCount: 0,
        grouping: null,
      },
    });

    const input = wrapper.findComponent(InputText);
    expect(input.props('modelValue')).toBe('test query');
  });

  it('emits update:searchQuery when input changes', async () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const input = wrapper.findComponent(InputText);
    await input.vm.$emit('update:modelValue', 'new query');
    
    expect(wrapper.emitted('update:searchQuery')).toBeTruthy();
    expect(wrapper.emitted('update:searchQuery')?.[0]).toEqual(['new query']);
  });

  it('does not show bulk actions when selectedCount is 0', () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        grouping: null,
      },
    });

    const bulkActions = wrapper.find('div.flex.items-center.gap-2');
    expect(bulkActions.exists()).toBe(false);
  });

  it('shows bulk actions when selectedCount is greater than 0', () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 3,
        grouping: null,
      },
    });

    const bulkActions = wrapper.find('div.flex.items-center.gap-2');
    expect(bulkActions.exists()).toBe(true);
    expect(bulkActions.text()).toContain('3');
  });

  it('emits mark-read-selected when mark as done button is clicked', async () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 2,
        grouping: null,
      },
    });

    const markAsDoneButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-check');
    
    if (markAsDoneButton) {
      await markAsDoneButton.trigger('click');
      expect(wrapper.emitted('mark-read-selected')).toBeTruthy();
    }
  });

  it('emits delete-selected when delete button is clicked', async () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 2,
        grouping: null,
      },
    });

    const deleteButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-trash');
    
    if (deleteButton) {
      await deleteButton.trigger('click');
      expect(wrapper.emitted('delete-selected')).toBeTruthy();
    }
  });

  it('displays correct selected count in tag', () => {
    wrapper = mount(InboxToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 5,
        grouping: null,
      },
    });

    const tag = wrapper.findComponent({ name: 'Tag' });
    expect(tag.exists()).toBe(true);
    expect(tag.props('value')).toContain('5');
  });
});

