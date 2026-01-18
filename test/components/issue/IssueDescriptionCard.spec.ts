import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import { issueService } from '@/services/IssueService';

// Mock services
vi.mock('@/services/IssueService', () => ({
  issueService: { modifyIssue: vi.fn() },
}));

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: vi.fn() }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const defaultProps = {
  projectId: 'proj-1',
  issueId: 'issue-1',
  initialDescription: 'Initial markdown description',
};

describe('IssueDescriptionCard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('canSave returns false after successful save', async () => {
      vi.mocked(issueService.modifyIssue).mockResolvedValue({} as any);

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(saveButton.attributes('disabled')).toBeDefined();
    });
  });

  describe('Save Functionality', () => {
    it('calls issueService.modifyIssue with description', async () => {
      vi.mocked(issueService.modifyIssue).mockResolvedValue({} as any);

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New description content');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(issueService.modifyIssue).toHaveBeenCalledWith(
        'proj-1',
        'issue-1',
        { description: 'New description content' }
      );
    });

    it('emits saved event after successful save', async () => {
      vi.mocked(issueService.modifyIssue).mockResolvedValue({} as any);

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('saved')).toBeTruthy();
      expect(wrapper.emitted('saved')?.length).toBe(1);
    });

    it('shows loading state during save', async () => {
      vi.mocked(issueService.modifyIssue).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
      );

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');

      const vm = wrapper.vm as any;
      expect(vm.loadingSave).toBe(true);

      await flushPromises();
      expect(vm.loadingSave).toBe(false);
    });

    it('handles save error gracefully', async () => {
      vi.mocked(issueService.modifyIssue).mockRejectedValue(new Error('Save failed'));

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('saved')).toBeFalsy();
      const vm = wrapper.vm as any;
      expect(vm.loadingSave).toBe(false);
    });

    it('prevents save when no changes made', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(issueService.modifyIssue).not.toHaveBeenCalled();
    });

    it('prevents multiple simultaneous saves', async () => {
      vi.mocked(issueService.modifyIssue).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
      );

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New description');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await saveButton.trigger('click');
      await saveButton.trigger('click');

      expect(issueService.modifyIssue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Description Updates', () => {
    it('updates description when user types', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('User typed this');

      const vm = wrapper.vm as any;
      expect(vm.description).toBe('User typed this');
    });

    it('v-model binding works with IssueDescription component', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const issueDescComponent = wrapper.findComponent({ name: 'IssueDescription' });
      expect(issueDescComponent.exists()).toBe(true);

      await issueDescComponent.vm.$emit('update:description', 'Emitted value');
      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.description).toBe('Emitted value');
    });

    it('resets to original description when prop updates', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Temporary change');

      await wrapper.setProps({ initialDescription: 'Reset value' });
      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.description).toBe('Reset value');
      expect(vm.originalDescription).toBe('Reset value');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long description text', async () => {
      const longText = 'A'.repeat(10000);
      const propsWithLongDesc = { ...defaultProps, initialDescription: longText };

      const wrapper = mount(IssueDescriptionCard, { props: propsWithLongDesc });

      const textarea = wrapper.find('textarea');
      expect((textarea.element as HTMLTextAreaElement).value).toBe(longText);
    });

    it('handles special characters in description', async () => {
      const specialText = '# Markdown\n\n```code```\n\n**bold** _italic_';
      const propsWithSpecial = { ...defaultProps, initialDescription: specialText };

      const wrapper = mount(IssueDescriptionCard, { props: propsWithSpecial });

      const textarea = wrapper.find('textarea');
      expect((textarea.element as HTMLTextAreaElement).value).toBe(specialText);
    });

    it('handles rapid description changes', async () => {
      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      
      await textarea.setValue('First change');
      await textarea.setValue('Second change');
      await textarea.setValue('Third change');
      await wrapper.vm.$nextTick();

      const vm = wrapper.vm as any;
      expect(vm.description).toBe('Third change');
    });

    it('maintains description after failed save', async () => {
      vi.mocked(issueService.modifyIssue).mockRejectedValue(new Error('Network error'));

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Failed save content');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      const vm = wrapper.vm as any;
      expect(vm.description).toBe('Failed save content');
    });
  });

  describe('Toast Notifications', () => {
    it('shows success toast on successful save', async () => {
      vi.mocked(issueService.modifyIssue).mockResolvedValue({} as any);
      const mockToastAdd = vi.fn();
      vi.mocked(require('primevue/usetoast').useToast).mockReturnValue({ add: mockToastAdd });

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New content');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          summary: 'success.saved',
          detail: 'issueDetails.descriptionSaveSuccess',
        })
      );
    });

    it('shows error toast on save failure', async () => {
      vi.mocked(issueService.modifyIssue).mockRejectedValue(new Error('Save error'));
      const mockToastAdd = vi.fn();
      vi.mocked(require('primevue/usetoast').useToast).mockReturnValue({ add: mockToastAdd });

      const wrapper = mount(IssueDescriptionCard, { props: defaultProps });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New content');
      await wrapper.vm.$nextTick();

      const saveButton = wrapper.find('button');
      await saveButton.trigger('click');
      await flushPromises();

      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'error.general',
          detail: 'issueDetails.descriptionSaveError',
        })
      );
    });
  });
});
