import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import ContractorMultiSelect from '@/features/project/contractors/components/ContractorMultiSelect.vue';
import { contractorService } from '@/features/project/contractors/services/ContractorService';
import type { ContractorJson } from '@/features/project/contractors/services/ContractorService';

vi.mock('@/features/project/contractors/services/ContractorService', { spy: true });

describe('ContractorMultiSelect.vue', () => {
  let wrapper: VueWrapper;

  const mockContractors: ContractorJson[] = [
    { id: 'c-1', name: 'Alpha Bau GmbH' },
    { id: 'c-2', name: 'Beta Elektro GmbH' },
  ];

  async function mountSelect(modelValue: ContractorJson[] = []) {
    wrapper = mount(ContractorMultiSelect, {props: { projectId: 'project-123', modelValue },});
    await flushPromises();
  }

  beforeEach(() => {
    vi.mocked(contractorService.getContractors).mockReset();
  });

  it('loads contractors on mount', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: mockContractors });
    await mountSelect();

    expect(contractorService.getContractors).toHaveBeenCalledWith('project-123');
    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    expect(multiSelect.props('options')).toEqual(mockContractors);
    expect(multiSelect.props('optionLabel')).toBe('name');
  });

  it('is disabled and shows the empty message when the project has no contractors', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: [] });
    await mountSelect();

    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    expect(multiSelect.props('disabled')).toBe(true);
    expect(wrapper.text()).toContain('Für diese Liegenschaft wurde noch kein Auftragnehmer angelegt');
  });

  it('is enabled and shows no message once contractors are available', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: mockContractors });
    await mountSelect();

    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    expect(multiSelect.props('disabled')).toBe(false);
    expect(wrapper.text()).not.toContain('Für diese Liegenschaft wurde noch kein Auftragnehmer angelegt');
  });

  it('handles a fetch failure gracefully by treating it as no contractors', async () => {
    vi.spyOn(contractorService, 'getContractors').mockRejectedValue(new Error('Network'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await mountSelect();

    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    expect(multiSelect.props('disabled')).toBe(true);
    consoleSpy.mockRestore();
  });

  it('emits update:modelValue when the selection changes', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: mockContractors });
    await mountSelect();

    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    await multiSelect.vm.$emit('update:modelValue', [mockContractors[0]]);

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([mockContractors[0]]);
  });

  it('emits blur when the MultiSelect is blurred', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: mockContractors });
    await mountSelect();

    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    await multiSelect.vm.$emit('blur');

    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('passes the invalid prop through as p-invalid class', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: mockContractors });
    await mountSelect();

    await wrapper.setProps({ invalid: true });
    expect(wrapper.html()).toContain('p-invalid');
  });

  it('exposes addContractor to append a freshly created contractor and select it', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: mockContractors });
    await mountSelect([mockContractors[0]]);

    const newContractor: ContractorJson = { id: 'c-new', name: 'Neue Firma GmbH' };
    (wrapper.vm as unknown as { addContractor: (c: ContractorJson) => void }).addContractor(newContractor);
    await wrapper.vm.$nextTick();

    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    expect(multiSelect.props('options')).toEqual([...mockContractors, newContractor]);
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([mockContractors[0], newContractor]);
  });

  it('re-enables the MultiSelect once addContractor is used on an empty list', async () => {
    vi.spyOn(contractorService, 'getContractors').mockResolvedValue({ contractors: [] });
    await mountSelect();

    const newContractor: ContractorJson = { id: 'c-new', name: 'Neue Firma GmbH' };
    (wrapper.vm as unknown as { addContractor: (c: ContractorJson) => void }).addContractor(newContractor);
    await wrapper.vm.$nextTick();

    const multiSelect = wrapper.findComponent({ name: 'MultiSelect' });
    expect(multiSelect.props('disabled')).toBe(false);
  });
});
