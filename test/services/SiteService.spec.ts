import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import SiteService, { SiteItem } from '@/services/SiteService';

vi.mock('axios');

const mockedAxios = axios as vi.Mocked<typeof axios>;

const siteServiceSpec = new SiteService();

const projectId = 'project123';
const propertyId = 'property456';
const siteId = 'site789';

const mockSite: SiteItem = {
    propertyId: propertyId,
    address: {
        street: 'Main St',
        city: 'Sample City',
        zipCode: '12345',
    },
    title: 'New Site',
    description: 'A description of the new site.',
    usableSpace: 1000,
};

describe('SiteService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createSite', () => {
        it('should create a site successfully', async () => {
            mockedAxios.post.mockResolvedValue({ data: { id: siteId, ...mockSite } });

            await siteServiceSpec.createSite(projectId, propertyId, mockSite);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/properties/${propertyId}/sites`,
                mockSite
            );
        });

        it('should handle errors during site creation', async () => {
            mockedAxios.post.mockRejectedValue(new Error('Creation error'));
            await expect(siteServiceSpec.createSite(projectId, propertyId, mockSite)).rejects.toThrow('Creation error');
        });
    });

    describe('getSites', () => {
        it('should retrieve a list of sites successfully', async () => {
            const mockSites = [mockSite];
            mockedAxios.get.mockResolvedValue({ data: mockSites });

            const result = await siteServiceSpec.getSites(projectId, propertyId);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/properties/${propertyId}/sites`
            );
            expect(result).toEqual(mockSites);
        });

        it('should handle errors during retrieving sites', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Retrieval error'));
            await expect(siteServiceSpec.getSites(projectId, propertyId)).rejects.toThrow('Retrieval error');
        });
    });

    describe('getSite', () => {
        it('should retrieve a site with propertyId', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockSite });

            const result = await siteServiceSpec.getSite(projectId, siteId, propertyId);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`
            );
            expect(result).toEqual(mockSite);
        });

        it('should retrieve a site without propertyId', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockSite });

            const result = await siteServiceSpec.getSite(projectId, siteId);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/sites/${siteId}`
            );
            expect(result).toEqual(mockSite);
        });

        it('should handle errors during site retrieval', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Site retrieval error'));
            await expect(siteServiceSpec.getSite(projectId, siteId)).rejects.toThrow('Site retrieval error');
        });
    });

    describe('updateSite', () => {
        it('should update a site with propertyId', async () => {
            mockedAxios.patch.mockResolvedValue({ data: mockSite });

            const result = await siteServiceSpec.updateSite(projectId, siteId, mockSite, propertyId);
            expect(mockedAxios.patch).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`,
                mockSite
            );
            expect(result).toEqual(mockSite);
        });

        it('should update a site without propertyId', async () => {
            mockedAxios.patch.mockResolvedValue({ data: mockSite });

            const result = await siteServiceSpec.updateSite(projectId, siteId, mockSite);
            expect(mockedAxios.patch).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/sites/${siteId}`,
                mockSite
            );
            expect(result).toEqual(mockSite);
        });

        it('should handle errors during site update', async () => {
            mockedAxios.patch.mockRejectedValue(new Error('Update error'));
            await expect(siteServiceSpec.updateSite(projectId, siteId, mockSite)).rejects.toThrow('Update error');
        });
    });

    describe('deleteSite', () => {
        it('should delete a site with propertyId', async () => {
            mockedAxios.delete.mockResolvedValue({ data: {} });

            const result = await siteServiceSpec.deleteSite(projectId, siteId, propertyId);
            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/properties/${propertyId}/sites/${siteId}`
            );
            expect(result).toEqual({});
        });

        it('should delete a site without propertyId', async () => {
            mockedAxios.delete.mockResolvedValue({ data: {} });

            const result = await siteServiceSpec.deleteSite(projectId, siteId);
            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `/api/v1/projects/${projectId}/sites/${siteId}`
            );
            expect(result).toEqual({});
        });

        it('should handle errors during site deletion', async () => {
            mockedAxios.delete.mockRejectedValue(new Error('Deletion error'));
            await expect(siteServiceSpec.deleteSite(projectId, siteId)).rejects.toThrow('Deletion error');
        });
    });
});
