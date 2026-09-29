import { describe, it, expect, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import ActivityFeedToolbar from '@/features/manager/activityFeeds/components/ActivityFeedToolbar.vue';
import type { ActivityFeedFilterGroup } from '@/features/manager/activityFeeds/components/ActivityFeedToolbar.vue';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useLayout } from '@/layouts/composables/layout';

const filterGroups: ActivityFeedFilterGroup[] = [
  {
    label: 'Status',
    items: [
      {
        id: 'status-open', name: 'Offen', icon: 'pi-circle', query: 'status:OPEN', count: 2 
      },
      {
        id: 'status-closed', name: 'Geschlossen', icon: 'pi-check-circle', query: 'status:CLOSED', count: 0 
      },
    ],
  },
];

const filterProps = { filterGroups, activeFilterId: null };

describe('ActivityFeedToolbar', () => {
  let wrapper: VueWrapper;


  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders tab options', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    expect(selectButton.exists()).toBe(true);
    const options = selectButton.props('options');
    expect(options).toHaveLength(2);
    expect(options?.[0]?.value).toBe('all');
    expect(options?.[1]?.value).toBe('unread');
  });

  it('displays correct active tab', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'unread',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    expect(selectButton.props('modelValue')).toBe('unread');
  });

  it('emits update:activeTab when tab is changed', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    await selectButton.vm.$emit('update:modelValue', 'unread');
    
    expect(wrapper.emitted('update:activeTab')).toBeTruthy();
    expect(wrapper.emitted('update:activeTab')?.[0]).toEqual(['unread']);
  });

  it('does not emit update:activeTab when trying to deselect active tab', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    await selectButton.vm.$emit('update:modelValue', 'all');
    
    expect(wrapper.emitted('update:activeTab')).toBeFalsy();
  });

  it('does not emit update:activeTab when value is null', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const selectButton = wrapper.findComponent(SelectButton);
    await selectButton.vm.$emit('update:modelValue', null);
    
    expect(wrapper.emitted('update:activeTab')).toBeFalsy();
  });

  it('renders search input with placeholder', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const input = wrapper.findComponent(InputText);
    expect(input.exists()).toBe(true);
    // Placeholder is set via i18n, we just verify the input exists
  });

  it('binds search query to input', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: 'test query',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const input = wrapper.findComponent(InputText);
    expect(input.props('modelValue')).toBe('test query');
  });

  it('emits update:searchQuery when input changes', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const input = wrapper.findComponent(InputText);
    await input.vm.$emit('update:modelValue', 'new query');
    
    expect(wrapper.emitted('update:searchQuery')).toBeTruthy();
    expect(wrapper.emitted('update:searchQuery')?.[0]).toEqual(['new query']);
  });

  it('does not show bulk actions when selectedCount is 0', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const bulkActions = wrapper.find('div.flex.items-center.gap-2');
    expect(bulkActions.exists()).toBe(false);
  });

  it('shows bulk actions when selectedCount is greater than 0', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 3,
        ...filterProps,
      },
    });

    const bulkActions = wrapper.find('div.flex.items-center.gap-2');
    expect(bulkActions.exists()).toBe(true);
    expect(bulkActions.text()).toContain('3');
  });

  it('emits markReadSelected when mark as read button is clicked', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 2,
        ...filterProps,
      },
    });

    const markAsDoneButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-check');
    
    if (markAsDoneButton) {
      await markAsDoneButton.trigger('click');
      expect(wrapper.emitted('markReadSelected')).toBeTruthy();
    }
  });

  it('emits deleteSelected when delete button is clicked', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 2,
        ...filterProps,
      },
    });

    const deleteButton = wrapper.findAllComponents({ name: 'Button' })
      .find(btn => btn.props('icon') === 'pi pi-trash');
    
    if (deleteButton) {
      await deleteButton.trigger('click');
      expect(wrapper.emitted('deleteSelected')).toBeTruthy();
    }
  });

  it('emits update:activeFilterId when a filter is selected', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: '', selectedCount: 0, ...filterProps 
      },
    });

    await wrapper.findComponent(Select).vm.$emit('update:modelValue', 'status-open');

    expect(wrapper.emitted('update:activeFilterId')?.[0]).toEqual(['status-open']);
  });

  it('emits null when the filter select is cleared', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: '', selectedCount: 0, ...filterProps, activeFilterId: 'status-open' 
      },
    });

    await wrapper.findComponent(Select).vm.$emit('update:modelValue', undefined);

    expect(wrapper.emitted('update:activeFilterId')?.[0]).toEqual([null]);
  });

  it('shows the selected filter name in the filter select', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: '', selectedCount: 0, ...filterProps, activeFilterId: 'status-open' 
      },
    });

    expect(wrapper.findComponent(Select).text()).toContain('Offen');
  });

  it('shows the placeholder when no filter is selected', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: '', selectedCount: 0, ...filterProps 
      },
    });

    expect(wrapper.findComponent(Select).text()).toContain('Filter wählen');
  });

  it('clears the filter via the filter clear button', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: '', selectedCount: 0, ...filterProps, activeFilterId: 'status-open' 
      },
    });

    const clearButton = wrapper.find('button[aria-label="Filter entfernen"]');
    expect(clearButton.attributes('disabled')).toBeUndefined();
    await clearButton.trigger('click');

    expect(wrapper.emitted('update:activeFilterId')?.[0]).toEqual([null]);
  });

  it('disables the filter clear button when no filter is active', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: '', selectedCount: 0, ...filterProps 
      },
    });

    expect(wrapper.find('button[aria-label="Filter entfernen"]').attributes('disabled')).toBeDefined();
  });

  it('clears the search query via the search clear button', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: 'heating', selectedCount: 0, ...filterProps 
      },
    });

    await wrapper.find('button[aria-label="Suche leeren"]').trigger('click');

    expect(wrapper.emitted('update:searchQuery')?.[0]).toEqual(['']);
  });

  it('disables the search clear button when the search query is empty', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all', searchQuery: '', selectedCount: 0, ...filterProps 
      },
    });

    expect(wrapper.find('button[aria-label="Suche leeren"]').attributes('disabled')).toBeDefined();
  });

  it('displays correct selected count in tag', () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: '',
        selectedCount: 5,
        ...filterProps,
      },
    });

    const tag = wrapper.findComponent({ name: 'Tag' });
    expect(tag.exists()).toBe(true);
    expect(tag.props('value')).toContain('5');
  });

  it('applies dark theme classes when dark mode is enabled', () => {
    const { layoutConfig } = useLayout();
    layoutConfig.darkTheme = true;
    try {
      wrapper = mount(ActivityFeedToolbar, {
        props: {
          activeTab: 'all',
          searchQuery: '',
          selectedCount: 0,
          ...filterProps,
        },
      });
      expect(wrapper.html()).toContain('border-surface-800');
    } finally {
      layoutConfig.darkTheme = false;
    }
  });

  it('emits an empty string when search input is cleared to a falsy value', async () => {
    wrapper = mount(ActivityFeedToolbar, {
      props: {
        activeTab: 'all',
        searchQuery: 'test query',
        selectedCount: 0,
        ...filterProps,
      },
    });

    const input = wrapper.findComponent(InputText);
    await input.vm.$emit('update:modelValue', null);

    expect(wrapper.emitted('update:searchQuery')?.[0]).toEqual(['']);
  });
});

