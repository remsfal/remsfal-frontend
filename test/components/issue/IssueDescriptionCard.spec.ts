import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import { issueService, type Issue } from '@/services/IssueService';

// ---- Mock issueService ----
vi.mock('@/services/IssueService', () => ({issueService: { modifyIssue: vi.fn() },}));

// ---- Stub PrimeVue components ----
const stubs = {
  Card: true,
  Button: true,
  IssueDescription: true,
};

// ---- Test Suite ----
describe('IssueDescriptionCard.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    (issueService.modifyIssue as vi.Mock).mockResolvedValue({});

    wrapper = mount(IssueDescriptionCard, {
      props: {
        projectId: 'proj-1',
        issueId: 'issue-1',
        initialDescription: 'Initial description',
      },
      global: { stubs },
    });
  });

  test('renders component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('calls modifyIssue when saving', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: 'Updated description' } as Partial<Issue>
    );
  });

  test('emits saved event after save', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();

    expect(wrapper.emitted()).toHaveProperty('saved');
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
    wrapper.vm.description = '';
    await wrapper.vm.handleSave();
    
    // Should still save empty string if it's different
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: '' }
    );
  });

  test('handles very long description text', async () => {
    const longDescription = 'A'.repeat(10000);
    wrapper.vm.description = longDescription;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: longDescription }
    );
  });

  test('handles special characters in description', async () => {
    const specialChars = '<script>alert("XSS")</script>\n\r\t\u0000';
    wrapper.vm.description = specialChars;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: specialChars }
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
    const markdown = '# Header\n\n## Subheader\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("test");\n```';
    wrapper.vm.description = markdown;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: markdown }
    );
  });

  test('handles unicode and emoji in description', async () => {
    const unicode = 'Test with emojis 😀🎉 and unicode: ñ, ü, 中文, 日本語';
    wrapper.vm.description = unicode;
    await wrapper.vm.handleSave();
    
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: unicode }
    );
  });
  
});
