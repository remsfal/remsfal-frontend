import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueTable from '@/features/project/issues/components/IssueTable.vue';
import DataTable from 'primevue/datatable';
import { type IssueItemJson } from '@/services/IssueService';
import { type ProjectMemberListJson, projectMemberService } from '@/services/ProjectMemberService';
import { type OrganizationMemberListJson, organizationMemberService } from '@/services/OrganizationMemberService';

vi.mock('@/services/ProjectMemberService', { spy: true });
vi.mock('@/services/OrganizationMemberService', { spy: true });

const mockIssues: IssueItemJson[] = [
  {
    id: '1', title: 'Issue 1', assigneeId: 'user1', status: 'OPEN', name: 'issue1'
  },
  {
    id: '2', title: 'Issue 2', assigneeId: 'user2', status: 'CLOSED', name: 'issue2'
  },
  {
    id: '3', title: 'Issue 3', assigneeId: 'user3', status: 'IN_PROGRESS', name: 'issue3'
  },
];

describe('IssueTable', () => {
  let wrapper: VueWrapper;

  beforeEach(async () => {
    vi.spyOn(projectMemberService, 'getMembers').mockResolvedValue({
      members: [
        {
          id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'MANAGER' 
        },
        {
          id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'STAFF' 
        },
      ],
    } as ProjectMemberListJson);
    vi.spyOn(organizationMemberService, 'getOrganizations')
      .mockResolvedValue({ organizations: [] } as OrganizationMemberListJson);

    wrapper = mount(IssueTable, { props: { issues: mockIssues, projectId: 'project-123' } });

    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('renders the DataTable with issues', () => {
    const dataTable = wrapper.findComponent(DataTable);
    expect(dataTable.exists()).toBe(true);

    const rows = wrapper.findAll('.p-datatable-tbody > tr');
    expect(rows.length).toBe(mockIssues.length);
  });

  it('displays correct data for each column, resolving assignee names', () => {
    const rows = wrapper.findAll('.p-datatable-tbody > tr');
    const cells0 = rows[0].findAll('td');
    const cells1 = rows[1].findAll('td');
    const cells2 = rows[2].findAll('td');

    expect(cells0[0].text()).toBe(mockIssues[0].title);
    expect(cells0[1].text()).toBe('John Doe'); // resolved from assigneeId 'user1'
    expect(cells0[2].text()).toBe(mockIssues[0].status);

    expect(cells1[1].text()).toBe('Jane Smith'); // resolved from assigneeId 'user2'

    // No matching member for 'user3' -> falls back to the raw assigneeId
    expect(cells2[1].text()).toBe('user3');
  });

  it('emits rowSelect event when row is selected', async () => {
    const dataTable = wrapper.findComponent(DataTable);

    // Simulate row selection
    await dataTable.vm.$emit('rowSelect', { data: mockIssues[0] });

    // Check that the event was emitted
    expect(wrapper.emitted('rowSelect')).toBeTruthy();
    expect(wrapper.emitted('rowSelect')?.[0]).toEqual([mockIssues[0]]);
  });

  it('renders only the columns passed via the columns prop', async () => {
    const customWrapper = mount(IssueTable, {
      props: {
        issues: mockIssues, projectId: 'project-123', columns: ['title', 'priority'] 
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const headerTexts = customWrapper.findAll('th').map((th) => th.text());
    expect(headerTexts).toEqual(['Titel', 'Priorität']);
  });
});
