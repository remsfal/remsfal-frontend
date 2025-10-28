import {describe, it, expect, beforeEach} from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import TaskTable from '../../src/components/TaskTable.vue';
import DataTable from 'primevue/datatable';
import Button from 'primevue/button';
import { RouterLinkStub } from '@vue/test-utils';

// Mock task data
const mockTasks = [
  {
 id: 1, title: 'Task 1', owner: 'user1', status: 'OPEN' 
},
  {
 id: 2, title: 'Task 2', owner: 'user2', status: 'CLOSED' 
},
  {
 id: 3, title: 'Task 3', owner: 'user3', status: 'IN_PROGRESS' 
},
];

describe('TaskTable', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(TaskTable, {
      props: { tasks: mockTasks },
      global: { stubs: { RouterLink: RouterLinkStub } }, // Stub the RouterLink for testing
    });
  });

  it('renders the DataTable with tasks', () => {
    // Verify that the DataTable is rendered
    const dataTable = wrapper.findComponent(DataTable);
    expect(dataTable.exists()).toBe(true);

    // Check if the correct number of rows are rendered
    const rows = wrapper.findAll('.p-datatable-tbody > tr'); // Adjust selector if needed
    expect(rows.length).toBe(mockTasks.length);
  });

  it('displays correct data for each column', () => {
    const rows = wrapper.findAll('.p-datatable-tbody > tr');
    rows.forEach((row, index) => {
      const cells = row.findAll('td'); // Adjust selector for cells if needed
      expect(cells[0].text()).toBe(mockTasks[index].title); // Title column
      expect(cells[1].text()).toBe(mockTasks[index].owner); // Owner column
      expect(cells[2].text()).toBe(mockTasks[index].status); // Status column
    });
  });

  it('renders edit button with correct RouterLink', () => {
    const editButtons = wrapper.findAllComponents(Button);
    expect(editButtons.length).toBe(mockTasks.length);

    mockTasks.forEach((task, index) => {
      const routerLink = wrapper.findAllComponents(RouterLinkStub)[index];
      expect(routerLink.props().to).toEqual({
        name: 'TaskEdit',
        params: { taskid: task.id },
      });
    });
  });
});
