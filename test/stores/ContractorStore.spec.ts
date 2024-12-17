import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ContractorService from '../../src/services/ContractorService';
import { useContractorStore } from '../../src/stores/ContractorStore';
import { TaskItemJson, TaskListJson } from '../../src/services/ContractorService';

describe('ContractorStore', () => {
  let contractorStore: ReturnType<typeof useContractorStore>;
  const ownerId = 'owner1';

  beforeEach(() => {
    setActivePinia(createPinia());
    contractorStore = useContractorStore();
    vi.resetAllMocks();
  });

  it('should fetch and set tasks correctly', async () => {
    const mockTasks: TaskItemJson[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'OPEN',
        ownerId: ownerId,
      },
    ];

    const mockTaskList: TaskListJson = { tasks: mockTasks };

    vi.spyOn(ContractorService.prototype, 'getTasks').mockResolvedValue(mockTaskList);

    await contractorStore.fetchProjects(ownerId);

    expect(contractorStore.tasks.length).toBe(1);
    expect(contractorStore.tasks[0].title).toBe('Task 1');
    expect(contractorStore.totalTasks).toBe(1);
  });

  it('should handle errors when fetching tasks', async () => {
    vi.spyOn(ContractorService.prototype, 'getTasks').mockRejectedValue(new Error('Failed to fetch tasks'));

    await contractorStore.fetchProjects(ownerId);

    expect(contractorStore.tasks.length).toBe(0);
    expect(contractorStore.totalTasks).toBe(0);
  });

  it('should set the selected task correctly', () => {
    const mockTask: TaskItemJson = {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'OPEN',
      ownerId: 'owner1',
    };

    contractorStore.setSelectedTask(mockTask);

    expect(contractorStore.selectedTask).toEqual(mockTask);
  });

  it('should refresh the task list correctly', async () => {
    const mockTasks: TaskItemJson[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'OPEN',
        ownerId: ownerId,
      },
    ];

    const mockTaskList: TaskListJson = { tasks: mockTasks };

    vi.spyOn(ContractorService.prototype, 'getTasks').mockResolvedValue(mockTaskList);

    await contractorStore.refreshTaskList(ownerId);

    expect(contractorStore.tasks.length).toBe(1);
    expect(contractorStore.tasks[0].title).toBe('Task 1');
    expect(contractorStore.totalTasks).toBe(1);
  });
});
