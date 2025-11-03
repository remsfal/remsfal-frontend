import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueView from '../../src/views/IssueView.vue';
import { issueService, StatusValues, type IssueItem } from '../../src/services/IssueService';

type IssueViewVm = InstanceType<typeof IssueView> & { visible: boolean };

describe('IssueView', () => {
  let wrapper: VueWrapper;

  const projectId = '1';
  const owner = 'user1';

  beforeEach(() => {
    wrapper = mount(IssueView, {
      props: { projectId, owner },
      data() {
        return { visible: false }; // Initial visibility state
      },
    });
  });

  describe('Button rendering and interaction', () => {
    it('renders the button when owner is defined', () => {
      const button = wrapper.find('.my-btn');
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe('Aufgabe erstellen');
    });

    it('sets "visible" to true when the button is clicked', async () => {
      const button = wrapper.find('.my-btn');
      await button.trigger('click');
      expect((wrapper.vm as IssueViewVm).visible).toBe(true);
    });
  });

  describe('Header rendering', () => {
    it('renders "Meine Aufgaben" when owner prop is defined', () => {
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Meine Aufgaben');
    });

    it('renders "Offene Aufgaben" when status prop is defined and owner is undefined', async () => {
      await wrapper.setProps({ owner: null, status: 'OPEN' });
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Offene Aufgaben');
    });

    it('renders "Alle Aufgaben" when neither owner nor status is defined', async () => {
      await wrapper.setProps({ owner: null, status: null });
      const header = wrapper.find('h2');
      expect(header.text()).toBe('Alle Aufgaben');
    });
  });

  describe('Issue fetching', () => {
    it('should return a list of issues', async () => {
      // Arrange
      const projectId = 'test-project';
      const mockIssues: IssueItem[] = [
        {
          id: '1',
          title: 'Issue 1',
          status: StatusValues['OPEN'],
          owner: 'owner1',
        },
        {
          id: '2',
          title: 'Issue 2',
          status: StatusValues['OPEN'],
          owner: 'owner1',
        },
      ];
      const mockIssueList = {
 issues: mockIssues, first: 0, size: 2, total: 2 
};

      // Act
      vi.spyOn(issueService, 'getIssues').mockImplementation(() => Promise.resolve(mockIssueList));
      const result = await issueService.getIssues(projectId);

      // Assert
      expect(result).toEqual(mockIssueList);
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].id).toBe('1');
      expect(result.issues[1].id).toBe('2');
    });
  });
});
