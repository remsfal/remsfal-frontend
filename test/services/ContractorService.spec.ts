import {
 describe, it, expect, beforeAll, afterAll, afterEach 
} from 'vitest';
import ContractorService from '../../src/services/ContractorService';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ContractorService (MSW with http)', () => {
  const service = new ContractorService();
  const taskId = 'test-task';

  it('should get a list of tasks', async () => {
    // Mock GET /api/v1/contractors/tasks
    server.use(
      http.get('/api/v1/contractors/tasks', () => {
        return HttpResponse.json({
          tasks: [
            {
              id: taskId,
              title: 'Task 1',
              description: 'Description 1',
              status: 'OPEN',
            },
          ],
        });
      }),
    );

    const taskList = await service.getTasks();
    const tasks = taskList.tasks ?? []; // <-- safe default

    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[0].status).toBe('OPEN');
  });

  it('should get a single task', async () => {
    // Mock GET /api/v1/contractors/tasks/:taskId
    server.use(
      http.get('/api/v1/contractors/tasks/:taskId', (req) => {
        const { taskId } = req.params;
        if (taskId === 'test-task') {
          return HttpResponse.json({
            id: 'test-task',
            title: 'Task 1',
            description: 'Description 1',
            status: 'IN_PROGRESS',
          });
        }
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }),
    );

    const task = await service.getTask(taskId);

    expect(task.title).toBe('Task 1');
    expect(task.status).toBe('IN_PROGRESS');
  });

  it('should handle task retrieval error', async () => {
    // Mock 404 for any task ID
    server.use(
      http.get('/api/v1/contractors/tasks/:taskId', () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }),
    );

    await expect(service.getTask('non-existing')).rejects.toThrow();
  });
});
