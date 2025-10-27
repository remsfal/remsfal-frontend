import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueTable from '../../src/components/IssueTable.vue';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import { RouterLinkStub } from '@vue/test-utils';
import { type IssueItem } from '../../src/services/IssueService';

const mockIssues: IssueItem[] = [
  { id: '1', title: 'Issue 1', owner: 'user1', status: 'OPEN', name: 'issue1' },
  { id: '2', title: 'Issue 2', owner: 'user2', status: 'CLOSED', name: 'issue2' },
  { id: '3', title: 'Issue 3', owner: 'user3', status: 'IN_PROGRESS', name: 'issue3' },
];

describe('IssueTable', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(IssueTable, {
      props: {
        issues: mockIssues,
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub, // Stub router links
        },
      },
    });
  });

  it('renders the DataTable with issues', () => {
    const dataTable = wrapper.findComponent(DataTable);
    expect(dataTable.exists()).toBe(true);

    const rows = wrapper.findAll('.p-datatable-tbody > tr');
    expect(rows.length).toBe(mockIssues.length);
  });

  it('displays correct data for each column', () => {
    const rows = wrapper.findAll('.p-datatable-tbody > tr');
    rows.forEach((row, index) => {
      const cells = row.findAll('td');
      expect(cells[0].text()).toBe(mockIssues[index].title);   // Title column
      expect(cells[1].text()).toBe(mockIssues[index].owner);   // Owner column
      expect(cells[2].text()).toBe(mockIssues[index].status);  // Status column
    });
  });

  it('renders edit button with correct RouterLink', () => {
    const editButtons = wrapper.findAllComponents(Button);
    expect(editButtons.length).toBe(mockIssues.length);

    mockIssues.forEach((issue, index) => {
      const routerLink = wrapper.findAllComponents(RouterLinkStub)[index];
      expect(routerLink.props().to).toEqual({
        name: 'IssueEdit',
        params: { issueId: issue.id }, // <-- fixed param name
      });
    });
  });
});
