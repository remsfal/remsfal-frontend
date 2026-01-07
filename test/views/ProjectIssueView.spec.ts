import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ProjectIssueView from '@/views/ProjectIssueView.vue';
import IssueDescription from '@/views/IssueDescription.vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';

describe('ProjectIssueView.vue', () => {
  let wrapper: VueWrapper;

  const createWrapper = () => {
    return mount(ProjectIssueView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        components: {
          Card,
          InputText,
          Select,
          Button,
          IssueDescription,
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

    it('should render Issue Details card', () => {
      const cards = wrapper.findAllComponents(Card);
      expect(cards.length).toBeGreaterThanOrEqual(2);
      expect(cards[0].text()).toContain('Issue Details');
    });

    it('should render Description card', () => {
      const cards = wrapper.findAllComponents(Card);
      expect(cards[1].text()).toContain('Description');
    });

    it('should render IssueDescription component', () => {
      const issueDescComp = wrapper.findComponent(IssueDescription);
      expect(issueDescComp.exists()).toBe(true);
    });

    it('should render all input fields', () => {
      const inputs = wrapper.findAllComponents(InputText);
      // Issue ID, Title, Reporter, Owner, Project, Tenancy = 6 InputText fields
      expect(inputs.length).toBe(6);
    });

    it('should render Status and Type select dropdowns', () => {
      const selects = wrapper.findAllComponents(Select);
      expect(selects.length).toBe(2);
    });

    it('should render Save button', () => {
      const button = wrapper.findComponent(Button);
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('Save');
    });
  });

  describe('Props and Initial Data', () => {
    it('should initialize with correct default values', () => {
      const vm = wrapper.vm as any;
      
      expect(vm.issueId).toBe('#ISSUE-123');
      expect(vm.title).toBe('Fix login bug on mobile devices');
      expect(vm.status).toBe('OPEN');
      expect(vm.reporter).toBe('John Doe');
      expect(vm.owner).toBe('Jane Smith');
      expect(vm.project).toBe('Building A Renovation');
      expect(vm.type).toBe('TASK');
      expect(vm.tenancy).toBe('Apartment 3B');
    });

    it('should pass description prop to IssueDescription component', () => {
      const issueDescComp = wrapper.findComponent(IssueDescription);
      const props = issueDescComp.props();
      
      expect(props.description).toContain('## Issue Description');
      expect(props.description).toContain('Users are experiencing login failures');
    });
  });

  describe('Reactive Data', () => {
    it('should update title when input changes', async () => {
      const vm = wrapper.vm as any;
      const titleInput = wrapper.findAllComponents(InputText)[1]; // Title is second InputText
      
      await titleInput.setValue('New Title');
      
      expect(vm.title).toBe('New Title');
    });

    it('should update owner when input changes', async () => {
      const vm = wrapper.vm as any;
      const ownerInput = wrapper.findAllComponents(InputText)[3]; // Owner is 4th InputText
      
      await ownerInput.setValue('New Owner');
      
      expect(vm.owner).toBe('New Owner');
    });
  });

  describe('Computed Properties', () => {
    it('should have canSave as false initially', () => {
      const vm = wrapper.vm as any;
      expect(vm.canSave).toBe(false);
    });

    it('should enable Save button when title changes', async () => {
      const vm = wrapper.vm as any;
      const button = wrapper.findComponent(Button);
      
      expect(vm.canSave).toBe(false);
      expect(button.attributes('disabled')).toBeDefined();
      
      vm.title = 'Changed Title';
      await wrapper.vm.$nextTick();
      
      expect(vm.canSave).toBe(true);
    });

    it('should enable Save button when status changes', async () => {
      const vm = wrapper.vm as any;
      
      vm.status = 'CLOSED';
      await wrapper.vm.$nextTick();
      
      expect(vm.canSave).toBe(true);
    });

    it('should enable Save button when owner changes', async () => {
      const vm = wrapper.vm as any;
      
      vm.owner = 'New Owner';
      await wrapper.vm.$nextTick();
      
      expect(vm.canSave).toBe(true);
    });

    it('should enable Save button when project changes', async () => {
      const vm = wrapper.vm as any;
      
      vm.project = 'New Project';
      await wrapper.vm.$nextTick();
      
      expect(vm.canSave).toBe(true);
    });

    it('should enable Save button when type changes', async () => {
      const vm = wrapper.vm as any;
      
      vm.type = 'DEFECT';
      await wrapper.vm.$nextTick();
      
      expect(vm.canSave).toBe(true);
    });

    it('should enable Save button when tenancy changes', async () => {
      const vm = wrapper.vm as any;
      
      vm.tenancy = 'New Tenancy';
      await wrapper.vm.$nextTick();
      
      expect(vm.canSave).toBe(true);
    });

    it('should enable Save button when description changes', async () => {
      const vm = wrapper.vm as any;
      
      vm.description = 'New Description';
      await wrapper.vm.$nextTick();
      
      expect(vm.canSave).toBe(true);
    });
  });

  describe('Methods', () => {
    it('should call handleSave when Save button is clicked', async () => {
      const vm = wrapper.vm as any;
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Change a value to enable save button
      vm.title = 'Changed Title';
      await wrapper.vm.$nextTick();
      
      const button = wrapper.findComponent(Button);
      await button.trigger('click');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Saving issue:',
        expect.objectContaining({
          id: '#ISSUE-123',
          title: 'Changed Title',
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should include all fields in handleSave payload', async () => {
      const vm = wrapper.vm as any;
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      vm.title = 'Updated Title';
      await wrapper.vm.$nextTick();
      
      vm.handleSave();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Saving issue:',
        {
          id: '#ISSUE-123',
          title: 'Updated Title',
          status: 'OPEN',
          reporter: 'John Doe',
          owner: 'Jane Smith',
          project: 'Building A Renovation',
          type: 'TASK',
          tenancy: 'Apartment 3B',
          description: expect.any(String),
        }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Select Options', () => {
    it('should have correct status options', () => {
      const vm = wrapper.vm as any;
      
      expect(vm.statusOptions).toEqual([
        { label: 'Pending', value: 'PENDING' },
        { label: 'Open', value: 'OPEN' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Closed', value: 'CLOSED' },
        { label: 'Rejected', value: 'REJECTED' },
      ]);
    });

    it('should have correct type options', () => {
      const vm = wrapper.vm as any;
      
      expect(vm.typeOptions).toEqual([
        { label: 'Application', value: 'APPLICATION' },
        { label: 'Task', value: 'TASK' },
        { label: 'Defect', value: 'DEFECT' },
        { label: 'Maintenance', value: 'MAINTENANCE' },
      ]);
    });
  });

  describe('Disabled Fields', () => {
    it('should have Issue ID field disabled', () => {
      const issueIdInput = wrapper.findAllComponents(InputText)[0];
      expect(issueIdInput.attributes('disabled')).toBeDefined();
    });

    it('should have Reporter field disabled', () => {
      const reporterInput = wrapper.findAllComponents(InputText)[2];
      expect(reporterInput.attributes('disabled')).toBeDefined();
    });

    it('should have Save button disabled initially', () => {
      const button = wrapper.findComponent(Button);
      expect(button.attributes('disabled')).toBeDefined();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render field labels correctly', () => {
      const labels = wrapper.findAll('label');
      const labelTexts = labels.map(label => label.text());
      
      expect(labelTexts).toContain('Issue ID');
      expect(labelTexts).toContain('Title');
      expect(labelTexts).toContain('Status');
      expect(labelTexts).toContain('Type');
      expect(labelTexts).toContain('Reporter');
      expect(labelTexts).toContain('Owner / Assignee');
      expect(labelTexts).toContain('Project');
      expect(labelTexts).toContain('Tenancy');
    });

    it('should have correct CSS classes for styling', () => {
      const cards = wrapper.findAllComponents(Card);
      
      // Check if cards have flex styling
      expect(cards[0].classes()).toContain('flex');
      expect(cards[0].classes()).toContain('flex-col');
      expect(cards[0].classes()).toContain('gap-4');
      expect(cards[0].classes()).toContain('basis-full');
    });
  });
});
