import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import TenantSelect from '@/features/project/rentalAgreements/components/TenantSelect.vue';
import { tenantService } from '@/features/project/rentalAgreements/services/TenantService';
import type { TenantItemJson } from '@/features/project/rentalAgreements/services/TenantService';

vi.mock('@/features/project/rentalAgreements/services/TenantService', { spy: true });

describe('TenantSelect.vue', () => {
  let wrapper: VueWrapper;

  const mockTenants: TenantItemJson[] = [
    {
      id: '1', firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com' 
    },
    {
      id: '2', firstName: 'Erika', lastName: 'Musterfrau' 
    },
  ];

  beforeEach(async () => {
    vi.spyOn(tenantService, 'fetchTenants').mockResolvedValue(mockTenants);

    wrapper = mount(TenantSelect, {
      props: {
        projectId: 'project-123',
        modelValue: null,
      },
    });

    await flushPromises();
  });

  it('loads tenants on mount', () => {
    expect(tenantService.fetchTenants).toHaveBeenCalledWith('project-123');
  });

  it('renders an AutoComplete', () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    expect(autoComplete.exists()).toBe(true);
  });

  it('builds option labels from first name, last name, and email', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: '' });
    await wrapper.vm.$nextTick();

    const suggestions = autoComplete.props('suggestions');
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].label).toBe('Max Mustermann (max@example.com)');
    expect(suggestions[1].label).toBe('Erika Musterfrau');
  });

  it('filters tenants by first name, last name, or email on complete', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: 'Erika' });
    await wrapper.vm.$nextTick();

    expect(autoComplete.props('suggestions')).toHaveLength(1);
    expect(autoComplete.props('suggestions')[0].id).toBe('2');
  });

  it('resets to full list when the query is cleared', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: 'Erika' });
    await autoComplete.vm.$emit('complete', { query: '' });
    await wrapper.vm.$nextTick();

    expect(autoComplete.props('suggestions')).toHaveLength(2);
  });

  it('emits update:modelValue when a suggestion is selected', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', mockTenants[0]);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(mockTenants[0]);
  });

  it('does not forward the raw typeahead text as update:modelValue', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', 'M');

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('still forwards update:modelValue with null (explicit clear)', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', null);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBeNull();
  });

  it('emits blur when the AutoComplete is blurred', async () => {
    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('blur');

    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('passes the invalid prop through as p-invalid class', async () => {
    await wrapper.setProps({ invalid: true });
    expect(wrapper.html()).toContain('p-invalid');
  });

  it('gives the bound modelValue a display label instead of rendering the raw object', async () => {
    await wrapper.setProps({ modelValue: mockTenants[0] });

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    expect(autoComplete.props('modelValue')).toMatchObject({
      id: '1',
      label: 'Max Mustermann (max@example.com)',
    });
  });

  it('logs an error when loading tenants fails', async () => {
    vi.mocked(tenantService.fetchTenants).mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    wrapper = mount(TenantSelect, {props: { projectId: 'project-123', modelValue: null },});
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load tenants:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
