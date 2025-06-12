import axios from 'axios';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  ownerId: string;
  createdAt: Date;
  modifiedAt: Date;
  blockedBy: string;
  duplicateOf: string;
  relatedTo: string;
}

export enum Status {
  PENDING,
  OPEN,
  IN_PROGRESS,
  CLOSED,
  REJECTED,
}

export interface TaskList {
  tasks: TaskItem[];
}

export interface TaskItem {
  id: string;
  name: string;
  title: string;
  status: Status;
  owner: string;
}

export default class TaskService {
  readonly baseUrl: string = '/api/v1/projects';

  //Get a list of tasks
  getTasks(projectId: string, status?: 'OPEN' | null, ownerId?: string): Promise<TaskList> {
    if (status) {
      return axios.get(`${this.baseUrl}/${projectId}/tasks?status=${status}`).then((response) => {
        const taskList: TaskList = response.data;
        console.log('GET tasks:', taskList);
        return taskList;
      });
    }
    if (ownerId) {
      return axios.get(`${this.baseUrl}/${projectId}/tasks?owner=${ownerId}`).then((response) => {
        const taskList: TaskList = response.data;
        console.log('GET tasks:', taskList);
        return taskList;
      });
    }

    return axios.get(`${this.baseUrl}/${projectId}/tasks`).then((response) => {
      const taskList: TaskList = response.data;
      console.log('GET tasks:', taskList);
      return taskList;
    });
  }
  //Get a single task
  getTask(projectId: string, taskId: string) {
    return axios
      .get(`${this.baseUrl}/${projectId}/tasks/${taskId}`)
      .then((response) => {
        console.log('task returned', response.data);
        return response.data;
      })
      .catch((error) => {
        console.log('task retrieval error', error.request.status);

        console.error(error.request.status);
        throw error.request.status; // This will allow error to be caught where getTask is called
      });
  }

  //Create a task
  createTask(
    projectId: string,
    title: string,
    description: string,
    ownerId?: string,
  ): Promise<Task> {
    const newTask: Partial<Task> = {
      title: title,
      description: description,
      status: Status.OPEN,
      ownerId: ownerId,
    };

    return axios.post<Task>(`${this.baseUrl}/${projectId}/tasks/`, newTask).then((response) => {
      const createdTask: Task = response.data;
      console.log('POST create task:', createdTask);
      return createdTask;
    });
  }

  //modify a task
  modifyTask(
    projectId: string,
    taskId: string,
    title: string,
    description: string,
    status: string,
    ownerId: string,
  ) {
    return axios
      .patch(`${this.baseUrl}/${projectId}/tasks/${taskId}`, {
        title: title,
        description: description,
        status: status,
        ownerId: ownerId,
      })
      .then((response) => {
        console.log('task updated', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }
}
export const taskService = new TaskService();
