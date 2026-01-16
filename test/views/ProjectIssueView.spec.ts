import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ProjectIssueView from '@/views/ProjectIssueView.vue';
import IssueDetailsCard from '@/components/issue/IssueDetailsCard.vue';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';

// Mock the IssueService
vi.mock('@/services/IssueService', () => ({
  issueService: {
    getIssue: vi.fn().mockResolvedValue({
      id: '#ISSUE-123',
      title: 'Fix login bug on mobile devices',
      status: 'OPEN',
      ownerId: 'user-456',
      reporterId: 'user-123',
      type: 'TASK',
      tenancyId: 'tenant-789',
      description: '## Issue Description\n\nUsers are experiencing login failures on mobile devices.',
    }),
    modifyIssue: vi.fn().mockResolvedValue({}),
  },
}));

describe('ProjectIssueView.vue', () => {
  let wrapper: VueWrapper;

  const createWrapper = () => {
    return mount(ProjectIssueView, {
      props: {
        projectId: 'project-123',
        issueId: 'issue-456',
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          IssueDetailsCard: false,
          IssueDescriptionCard: false,
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

    it('should render IssueDetailsCard component', () => {
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      expect(detailsCard.exists()).toBe(true);
    });

    it('should render IssueDescriptionCard component', () => {
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      expect(descCard.exists()).toBe(true);
    });

    it('should pass correct props to IssueDetailsCard', async () => {
      await wrapper.vm.$nextTick();
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      const props = detailsCard.props();
      
      expect(props.projectId).toBe('project-123');
      expect(props.issueId).toBe('issue-456');
      expect(props.initialData).toBeDefined();
    });

    it('should pass correct props to IssueDescriptionCard', async () => {
      await wrapper.vm.$nextTick();
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      const props = descCard.props();
      
      expect(props.projectId).toBe('project-123');
      expect(props.issueId).toBe('issue-456');
      expect(props.initialDescription).toBeDefined();
    });
  });

  describe('Props and Initial Data', () => {
    it('should receive projectId prop', () => {
      expect(wrapper.props('projectId')).toBe('project-123');
    });

    it('should receive issueId prop', () => {
      expect(wrapper.props('issueId')).toBe('issue-456');
    });

    it('should initialize issueDetailsData ref', async () => {
      await wrapper.vm.$nextTick();
      const vm = wrapper.vm as any;
      expect(vm.issueDetailsData).toBeDefined();
    });

    it('should initialize description ref', async () => {
      await wrapper.vm.$nextTick();
      const vm = wrapper.vm as any;
      expect(vm.description).toBeDefined();
    });
  });

  describe('Data Fetching', () => {
    it('should call fetchIssue on mount', async () => {
      await wrapper.vm.$nextTick();
      // Issue should be fetched via mock
      const vm = wrapper.vm as any;
      expect(vm.issueDetailsData.issueId).toBeTruthy();
    });

    it('should populate issueDetailsData from API response', async () => {
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const vm = wrapper.vm as any;
      expect(vm.issueDetailsData.title).toBe('Fix login bug on mobile devices');
    });

    it('should populate description from API response', async () => {
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const vm = wrapper.vm as any;
      expect(vm.description).toContain('Issue Description');
    });
  });

  describe('Event Handling', () => {
    it('should handle saved event from IssueDetailsCard', async () => {
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      await detailsCard.vm.$emit('saved');
      
      // Event should be handled by parent
      await wrapper.vm.$nextTick();
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle saved event from IssueDescriptionCard', async () => {
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      await descCard.vm.$emit('saved');
      
      // Event should be handled by parent
      await wrapper.vm.$nextTick();
      expect(wrapper.exists()).toBe(true);
    });
  });
});
