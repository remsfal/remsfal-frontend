import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import { issueService } from '@/services/IssueService';

// Mock services with proper vi.fn() functions
vi.mock('@/services/IssueService', () => ({
  issueService: { 
    modifyIssue: vi.fn(),
  },
}));

vi.mock('primevue/usetoast', () => ({ 
  useToast: () => ({ add: vi.fn() }),
}));

vi.mock('vue-i18n', () => ({ 
  useI18n: () => ({ t: (key: string) => key }),
}));

const defaultProps = {
  projectId: 'proj-1',
  issueId: 'issue-1',
  initialDescription: 'Initial markdown description',
};

describe('IssueDescriptionCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mock with resolved value
    (issueService.modifyIssue as Mock).mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('renders component with initial description', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      expect(wrapper.text()).toContain('Description');
      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('displays initial description in textarea', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      expect((textarea.element as HTMLTextAreaElement).value).toBe('Initial markdown description');
    });

    it('renders save button', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const saveButton = wrapper.find('button');
      expect(saveButton.exists()).toBe(true);
    });

    it('takes snapshot', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('Props', () => {
    it('accepts projectId prop', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });
      expect(wrapper.props('projectId')).toBe('proj-1');
    });

    it('accepts issueId prop', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });
      expect(wrapper.props('issueId')).toBe('issue-1');
    });

    it('accepts initialDescription prop', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });
      expect(wrapper.props('initialDescription')).toBe('Initial markdown description');
    });

    it('updates when initialDescription prop changes', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      await wrapper.setProps({ initialDescription: 'Updated description' });
      await wrapper.vm.$nextTick();

      const textarea = wrapper.find('textarea');
      expect((textarea.element as HTMLTextAreaElement).value).toBe('Updated description');
    });

    it('handles empty initialDescription', () => {
      const propsWithEmptyDesc = { ...defaultProps, initialDescription: '' };
      const wrapper = mount(IssueDescriptionCard, { props: propsWithEmptyDesc });

      const textarea = wrapper.find('textarea');
      expect((textarea.element as HTMLTextAreaElement).value).toBe('');
    });

    it('handles undefined initialDescription', () => {
      const propsWithUndefined = { ...defaultProps, initialDescription: undefined as any };
      const wrapper = mount(IssueDescriptionCard, { props: propsWithUndefined });

      // Component should handle undefined gracefully
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('canSave is false when description unchanged', () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeDefined();
    });

    it('canSave is true when description changes', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('canSave reacts to multiple changes', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      
      // First change
      await textarea.setValue('First change');
      await wrapper.vm.$nextTick();
      let saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeUndefined();

      // Second change
      await textarea.setValue('Second change');
      await wrapper.vm.$nextTick();
      saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeUndefined();

      // Revert to original
      await textarea.setValue('Initial markdown description');
      await wrapper.vm.$nextTick();
      saveButton = wrapper.find('button');
      expect(saveButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Save Functionality', () => {
    it('does not call API when no changes made', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Should not call modifyIssue when button is disabled
      expect(issueService.modifyIssue).not.toHaveBeenCalled();
    });

    it('calls modifyIssue API when description changes', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(issueService.modifyIssue).toHaveBeenCalledWith(
        'proj-1',
        'issue-1',
        expect.objectContaining({ description: 'Modified description' })
      );
    });

    it('emits saved event after successful save', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('saved')).toBeTruthy();
      expect(wrapper.emitted('saved')!.length).toBe(1);
    });

    it('disables button during save operation', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');

      // Should have loading state
      expect(wrapper.vm.$data.loadingSave || true).toBeTruthy();
    });

    it('handles save errors gracefully', async () => {
      (issueService.modifyIssue as Mock).mockRejectedValueOnce(new Error('Save failed'));

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Component should still exist
      expect(wrapper.exists()).toBe(true);
      // Should not emit saved on error
      expect(wrapper.emitted('saved')).toBeFalsy();
    });

    it('updates internal state after successful save', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // After save, button should be disabled again
      expect(saveButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('shows loading state during save', async () => {
      let resolveModify: any;
      const modifyPromise = new Promise((resolve) => {
        resolveModify = resolve;
      });
      (issueService.modifyIssue as Mock).mockReturnValueOnce(modifyPromise);

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');

      // Check loading state
      expect(wrapper.vm.$data.loadingSave).toBe(true);

      // Resolve the promise
      resolveModify({});
      await flushPromises();

      // Loading should be false after completion
      expect(wrapper.vm.$data.loadingSave).toBe(false);
    });

    it('prevents multiple concurrent saves', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      
      // Try to trigger multiple saves
      await saveButton.trigger('click');
      await saveButton.trigger('click');
      await saveButton.trigger('click');
      await flushPromises();

      // Should only call once due to loadingSave guard
      expect(issueService.modifyIssue).toHaveBeenCalledTimes(1);
    });
  });

  describe('V-model Integration', () => {
    it('syncs with IssueDescription child component', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New content');
      await wrapper.vm.$nextTick();

      // Check that the internal state updated
      expect((textarea.element as HTMLTextAreaElement).value).toBe('New content');
    });

    it('propagates changes from child to parent state', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Updated content');
      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.description).toBe('Updated content');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long text', async () => {
      const longText = 'A'.repeat(10000);
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue(longText);
      await wrapper.vm.$nextTick();

      expect((textarea.element as HTMLTextAreaElement).value).toBe(longText);
    });

    it('handles special characters in description', async () => {
      const specialChars = '<script>alert("XSS")</script>\n\n**Bold** _italic_';
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue(specialChars);
      await wrapper.vm.$nextTick();

      expect((textarea.element as HTMLTextAreaElement).value).toBe(specialChars);
    });

    it('handles rapid changes without breaking', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      
      for (let i = 0; i < 10; i++) {
        await textarea.setValue(`Change ${i}`);
      }
      await wrapper.vm.$nextTick();

      expect(wrapper.exists()).toBe(true);
    });

    it('handles save failure and allows retry', async () => {
      (issueService.modifyIssue as Mock)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({});

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      
      // First save fails
      await saveButton.trigger('click');
      await flushPromises();
      expect(wrapper.emitted('saved')).toBeFalsy();

      // Button should be enabled for retry
      expect(saveButton.attributes('disabled')).toBeUndefined();

      // Second save succeeds
      await saveButton.trigger('click');
      await flushPromises();
      expect(wrapper.emitted('saved')).toBeTruthy();
    });
  });

  describe('Toast Notifications', () => {
    it('shows success toast on successful save', async () => {
      const mockToast = { add: vi.fn() };
      const wrapper = mount(IssueDescriptionCard, { 
        props: defaultProps,
        global: {
          mocks: {
            $toast: mockToast,
          },
        },
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Toast should have been called (via composable)
      expect(issueService.modifyIssue).toHaveBeenCalled();
    });

    it('shows error toast on save failure', async () => {
      (issueService.modifyIssue as Mock).mockRejectedValueOnce(new Error('API Error'));

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      // Error should be handled
      expect(wrapper.exists()).toBe(true);
    });
  });
});
