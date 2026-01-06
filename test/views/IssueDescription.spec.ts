import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueDescription from '@/views/IssueDescription.vue';
import Textarea from 'primevue/textarea';

describe('IssueDescription.vue', () => {
  let wrapper: VueWrapper;

  const defaultProps = {
    description: '## Test Description\n\nThis is a test description.',
  };

  const createWrapper = (props = {}) => {
    return mount(IssueDescription, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        components: {
          Textarea,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Rendering', () => {
    it('should render the component', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('should render Textarea component', () => {
      const textarea = wrapper.findComponent(Textarea);
      expect(textarea.exists()).toBe(true);
    });

    it('should have correct wrapper classes', () => {
      const wrapperDiv = wrapper.find('div');
      expect(wrapperDiv.classes()).toContain('w-full');
    });
  });

  describe('Props', () => {
    it('should accept description prop', () => {
      expect(wrapper.props('description')).toBe('## Test Description\n\nThis is a test description.');
    });

    it('should initialize localDescription with prop value', () => {
      const vm = wrapper.vm as any;
      expect(vm.localDescription).toBe('## Test Description\n\nThis is a test description.');
    });

    it('should update localDescription when prop changes', async () => {
      const vm = wrapper.vm as any;
      const newDescription = '## Updated Description\n\nNew content';
      
      await wrapper.setProps({ description: newDescription });
      
      expect(vm.localDescription).toBe(newDescription);
    });
  });

  describe('Textarea Configuration', () => {
    it('should have autoResize enabled', () => {
      const textarea = wrapper.findComponent(Textarea);
      expect(textarea.props('autoResize')).toBe(true);
    });

    it('should have 8 rows initially', () => {
      const textarea = wrapper.findComponent(Textarea);
      expect(textarea.props('rows')).toBe(8);
    });

    it('should have correct placeholder text', () => {
      const textarea = wrapper.findComponent(Textarea);
      expect(textarea.props('placeholder')).toBe('Write markdown description here...');
    });

    it('should have w-full class', () => {
      const textarea = wrapper.findComponent(Textarea);
      expect(textarea.classes()).toContain('w-full');
    });
  });

  describe('Two-Way Binding', () => {
    it('should bind localDescription to textarea via v-model', () => {
      const vm = wrapper.vm as any;
      const textarea = wrapper.findComponent(Textarea);
      
      expect(textarea.props('modelValue')).toBe(vm.localDescription);
    });

    it('should update localDescription when textarea value changes', async () => {
      const vm = wrapper.vm as any;
      const newValue = '## New Description\n\nUser typed this';
      
      vm.localDescription = newValue;
      await wrapper.vm.$nextTick();
      
      expect(vm.localDescription).toBe(newValue);
    });
  });

  describe('Events and Emits', () => {
    it('should emit update:description when localDescription changes', async () => {
      const vm = wrapper.vm as any;
      const newDescription = '## Modified Description';
      
      vm.localDescription = newDescription;
      await wrapper.vm.$nextTick();
      
      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual([newDescription]);
    });

    it('should emit multiple times on multiple changes', async () => {
      const vm = wrapper.vm as any;
      
      vm.localDescription = 'First change';
      await wrapper.vm.$nextTick();
      
      vm.localDescription = 'Second change';
      await wrapper.vm.$nextTick();
      
      vm.localDescription = 'Third change';
      await wrapper.vm.$nextTick();
      
      const emitted = wrapper.emitted('update:description');
      expect(emitted).toBeTruthy();
      expect(emitted!.length).toBeGreaterThanOrEqual(3);
    });

    it('should define correct emit types', () => {
      const vm = wrapper.vm as any;
      expect(vm.$options.emits).toBeDefined();
    });
  });

  describe('Watchers', () => {
    it('should watch prop changes and update localDescription', async () => {
      const vm = wrapper.vm as any;
      const newPropValue = '## Prop Changed';
      
      await wrapper.setProps({ description: newPropValue });
      
      expect(vm.localDescription).toBe(newPropValue);
    });

    it('should watch localDescription changes and emit event', async () => {
      const vm = wrapper.vm as any;
      const newValue = '## Local Change';
      
      vm.localDescription = newValue;
      await wrapper.vm.$nextTick();
      
      const emitted = wrapper.emitted('update:description');
      expect(emitted![emitted!.length - 1]).toEqual([newValue]);
    });

    it('should handle rapid prop changes', async () => {
      const vm = wrapper.vm as any;
      
      await wrapper.setProps({ description: 'Change 1' });
      await wrapper.setProps({ description: 'Change 2' });
      await wrapper.setProps({ description: 'Change 3' });
      
      expect(vm.localDescription).toBe('Change 3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty description', () => {
      const emptyWrapper = createWrapper({ description: '' });
      const vm = emptyWrapper.vm as any;
      
      expect(vm.localDescription).toBe('');
    });

    it('should handle very long description', () => {
      const longDescription = '## Long Description\n\n' + 'A'.repeat(10000);
      const longWrapper = createWrapper({ description: longDescription });
      const vm = longWrapper.vm as any;
      
      expect(vm.localDescription).toBe(longDescription);
    });

    it('should handle markdown with special characters', () => {
      const specialChars = '## Title\n\n`code` **bold** *italic* [link](url) <tag>';
      const specialWrapper = createWrapper({ description: specialChars });
      const vm = specialWrapper.vm as any;
      
      expect(vm.localDescription).toBe(specialChars);
    });

    it('should handle description with newlines and tabs', () => {
      const description = '## Title\n\n\tIndented\n\n\tMore indented';
      const newlineWrapper = createWrapper({ description });
      const vm = newlineWrapper.vm as any;
      
      expect(vm.localDescription).toBe(description);
    });
  });

  describe('v-model Support', () => {
    it('should work with v-model pattern', async () => {
      const vm = wrapper.vm as any;
      const newValue = '## v-model test';
      
      // Simulate v-model update
      vm.localDescription = newValue;
      await wrapper.vm.$nextTick();
      
      // Check emission
      const emitted = wrapper.emitted('update:description');
      expect(emitted![emitted!.length - 1]).toEqual([newValue]);
      
      // Simulate parent updating prop (v-model binding)
      await wrapper.setProps({ description: newValue });
      expect(vm.localDescription).toBe(newValue);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize correctly on mount', () => {
      const vm = wrapper.vm as any;
      
      expect(vm.localDescription).toBeDefined();
      expect(vm.localDescription).toBe(defaultProps.description);
    });

    it('should clean up correctly on unmount', () => {
      wrapper.unmount();
      expect(wrapper.vm).toBeUndefined();
    });
  });
});
