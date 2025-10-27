import { typedRequest } from '../../src/services/api/typedRequest';
import type { components } from '../../src/services/api/platform-schema';

type TaskItemJson = components['schemas']['TaskItemJson'];
type TaskListJson = components['schemas']['TaskListJson'];

export default class ContractorService {
  private readonly baseUrl: string = '/api/v1/contractors';

  async getTasks(): Promise<TaskListJson> {
    const response = await typedRequest<any, 'get'>('get', `${this.baseUrl}/tasks`);
    console.log('GET tasks:', response);
    return response as TaskListJson; // temporary until OpenAPI spec is updated
  }

  async getTask(taskId: string): Promise<TaskItemJson> {
    const response = await typedRequest<any, 'get'>('get', `${this.baseUrl}/tasks/${taskId}`);
    console.log('GET task by ID:', response);
    return response as TaskItemJson; // temporary until OpenAPI spec is updated
  }
}
export const contractorService = new ContractorService();
