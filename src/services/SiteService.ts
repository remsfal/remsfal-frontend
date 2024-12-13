import type {AddressItem} from "@/services/ProjectService";
import axios from 'axios';

export interface SiteItem {
    id?: string;
    propertyId: string;
    address: AddressItem;
    title: string;
    description: string;
    usableSpace: number;
}

export default class SiteService {
    private readonly url: string = '/api/v1/projects';

    createSite(projectId: string, propertyId: string, site: SiteItem) {
        return axios
            .post(`${this.url}/${projectId}/properties/${propertyId}/sites`, site)
            .then((response) => console.log(response))
            .catch((error) => {
                console.error(error);
                throw new Error('Creation error');
            });
    }

    getSites(projectId: string, propertyId: string) {
        return axios
            .get(`${this.url}/${projectId}/properties/${propertyId}/sites`)
            .then((response) => {
                console.log('properties returned', response.data);
                return response.data;
            })
            .catch((error) => {
                console.error(error);
                throw new Error('Retrieval error');
            });
    }

    getSite(projectId: string, siteId: string, propertyId?: string) {
        if (propertyId) {
            return axios
                .get(`${this.url}/${projectId}/properties/${propertyId}/sites/${siteId}`)
                .then((response) => {
                    console.log('site returned', response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.error(error);
                    throw new Error('Site retrieval error');
                });
        } else {
            return axios
                .get(`${this.url}/${projectId}/sites/${siteId}`)
                .then((response) => {
                    console.log('site returned', response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.error(error);
                    throw new Error('Site retrieval error');
                });
        }
    }

    updateSite(projectId: string, siteId: string, site: SiteItem, propertyId?: string) {
        if (propertyId) {
            return axios
                .patch(`${this.url}/${projectId}/properties/${propertyId}/sites/${siteId}`, site)
                .then((response) => {
                    console.log('site updated', response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.error(error);
                    throw new Error('Update error');
                });        } else {
            return axios
                .patch(`${this.url}/${projectId}/sites/${siteId}`, site)
                .then((response) => {
                    console.log('site updated', response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.error(error);
                    throw new Error('Update error');
                });
        }
    }

    deleteSite(projectId: string, siteId: string, propertyId?: string) {
        if (propertyId) {
            return axios
                .delete(`${this.url}/${projectId}/properties/${propertyId}/sites/${siteId}`)
                .then((response) => {
                    console.log('site deleted', response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.error(error);
                    throw new Error('Deletion error');
                });
        } else {
            return axios
                .delete(`${this.url}/${projectId}/sites/${siteId}`)
                .then((response) => {
                    console.log('site deleted', response.data);
                    return response.data;
                })
                .catch((error) => {
                    console.error(error);
                    throw new Error('Deletion error');
                });
        }
    }
}