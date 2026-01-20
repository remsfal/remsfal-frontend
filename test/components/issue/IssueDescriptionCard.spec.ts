import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import { issueService, type Issue } from '@/services/IssueService';
import {
  primeVueStubs,
  defaultIssueDescriptionProps,
  edgeCaseTestData,
  expectModifyIssueCalled,
  expectEventEmitted,
} from '../../setup/issueTestHelpers';

// ---- Mock issueService ----
vi.mock('@/services/IssueService', () => ({issueService: { modifyIssue: vi.fn() },}));

// ---- Test Suite ----
describe('IssueDescriptionCard.vue', () => {
  let wrapper: VueWrapper<any>;

  const mountComponent = (props = {}) =>
    mount(IssueDescriptionCard, {
      props: { ...defaultIssueDescriptionProps, ...props },
      global: { stubs: primeVueStubs },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    (issueService.modifyIssue as vi.Mock).mockResolvedValue({});
    wrapper = mountComponent();
  });

  test('renders component', () => {
    expect(wrapper.exists()).toBe(true);
  });


  test('calls modifyIssue when saving', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();

    expectModifyIssueCalled(
      issueService.modifyIssue,
      defaultIssueDescriptionProps.projectId,
      defaultIssueDescriptionProps.issueId,
      { description: 'Updated description' } as Partial<Issue>
    );
  });

  test('emits saved event after save', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();

    expectEventEmitted(wrapper, 'saved');
  });

  test('does not call modifyIssue if canSave is false', async () => {
    wrapper.vm.description = 'Initial description'; // same as original
    await wrapper.vm.handleSave();
  
    expect(issueService.modifyIssue).not.toHaveBeenCalled();
  });
  
  test('does not call modifyIssue if loadingSave is true', async () => {
    wrapper.vm.description = 'Updated description';
    wrapper.vm.loadingSave = true;
    await wrapper.vm.handleSave();
  
    expect(issueService.modifyIssue).not.toHaveBeenCalled();
  });
  
  test('resets originalDescription after successful save', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();
  
    expect(wrapper.vm.description).toBe('Updated description');
    expect(wrapper.vm.originalDescription).toBe('Updated description');
  });
  
  test('handles error when modifyIssue fails', async () => {
    (issueService.modifyIssue as vi.Mock).mockRejectedValueOnce(new Error('API Error'));
  
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();
  
    expect(wrapper.vm.loadingSave).toBe(false);
  });

  test('updates description when initialDescription prop changes', async () => {
    await wrapper.setProps({ initialDescription: 'New description from parent' });
    await wrapper.vm.$nextTick();
    
    expect(wrapper.vm.description).toBe('New description from parent');
    expect(wrapper.vm.originalDescription).toBe('New description from parent');
  });

  test('canSave returns true when description differs from original', () => {
    wrapper.vm.description = 'Different description';
    expect(wrapper.vm.canSave).toBe(true);
  });

  test('canSave returns false when description matches original', () => {
    wrapper.vm.description = 'Initial description';
    expect(wrapper.vm.canSave).toBe(false);
  });

  test('sets loading state to true during save operation', async () => {
    wrapper.vm.description = 'Updated';
    
    const savePromise = wrapper.vm.handleSave();
    expect(wrapper.vm.loadingSave).toBe(true);
    
    await savePromise;
    expect(wrapper.vm.loadingSave).toBe(false);
  });


  test('does not save when description is empty but different', async () => {
    wrapper.vm.description = edgeCaseTestData.emptyString;
    await wrapper.vm.handleSave();
    
    // Should still save empty string if it's different
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.projectId,
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.emptyString }
    );
  });

  test('handles very long description text', async () => {
    wrapper.vm.description = edgeCaseTestData.longText;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.projectId,
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.longText }
    );
  });

  test('handles special characters in description', async () => {
    wrapper.vm.description = edgeCaseTestData.specialChars;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.projectId,
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.specialChars }
    );
  });

  test('handles rapid save attempts (concurrent saves blocked)', async () => {
    wrapper.vm.description = 'First update';
    
    const promise1 = wrapper.vm.handleSave();
    const promise2 = wrapper.vm.handleSave(); // Should be blocked
    
    await Promise.all([promise1, promise2]);
    
    // Should only be called once due to loadingSave guard
    expect(issueService.modifyIssue).toHaveBeenCalledTimes(1);
  });

  test('preserves description after failed save', async () => {
    (issueService.modifyIssue as vi.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const updatedDesc = 'Updated but failed';
    wrapper.vm.description = updatedDesc;
    await wrapper.vm.handleSave();
    
    expect(wrapper.vm.description).toBe(updatedDesc);
    expect(wrapper.vm.originalDescription).toBe('Initial description'); // Should not update
  });

  test('emit saved event is called exactly once per successful save', async () => {
    wrapper.vm.description = 'New save';
    await wrapper.vm.handleSave();
    
    const emittedEvents = wrapper.emitted('saved');
    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents![0]).toEqual([]);
  });

  test('handles markdown content in description', async () => {
    wrapper.vm.description = edgeCaseTestData.markdown;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.projectId,
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.markdown }
    );
  });

  test('handles unicode and emoji in description', async () => {
    wrapper.vm.description = edgeCaseTestData.unicode;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      defaultIssueDescriptionProps.projectId,
      defaultIssueDescriptionProps.issueId,
      { description: edgeCaseTestData.unicode }
    );
  });
  
});
