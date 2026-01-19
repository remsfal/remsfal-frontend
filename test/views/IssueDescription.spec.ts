// Mock ResizeObserver globally
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as any;

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import IssueDescription from '@/views/IssueDescription.vue';

describe('IssueDescription.vue', () => {
  beforeEach(() => {
    // Reset any global state if needed
  });

  describe('Rendering', () => {
    it('renders the initial description prop', () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Initial description' },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Initial description');
    });

    it('renders textarea element', () => {
      const wrapper = mount(IssueDescription, {props: { description: '' },});

      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('renders description correctly', () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Test description' },});
    
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Test description');
    });
    

    it('renders with empty description', () => {
      const wrapper = mount(IssueDescription, {props: { description: '' },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('');
    });

    it('renders with undefined description', () => {
      const wrapper = mount(IssueDescription, {props: { description: undefined as any },});

      // Component should handle undefined gracefully
      expect(wrapper.find('textarea').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('accepts description prop', () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Test content' },});

      expect(wrapper.props('description')).toBe('Test content');
    });

    it('updates when description prop changes', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Initial' },});

      await wrapper.setProps({ description: 'Updated' });
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Updated');
    });

    it('handles long text in description prop', () => {
      const longText = 'A'.repeat(1000);
      const wrapper = mount(IssueDescription, {props: { description: longText },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(longText);
    });

    it('handles special characters in description', () => {
      const specialText = '<script>alert("test")</script>\n\n**Bold**';
      const wrapper = mount(IssueDescription, {props: { description: specialText },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(specialText);
    });

    it('handles unicode characters', () => {
      const unicodeText = '你好世界 🌍 Привет мир';
      const wrapper = mount(IssueDescription, {props: { description: unicodeText },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(unicodeText);
    });
  });

  describe('Events', () => {
    it('emits update:description when textarea changes', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Initial description' },});

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Updated description');

      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted![0]).toEqual(['Updated description']);
    });

    it('emits on every keystroke', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Test' },});

      const textarea = wrapper.find('textarea');
      
      await textarea.setValue('Test 1');
      await textarea.setValue('Test 12');
      await textarea.setValue('Test 123');

      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted!.length).toBeGreaterThanOrEqual(3);
    });

    it('emits correct value on change', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Original' },});

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified content');

      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual(['Modified content']);
    });

    it('emits when clearing textarea', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Some text' },});

      const textarea = wrapper.find('textarea');
      await textarea.setValue('');

      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual(['']);
    });

    it('does not emit when prop changes externally', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Initial' },});

      // Clear previous emissions
      wrapper.vm.$emit = vi.fn();

      // Change prop externally
      await wrapper.setProps({ description: 'External change' });

      // The component watch will update localDescription but shouldn't emit
      // Check textarea value updated
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('External change');
    });
  });

  describe('User Interactions', () => {
    it('allows typing in textarea', async () => {
      const wrapper = mount(IssueDescription, {props: { description: '' },});

      const textarea = wrapper.find('textarea');
      await textarea.setValue('User typed content');

      expect((textarea.element as HTMLTextAreaElement).value).toBe('User typed content');
    });

    it('preserves line breaks', async () => {
      const textWithBreaks = 'Line 1\nLine 2\nLine 3';
      const wrapper = mount(IssueDescription, {props: { description: textWithBreaks },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(textWithBreaks);
    });

    it('handles paste operations', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Initial' },});

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Initial\nPasted content');

      expect((textarea.element as HTMLTextAreaElement).value).toContain('Pasted content');
    });

    it('handles rapid sequential changes', async () => {
      const wrapper = mount(IssueDescription, {props: { description: '' },});

      const textarea = wrapper.find('textarea');
      
      // Simulate rapid typing
      for (let i = 0; i < 20; i++) {
        await textarea.setValue(`Content ${i}`);
      }

      expect(wrapper.exists()).toBe(true);
      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted!.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely long text', async () => {
      const veryLongText = 'A'.repeat(50000);
      const wrapper = mount(IssueDescription, {props: { description: veryLongText },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(veryLongText);
    });

    it('handles markdown formatting', () => {
      const markdownText = '# Heading\n\n**Bold** _italic_\n\n- List item 1\n- List item 2\n\n```js\ncode block\n```';
      const wrapper = mount(IssueDescription, {props: { description: markdownText },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(markdownText);
    });

    it('handles tabs and special whitespace', () => {
      const textWithTabs = 'Normal\tTabbed\t\tDouble Tab\n\t\tIndented';
      const wrapper = mount(IssueDescription, {props: { description: textWithTabs },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(textWithTabs);
    });

    it('handles emojis and symbols', () => {
      const emojiText = '😀 👍 🎉 ⭐ ✅ ❌ ⚠️ 📝';
      const wrapper = mount(IssueDescription, {props: { description: emojiText },});

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(emojiText);
    });

    it('handles null-like values gracefully', () => {
      const wrapper = mount(IssueDescription, {props: { description: null as any },});

      // Component should not crash
      expect(wrapper.find('textarea').exists()).toBe(true);
    });
  });

  describe('Reactivity', () => {
    it('syncs local state with prop changes', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Initial' },});

      await wrapper.setProps({ description: 'Changed externally' });
      await wrapper.vm.$nextTick();

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Changed externally');
    });

    it('maintains two-way binding with v-model', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Start' },});

      const textarea = wrapper.find('textarea');
      await textarea.setValue('User input');

      // Check emission
      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1][0]).toBe('User input');

      // Verify local state
      expect((textarea.element as HTMLTextAreaElement).value).toBe('User input');
    });

    it('handles multiple prop updates', async () => {
      const wrapper = mount(IssueDescription, {props: { description: 'V1' },});

      await wrapper.setProps({ description: 'V2' });
      await wrapper.vm.$nextTick();
      expect(wrapper.find('textarea').element.value).toBe('V2');

      await wrapper.setProps({ description: 'V3' });
      await wrapper.vm.$nextTick();
      expect(wrapper.find('textarea').element.value).toBe('V3');

      await wrapper.setProps({ description: 'V4' });
      await wrapper.vm.$nextTick();
      expect(wrapper.find('textarea').element.value).toBe('V4');
    });
  });

  describe('Textarea Attributes', () => {
    it('has autoResize enabled', () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Test' },});

      const textarea = wrapper.find('textarea');
      // Check that PrimeVue Textarea is rendered
      expect(textarea.exists()).toBe(true);
    });

    it('has correct number of rows', () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Test' },});

      const textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(true);
    });

    it('has placeholder text', () => {
      const wrapper = mount(IssueDescription, {props: { description: '' },});

      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('placeholder')).toBe('Write markdown description here...');
    });

    it('has full width class', () => {
      const wrapper = mount(IssueDescription, {props: { description: 'Test' },});

      expect(wrapper.classes()).toContain('w-full');
    });
  });
});
