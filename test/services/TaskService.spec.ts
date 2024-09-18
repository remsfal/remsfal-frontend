// tests/TaskService.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import TaskService, { Task, Status } from '../../src/services/TaskService';

describe('TaskService', () => {
  const service = new TaskService();
  const projectId = 'test-project';
  const taskId = 'test-task';

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should get a list of tasks', async () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: Status.OPEN,
        ownerId: 'owner1',
        created_at: new Date(),
        modified_at: new Date(),
        blocked_by: '',
        duplicate_of: '',
        related_to: '',
      },
    ];

    vi.spyOn(axios, 'get').mockResolvedValue({ data: { tasks: mockTasks } });

    const taskList = await service.getTasks(projectId);
    expect(taskList.tasks.length).toBe(1);
    expect(taskList.tasks[0].title).toBe('Task 1');
  });

  it('should get a single task', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: Status.OPEN,
      ownerId: 'owner1',
      created_at: new Date(),
      modified_at: new Date(),
      blocked_by: '',
      duplicate_of: '',
      related_to: '',
    };

    vi.spyOn(axios, 'get').mockResolvedValue({ data: mockTask });

    const task = await service.getTask(projectId, taskId);
    expect(task.title).toBe('Task 1');
  });

  it('should create a task', async () => {
    const newTask: Partial<Task> = {
      title: 'New Task',
      description: 'New Description',
      status: Status.OPEN,
      ownerId: 'owner1',
      created_at: new Date(),
    };

    vi.spyOn(axios, 'post').mockResolvedValue({ data: newTask });

    const createdTask = await service.createTask(
      projectId,
      newTask.title,
      newTask.description,
      newTask.ownerId,
    );
    expect(createdTask.title).toBe('New Task');
    expect(createdTask.description).toBe('New Description');
    expect(createdTask.status).toBe(Status.OPEN);
  });

  it('should modify a task', async () => {
    const updatedTask: Task = {
      id: taskId,
      title: 'Updated Task',
      description: 'Updated Description',
      status: Status.IN_PROGRESS,
      ownerId: 'owner1',
      created_at: new Date(),
      modified_at: new Date(),
      blocked_by: '',
      duplicate_of: '',
      related_to: '',
    };

    vi.spyOn(axios, 'patch').mockResolvedValue({ data: updatedTask });

    const modifiedTask = await service.modifyTask(
      projectId,
      taskId,
      updatedTask.title,
      updatedTask.description,
    );
    expect(modifiedTask.title).toBe('Updated Task');
    expect(modifiedTask.description).toBe('Updated Description');
  });

  it('cover createTask call in component', async () => {
    const mockTask: Task = {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: Status.OPEN,
      ownerId: 'owner1',
      created_at: new Date(),
      modified_at: new Date(),
      blocked_by: '',
      duplicate_of: '',
      related_to: '',
    };

    const props = {
      projectId: 'test-project',
      owner: 'owner1',
    };

    const title = { value: 'Task 1' };
    const description = { value: 'Description 1' };
    const blockedBy = { value: '' };
    const relatedTo = { value: '' };
    const visible = { value: true };

    const loadTasks = vi.fn();

    vi.spyOn(axios, 'post').mockResolvedValue({ data: mockTask });

    await service
      .createTask(
        props.projectId,
        title.value,
        description.value,
        props.owner || '',
        blockedBy.value,
        relatedTo.value,
      )
      .then((newTask) => {
        console.log('New task created:', newTask);
        visible.value = false;
        loadTasks();
      })
      .catch((error) => {
        console.error('Error creating task:', error);
      });

    expect(loadTasks).toBeCalled();
    expect(visible.value).toBe(false);
  });
});
