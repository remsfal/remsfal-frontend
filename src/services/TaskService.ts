import axios from "axios";
import type {Project} from "@/services/ProjectService";
import type {Ref} from "vue";
import type {RouteLocationNormalizedLoaded, RouteParamValue} from "vue-router";

export interface Task {
    id: string;
    title: string;
    description: String;
    status: Status;
    ownerId: string;
    created_at: Date;
    modified_at: Date;
    blocked_by: string;
    duplicate_of: string;
    related_to: string;
}

export enum Status {
    PENDING,
    OPEN,
    IN_PROGRESS,
    CLOSED,
    REJECTED
}

export interface TaskList {
    tasks: TaskItem[];
}

export interface TaskItem {
    id: string;
    name: string;
    title: string
    status: Status;
    owner: string;
}

export default class TaskService {
    readonly baseUrl: string = "/api/v1/projects";

    //Get a list of tasks
    getTasks(projectId: number): Promise<TaskList> {
        return axios
            .get(`${this.baseUrl}/${projectId}/tasks`)
            .then((response) => {
                const tasktList: TaskList = response.data;
                console.log("GET tasks:", tasktList);
                return tasktList;
            });
    }

    //Get a single task
    getTask(projectId: string, taskId: string) {
        return axios
            .get(`${this.baseUrl}/${projectId}/tasks/${taskId}`)
            .then((response) => {
                console.log("task returned", response.data);
                return response.data;
            })
            .catch((error) => {
                console.log("task retrieval error", error.request.status);

                console.error(error.request.status);
                throw error.request.status; // This will allow error to be caught where getTask is called
            });
    }

    //Create a task
    createTask(projectId: string | RouteParamValue[], title: string): Promise<Project> {
        return axios
            .post(
                `${this.baseUrl}/${projectId}/tasks/`,
                {title: title},
            )
            .then((response) => {
                const task: Task = response.data;
                console.log("POST create task:", task);
                return task;
            });
    }

    //modify a task
    modifyTask(projectId: string, taskId: string, title: string, description: string) {
        return axios
            .patch(
                `${this.baseUrl}/${projectId}/tasks/${taskId}`,
                {title: title, description: description}
            )
            .then((response) => {
                console.log("task updated", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

}