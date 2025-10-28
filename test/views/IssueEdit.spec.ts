import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import IssueEdit from '../../src/views/IssueEdit.vue';
import { IssueService } from '../../src/services/IssueService';

// Mock the service
vi.mock('../../src/services/IssueService');

describe('IssueEdit.vue', () => {
  let wrapper: any;

  const mockIssue = {
    id: '1',
    title: 'Test Issue',
    description: 'Description',
    status: 'OPEN',
    ownerId: 'owner1',
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    IssueService.prototype.getIssue = vi.fn().mockResolvedValue(mockIssue);

    wrapper = mount(IssueEdit, {
      global: {
        mocks: {
          $route: { params: { projectId: '1', issueId: '1' } },
          $router: { go: vi.fn() },
        },
      },
    });

    // Wait for onMounted or setup logic to finish
    if (wrapper.vm.loadIssue) {
      await wrapper.vm.loadIssue();
    }
    await nextTick();
  });

  it('loads issue on mount', () => {
    expect(IssueService.prototype.getIssue).toHaveBeenCalled();
    // Use plain object access, not .value
    expect(wrapper.vm.issue).toEqual(mockIssue);
  });

  it('validates fields and shows error if missing', () => {
    // Set invalid issue (plain object)
    wrapper.vm.issue = { title: '', description: '', status: '' };
    wrapper.vm.errors = {}; // plain reactive object

    const valid = wrapper.vm.validateIssue();
    expect(valid).toBe(false);

    const errors = wrapper.vm.errors;
    expect(Object.keys(errors)).toContain('title');
    expect(Object.keys(errors)).toContain('description');
    expect(Object.keys(errors)).toContain('status');
  });
});
