import { typedRequest } from '@/services/api/typedRequest';

export interface TaskItemJson {
  id: string
  title: string
  status: TaskStatus
  description: string | null
}

export interface TaskListJson {
  tasks: TaskItemJson[]
}

export type TaskStatus = 'PENDING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';

export default class ContractorService {
  private readonly baseUrl: string = '/api/v1/contractors';

  async getTasks(): Promise<TaskListJson> {
    const response = await typedRequest<any, 'get'>(
      'get',
      `${this.baseUrl}/tasks`,
    );
    console.log('GET tasks:', response);
    return response as TaskListJson;
  }

  async getTask(taskId: string): Promise<TaskItemJson> {
    const response = await typedRequest<any, 'get'>(
      'get',
      `${this.baseUrl}/tasks/${taskId}`,
    );
    console.log('GET task by ID:', response);
    return response as TaskItemJson;
  }
}

export const contractorService = new ContractorService();
