import axios from 'axios';

export interface TaskItemJson {
    id: string;
    title: string;
    status: TaskStatus;
    description: string | null;
}

export interface TaskListJson {
    tasks: TaskItemJson[];
}

export type TaskStatus = 'PENDING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';

export default class ContractorService {
    private readonly baseUrl: string = '/api/v1/contractors';

    getTasks(): Promise<TaskListJson> {
        const url = `${this.baseUrl}/tasks`;
        return axios.get(url).then((response) => {
          const taskList: TaskListJson = response.data;
          console.log('GET tasks:', taskList);
          return taskList;
        });
      }

      getTask(taskId:string): Promise<TaskItemJson> {
        const url = `${this.baseUrl}/tasks/${taskId}`;
        return axios
          .get(url)
          .then((response) => {
            const task: TaskItemJson = response.data
            console.log('GET task by ID', task);
            return task;
          })
          .catch((error) => {
            console.log('Task retrieval error', error.request.status);
            console.error(error.request.status);
            throw error.request.status;
          });
      }
}