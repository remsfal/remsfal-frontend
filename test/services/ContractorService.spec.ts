import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ContractorService, { TaskItemJson, TaskListJson } from '../../src/services/ContractorService';

describe('ContractorService', () => {
  const service = new ContractorService();
  const taskId = 'test-task';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get a list of tasks', async () => {
    const mockTasks: TaskItemJson[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'OPEN',
      },
    ];

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { tasks: mockTasks } });

    const taskList: TaskListJson = await service.getTasks();
    expect(taskList.tasks.length).toBe(1);
    expect(taskList.tasks[0].title).toBe('Task 1');
  });

  it('should get a single task', async () => {
    const mockTask: TaskItemJson = {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'OPEN',
    };

    vi.spyOn(axios, 'get').mockResolvedValue({ data: mockTask });

    const task: TaskItemJson = await service.getTask(taskId);
    expect(task.title).toBe('Task 1');
  });

  it('should handle task retrieval error', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue({
      request: { status: 404 },
    });

    try {
      await service.getTask(taskId);
    } catch (error) {
      expect(error).toBe(404);
    }
  });
});
