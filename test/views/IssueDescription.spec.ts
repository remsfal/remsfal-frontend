// Mock ResizeObserver globally
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import IssueDescription from '@/views/IssueDescription.vue';

describe('IssueDescription.vue', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  describe('Rendering', () => {
    it('renders the initial description prop', () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Initial description' },
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Initial description');
    });

    it('renders textarea element', () => {
      const wrapper = mount(IssueDescription, {
        props: { description: '' },
      });

      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('takes snapshot', () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Test description' },
      });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders with empty description', () => {
      const wrapper = mount(IssueDescription, {
        props: { description: '' },
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('');
    });
  });

  describe('Props', () => {
    it('accepts description prop', () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Test content' },
      });

      expect(wrapper.props('description')).toBe('Test content');
    });

    it('updates when description prop changes', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Initial' },
      });

      await wrapper.setProps({ description: 'Updated' });
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Updated');
    });

    it('handles long text in description prop', () => {
      const longText = 'A'.repeat(1000);
      const wrapper = mount(IssueDescription, {
        props: { description: longText },
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(longText);
    });
  });

  describe('Events', () => {
    it('emits update:description when textarea changes', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Initial description' },
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Updated description');

      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted![0]).toEqual(['Updated description']);
    });

    it('emits on every keystroke', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Test' },
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Test1');
      await textarea.setValue('Test12');
      await textarea.setValue('Test123');

      const emitted = wrapper.emitted('update:description');
      expect(emitted?.length).toBe(3);
    });

    it('emits with correct value type', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Initial' },
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('New value');

      const emitted = wrapper.emitted('update:description');
      expect(typeof emitted![0][0]).toBe('string');
    });
  });

  describe('User Interaction', () => {
    it('allows user to type in textarea', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: '' },
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('User typed content');

      expect((textarea.element as HTMLTextAreaElement).value).toBe('User typed content');
    });

    it('preserves line breaks', async () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      const wrapper = mount(IssueDescription, {
        props: { description: '' },
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue(multiline);

      expect((textarea.element as HTMLTextAreaElement).value).toBe(multiline);
    });

    it('handles rapid typing', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: '' },
      });

      const textarea = wrapper.find('textarea');
      
      for (let i = 0; i < 10; i++) {
        await textarea.setValue(`Content ${i}`);
      }

      const emitted = wrapper.emitted('update:description');
      expect(emitted?.length).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~';
      const wrapper = mount(IssueDescription, {
        props: { description: specialChars },
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(specialChars);
    });

    it('handles markdown syntax', async () => {
      const markdown = '# Title\n\n## Subtitle\n\n- Item 1\n- Item 2\n\n```code```';
      const wrapper = mount(IssueDescription, {
        props: { description: markdown },
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(markdown);
    });

    it('handles very long text without issues', () => {
      const veryLongText = 'Lorem ipsum '.repeat(1000);
      const wrapper = mount(IssueDescription, {
        props: { description: veryLongText },
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value.length).toBeGreaterThan(10000);
    });

    it('handles unicode characters', () => {
      const unicode = '你好世界 مرحبا 🌍🌎🌏';
      const wrapper = mount(IssueDescription, {
        props: { description: unicode },
      });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(unicode);
    });
  });

  describe('Reactivity', () => {
    it('updates local value when prop changes', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Initial description' },
      });

      await wrapper.setProps({ description: 'New description' });
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('New description');
    });

    it('syncs with parent component via v-model', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Parent value' },
      });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Child updated');

      expect(wrapper.emitted('update:description')).toBeTruthy();
      expect(wrapper.emitted('update:description')![0]).toEqual(['Child updated']);
    });

    it('handles rapid prop updates', async () => {
      const wrapper = mount(IssueDescription, {
        props: { description: 'Initial' },
      });

      await wrapper.setProps({ description: 'Update 1' });
      await wrapper.setProps({ description: 'Update 2' });
      await wrapper.setProps({ description: 'Update 3' });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Update 3');
    });
  });
});
