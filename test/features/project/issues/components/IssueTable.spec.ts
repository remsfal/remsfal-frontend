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
    expect(rows).toHaveLength(mockIssues.length);
  });

  it('displays correct data for each column, resolving assignee names', () => {
    const rows = wrapper.findAll('.p-datatable-tbody > tr');
    const cells0 = rows[0].findAll('td');
    const cells1 = rows[1].findAll('td');
    const cells2 = rows[2].findAll('td');

    expect(cells0[0].text()).toBe(mockIssues[0].title);
    expect(cells0[1].text()).toBe('John Doe'); // resolved from assigneeId 'user1'
    expect(cells0[2].text()).toBe('Offen'); // translated from status 'OPEN'

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

  it('renders columns in the order given by the columns prop', async () => {
    const customWrapper = mount(IssueTable, {
      props: {
        issues: mockIssues, projectId: 'project-123', columns: ['type', 'status', 'title']
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const headerTexts = customWrapper.findAll('th').map((th) => th.text());
    expect(headerTexts).toEqual(['Typ', 'Status', 'Titel']);
  });

  it('derives the issueNumber column from the last segment of the id', async () => {
    const issuesWithUuid: IssueItemJson[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000', title: 'Issue 1', name: 'issue1'
      },
    ];
    const customWrapper = mount(IssueTable, {
      props: {
        issues: issuesWithUuid, projectId: 'project-123', columns: ['issueNumber', 'title']
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const cells = customWrapper.findAll('.p-datatable-tbody > tr')[0].findAll('td');
    expect(cells[0].text()).toBe('426614174000');
  });

  it('renders status, type and priority as translated labels, not raw enum values', async () => {
    const issuesWithEnums: IssueItemJson[] = [
      {
        id: '1', title: 'Issue 1', name: 'issue1', status: 'OPEN', type: 'DEFECT', priority: 'HIGH'
      },
    ];
    const customWrapper = mount(IssueTable, {
      props: {
        issues: issuesWithEnums, projectId: 'project-123', columns: ['status', 'type', 'priority']
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const cells = customWrapper.findAll('.p-datatable-tbody > tr')[0].findAll('td');
    expect(cells[0].text()).toBe('Offen');
    expect(cells[1].text()).toBe('Mangel');
    expect(cells[2].text()).toBe('Hoch');
  });

  it('renders the modifiedAt column as a localized date', async () => {
    const issuesWithModifiedAt: IssueItemJson[] = [
      {
        id: '1', title: 'Issue 1', name: 'issue1', modifiedAt: '2024-03-15T10:00:00Z'
      },
    ];
    const customWrapper = mount(IssueTable, {
      props: {
        issues: issuesWithModifiedAt, projectId: 'project-123', columns: ['title', 'modifiedAt']
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const cells = customWrapper.findAll('.p-datatable-tbody > tr')[0].findAll('td');
    expect(cells[1].text()).toBe(new Date('2024-03-15T10:00:00Z').toLocaleDateString('de'));
  });
});
