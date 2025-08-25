import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../../test/mocks/handlers';
import { taskService, type CreateTaskBody, type ModifyTaskBody, StatusValues } from '../../src/services/TaskService';


const server = setupServer(...handlers);

describe('TaskService with MSW', () => {
  const projectId = 'test-project';
  const taskId = 'test-task';

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('getTasks returns a list of tasks', async () => {
    const taskList = await taskService.getTasks(projectId);
    expect(taskList.tasks.length).toBeGreaterThan(0);
    expect(taskList.tasks[0]).toHaveProperty('id');
    expect(taskList.tasks[0]).toHaveProperty('title');
  });

  test('getTask returns a single task', async () => {
    const task = await taskService.getTask(projectId, taskId);
    expect(task.id).toBe(taskId);
    expect(task.title).toBeDefined();
    expect(task.status).toBeDefined();
  });

  test('createTask returns the newly created task', async () => {
    const newTask: CreateTaskBody = {
      title: 'New Task',
      description: 'New Description',
      status: StatusValues.OPEN,
      ownerId: 'owner1',
    };
    const createdTask = await taskService.createTask(projectId, newTask);
    expect(createdTask.id).toBeDefined();
    expect(createdTask.title).toBe('New Task');
    expect(createdTask.status).toBe(StatusValues.OPEN);
  });

  test('modifyTask returns the updated task', async () => {
    const updates: ModifyTaskBody = {
      title: 'Updated Task',
      description: 'Updated Description',
    };
    const modifiedTask = await taskService.modifyTask(projectId, taskId, updates);
    expect(modifiedTask.id).toBe(taskId);
    expect(modifiedTask.title).toBe('Updated Task');
    expect(modifiedTask.description).toBe('Updated Description');
  });
});
