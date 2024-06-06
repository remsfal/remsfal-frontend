import axios from "axios";

export interface Project {
    id: string;
    title: string;
}

export interface ProjectList {
    first: number;
    size: number;
    total: number;
    projects: ProjectItem[];
}

export interface ProjectItem {
    id: string;
    name: string;
    memberRole: string;
}

export default class ProjectService {
    private readonly url: string = "/api/v1/projects";

    getProjects(): Promise<ProjectList> {
        return axios
            .get(`${this.url}`)
            .then((response) => {
                const projectList: ProjectList = response.data;
                console.log("GET projects:", projectList);
                return projectList;
            });
    }

    createProject(title: string): Promise<Project> {
        return axios
            .post(
                `${this.url}`,
                {title: title},
            )
            .then((response) => {
                const project: Project = response.data;
                console.log("POST create project:", project);
                return project;
            });
    }

    getProject(projectId: string) {
        return axios
            .get(`${this.url}/${projectId}`)
            .then((response) => {
                console.log("project returned", response.data);
                return response.data;
            })
            .catch((error) => {
                console.log("project retrieval error", error.request.status);

                console.error(error.request.status);
                throw error.request.status; // This will allow error to be caught where getProject is called
            });
    }

    getRole(projectId: string) {
        return axios
            .get(`${this.url}/${projectId}/role`)
            .then((response) => {
                console.log("role returned", response.data);
                return response.data;
            })
            .catch((error) => {
                console.log("role retrieval error", error.request.status);

                console.error(error.request.status);
                throw error.request.status; // This will allow error to be caught where getProject is called
            });
    }

    createProperty(title: string, projectId: string) {
        return axios
            .post(
                `${this.url}/${projectId}/properties`,
                {title: title, projectId: projectId}
            )
            .then((response) => console.log(response))
            .catch((error) => console.error(error));
    }

    getProperties(projectId: string) {
        return axios
            .get(`${this.url}/${projectId}/properties`)
            .then((response) => {
                console.log("properties returned", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    createSite(title: string, projectId: string, propertyId: string) {
        return axios
            .post(
                `${this.url}/${projectId}/properties/${propertyId}/sites`,
                {title: title, propertyId: propertyId}
            )
            .then((response) => console.log(response))
            .catch((error) => console.error(error));
    }

    getSites(projectId: string, propertyId: string) {
        return axios
            .get(`${this.url}/${projectId}/properties/${propertyId}/sites`)
            .then((response) => {
                console.log("properties returned", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    createBuilding(title: string, projectId: string, propertyId: string, siteId: string) {
        return axios
            .post(
                `${this.url}/${projectId}/properties/${propertyId}/buildings`,
                {title: title, propertyId: propertyId}
            )
            .then((response) => console.log(response))
            .catch((error) => console.error(error));
    }

    getBuildings(projectId: string, propertyId: string, siteId: string) {
        return axios
            .get(`${this.url}/${projectId}/properties/${propertyId}/buildings`)
            .then((response) => {
                console.log("properties returned", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    createApartment(title: string, projectId: string, propertyId: string, buildingId: string) {
        return axios
            .post(
                `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/apartments`,
                {title: title, buildingId: buildingId}
            )
            .then((response) => console.log(response))
            .catch((error) => console.error(error));
    }

    getApartments(projectId: string, propertyId: string, buildingId: string) {
        return axios
            .get(`${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/apartments`)
            .then((response) => {
                console.log("properties returned", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    createGarage(title: string, projectId: string, propertyId: string, buildingId: string) {
        return axios
            .post(
                `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/garages`,
                {title: title, buildingId: buildingId}
            )
            .then((response) => console.log(response))
            .catch((error) => console.error(error));
    }

    getGarages(projectId: string, propertyId: string, buildingId: string) {
        return axios
            .get(`${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/garages`)
            .then((response) => {
                console.log("properties returned", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    getMembers(projectId: string) {
        return axios
            .get(`${this.url}/${projectId}/members`)
            .then((response) => {
                console.log("properties returned", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    updateMember(projectId: string, memberId: string, role: string, email: string) {
        return axios
            .patch(
                `${this.url}/${projectId}/members/${memberId}`,
                {role: role, id: memberId, email: email}
            )
            .then((response) => {
                console.log("member updated", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    deleteMember(projectId: string, memberId: string) {
        console.log("deleteProjectMember", projectId, memberId);
        return axios
            .delete(`${this.url}/${projectId}/members/${memberId}`)
            .then((response) => {
                console.log("member deleted");
                return response.data;
            })
            .catch((error) => console.error(error));
    }

    addMember(projectId: string, email: string, role: string) {
        console.log("addMember", projectId);

        const payload = {
            email: email,
            role: role,
        };

        return axios
            .post(`${this.url}/${projectId}/members`, payload,)
            .then((response) => {
                console.log("member added", response.data);
                return response.data;
            })
            .catch((error) => console.error(error));
    }
}
