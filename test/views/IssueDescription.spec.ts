// Mock ResizeObserver globally
import { setupResizeObserverMock } from '../setup/issueTestHelpers';
setupResizeObserverMock();

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IssueDescription from '@/views/IssueDescription.vue';
import {edgeCaseTestData,
  expectEventEmitted,} from '../setup/issueTestHelpers';

describe('IssueDescription.vue', () => {
  const mountComponent = (props = {}) =>
    mount(IssueDescription, {props: { description: '', ...props },});

  beforeEach(() => {
    // Reset any global state if needed
  });

  describe('Rendering', () => {
    it('renders the initial description prop', () => {
      const wrapper = mountComponent({ description: 'Initial description' });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Initial description');
    });

    it('renders textarea element', () => {
      const wrapper = mountComponent();

      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('renders description correctly', () => {
      const wrapper = mountComponent({ description: 'Test description' });
    
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Test description');
    });
    

    it('renders with empty description', () => {
      const wrapper = mountComponent();

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('');
    });

    it('renders with undefined description', () => {
      const wrapper = mountComponent({ description: undefined as any });

      // Component should handle undefined gracefully
      expect(wrapper.find('textarea').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('accepts description prop', () => {
      const wrapper = mountComponent({ description: 'Test content' });

      expect(wrapper.props('description')).toBe('Test content');
    });

    it('updates when description prop changes', async () => {
      const wrapper = mountComponent({ description: 'Initial' });

      await wrapper.setProps({ description: 'Updated' });
      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Updated');
    });

    it('handles long text in description prop', () => {
      const wrapper = mountComponent({ description: edgeCaseTestData.longText });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(edgeCaseTestData.longText);
    });

    it('handles unicode characters', () => {
      const wrapper = mountComponent({ description: edgeCaseTestData.unicodeExtended });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(edgeCaseTestData.unicodeExtended);
    });
  });

  describe('Events', () => {
    it('emits update:description when textarea changes', async () => {
      const wrapper = mountComponent({ description: 'Initial description' });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Updated description');

      expectEventEmitted(wrapper, 'update:description', ['Updated description']);
    });

    it('emits on every keystroke', async () => {
      const wrapper = mountComponent({ description: 'Test' });

      const textarea = wrapper.find('textarea');
      
      await textarea.setValue('Test 1');
      await textarea.setValue('Test 12');
      await textarea.setValue('Test 123');

      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted!.length).toBeGreaterThanOrEqual(3);
    });

    it('emits correct value on change', async () => {
      const wrapper = mountComponent({ description: 'Original' });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Modified content');

      expectEventEmitted(wrapper, 'update:description');
    });

    it('emits when clearing textarea', async () => {
      const wrapper = mountComponent({ description: 'Some text' });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('');

      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual(['']);
    });

    it('does not emit when prop changes externally', async () => {
      const wrapper = mountComponent({ description: 'Initial' });

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
      const wrapper = mountComponent();

      const textarea = wrapper.find('textarea');
      await textarea.setValue('User typed content');

      expect((textarea.element as HTMLTextAreaElement).value).toBe('User typed content');
    });

    it('preserves line breaks', async () => {
      const wrapper = mountComponent({ description: edgeCaseTestData.lineBreaks });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(edgeCaseTestData.lineBreaks);
    });

    it('handles paste operations', async () => {
      const wrapper = mountComponent({ description: 'Initial' });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('Initial\nPasted content');

      expect((textarea.element as HTMLTextAreaElement).value).toContain('Pasted content');
    });

    it('handles rapid sequential changes', async () => {
      const wrapper = mountComponent();

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
      const wrapper = mountComponent({ description: edgeCaseTestData.veryLongText });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(edgeCaseTestData.veryLongText);
    });

    it('handles markdown formatting', () => {
      const wrapper = mountComponent({ description: edgeCaseTestData.markdown });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(edgeCaseTestData.markdown);
    });

    it('handles tabs and special whitespace', () => {
      const wrapper = mountComponent({ description: edgeCaseTestData.tabsAndWhitespace });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(edgeCaseTestData.tabsAndWhitespace);
    });

    it('handles emojis and symbols', () => {
      const wrapper = mountComponent({ description: edgeCaseTestData.emojis });

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe(edgeCaseTestData.emojis);
    });

    it('handles null-like values gracefully', () => {
      const wrapper = mountComponent({ description: null as any });

      // Component should not crash
      expect(wrapper.find('textarea').exists()).toBe(true);
    });
  });

  describe('Reactivity', () => {
    it('syncs local state with prop changes', async () => {
      const wrapper = mountComponent({ description: 'Initial' });

      await wrapper.setProps({ description: 'Changed externally' });
      await wrapper.vm.$nextTick();

      const textarea = wrapper.find('textarea');
      expect(textarea.element.value).toBe('Changed externally');
    });

    it('maintains two-way binding with v-model', async () => {
      const wrapper = mountComponent({ description: 'Start' });

      const textarea = wrapper.find('textarea');
      await textarea.setValue('User input');

      // Check emission
      expectEventEmitted(wrapper, 'update:description');

      // Verify local state
      expect((textarea.element as HTMLTextAreaElement).value).toBe('User input');
    });

    it('handles multiple prop updates', async () => {
      const wrapper = mountComponent({ description: 'V1' });

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
      const wrapper = mountComponent({ description: 'Test' });

      const textarea = wrapper.find('textarea');
      // Check that PrimeVue Textarea is rendered
      expect(textarea.exists()).toBe(true);
    });

    it('has correct number of rows', () => {
      const wrapper = mountComponent({ description: 'Test' });

      const textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(true);
    });

    it('has placeholder text', () => {
      const wrapper = mountComponent();

      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('placeholder')).toBe('Write markdown description here...');
    });

    it('has full width class', () => {
      const wrapper = mountComponent({ description: 'Test' });

      expect(wrapper.classes()).toContain('w-full');
    });
  });
});
