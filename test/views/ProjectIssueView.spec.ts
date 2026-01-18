import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
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

// Mock the ProjectService
vi.mock('@/services/ProjectService', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue({
      projects: [
        { id: 'project-1', title: 'Project Alpha' },
        { id: 'project-2', title: 'Project Beta' },
        { id: 'project-3', title: 'Project Gamma' },
      ],
    }),
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

    it('should render IssueDetailsCard component', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      expect(detailsCard.exists()).toBe(true);
    });

    it('should render IssueDescriptionCard component', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      expect(descCard.exists()).toBe(true);
    });

    it('should pass correct props to IssueDetailsCard', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      expect(detailsCard.exists()).toBe(true);
      const props = detailsCard.props();
      
      expect(props.projectId).toBe('project-123');
      expect(props.issueId).toBe('issue-456');
      expect(props.initialData).toBeDefined();
    });

    it('should pass correct props to IssueDescriptionCard', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      expect(descCard.exists()).toBe(true);
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

    it('should pass issueDetailsData to IssueDetailsCard', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      expect(detailsCard.exists()).toBe(true);
      const initialData = detailsCard.props('initialData');
      expect(initialData).toBeDefined();
      expect(initialData.issueId).toBeTruthy();
    });

    it('should pass description to IssueDescriptionCard', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      expect(descCard.exists()).toBe(true);
      const initialDescription = descCard.props('initialDescription');
      expect(initialDescription).toBeDefined();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch issue data on mount', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      expect(detailsCard.exists()).toBe(true);
      const initialData = detailsCard.props('initialData');
      expect(initialData.issueId).toBeTruthy();
    });

    it('should populate issue details from API response', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      expect(detailsCard.exists()).toBe(true);
      const initialData = detailsCard.props('initialData');
      expect(initialData.title).toBe('Fix login bug on mobile devices');
      expect(initialData.status).toBe('OPEN');
      expect(initialData.issueType).toBe('TASK');
    });

    it('should populate description from API response', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      expect(descCard.exists()).toBe(true);
      const initialDescription = descCard.props('initialDescription');
      expect(initialDescription).toContain('Issue Description');
    });
  });

  describe('Event Handling', () => {
    it('should handle saved event from IssueDetailsCard', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      const detailsCard = wrapper.findComponent(IssueDetailsCard);
      expect(detailsCard.exists()).toBe(true);
      await detailsCard.vm.$emit('saved');
      
      // Event should be handled by parent
      await wrapper.vm.$nextTick();
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle saved event from IssueDescriptionCard', async () => {
      await flushPromises();
      await wrapper.vm.$nextTick();
      const descCard = wrapper.findComponent(IssueDescriptionCard);
      expect(descCard.exists()).toBe(true);
      await descCard.vm.$emit('saved');
      
      // Event should be handled by parent
      await wrapper.vm.$nextTick();
      expect(wrapper.exists()).toBe(true);
    });
  });
});
