import axios from 'axios'

export default class ProjectService {

    createProject(title) {
        return axios
            .post('http://localhost:8080/api/v1/projects', {
                project_title: name
            })
            .then((response) => console.log(response))
    }
}