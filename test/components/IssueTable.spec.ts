import { describe, it, expect, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueTable from '../../src/components/IssueTable.vue';
import DataTable from 'primevue/datatable';
import { type IssueItem } from '../../src/services/IssueService';

const mockIssues: IssueItem[] = [
  {
 id: '1', title: 'Issue 1', owner: 'user1', status: 'OPEN', name: 'issue1' 
},
  {
 id: '2', title: 'Issue 2', owner: 'user2', status: 'CLOSED', name: 'issue2' 
},
  {
 id: '3', title: 'Issue 3', owner: 'user3', status: 'IN_PROGRESS', name: 'issue3' 
},
];

describe('IssueTable', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(IssueTable, { props: { issues: mockIssues } });
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

  it('emits rowSelect event when row is selected', async () => {
    const dataTable = wrapper.findComponent(DataTable);
    
    // Simulate row selection
    await dataTable.vm.$emit('rowSelect', { data: mockIssues[0] });
    
    // Check that the event was emitted
    expect(wrapper.emitted('rowSelect')).toBeTruthy();
    expect(wrapper.emitted('rowSelect')?.[0]).toEqual([mockIssues[0]]);
  });
});
