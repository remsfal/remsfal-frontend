import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { commercialService, type CommercialUnit } from '../../src/services/CommercialService';
import { VueWrapper } from '@vue/test-utils';

vi.mock('axios');

describe('CommercialService', () => {
  let wrapper: VueWrapper;

  const mockProjectId = 'project123';
  const mockBuildingId = 'building123';
  const mockCommercialId = 'commercial123';
  const mockPropertyId = 'property123';

  const mockCommercial: CommercialUnit = {
    title: 'Commercial Space 1',
    location: 'Downtown',
    description: 'A spacious commercial area',
    commercialSpace: 100,
    usableSpace: 80,
    heatingSpace: 60,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCommercial', () => {
    it('should create a commercial item without propertyId', async () => {
      const mockResponse = { data: { success: true } };
      (axios.post as vi.Mock).mockResolvedValue(mockResponse);

      await commercialService.createCommercial(mockProjectId, mockBuildingId, mockCommercial);

      expect(axios.post).toHaveBeenCalledWith(
        `/api/v1/projects/${mockProjectId}/buildings/${mockBuildingId}/commercials`,
        mockCommercial,
      );
    });
  });

  describe('getCommercial', () => {
    it('should get a commercial item with propertyId and buildingId', async () => {
      const mockResponse = { data: mockCommercial };
      (axios.get as vi.Mock).mockResolvedValue(mockResponse);

      const result = await commercialService.getCommercial(mockProjectId, mockCommercialId);

      expect(axios.get).toHaveBeenCalledWith(
        `/api/v1/projects/${mockProjectId}/commercials/${mockCommercialId}`,
      );
      expect(result).toEqual(mockCommercial);
    });

    it('should get a commercial item without propertyId and buildingId', async () => {
      const mockResponse = { data: mockCommercial };
      (axios.get as vi.Mock).mockResolvedValue(mockResponse);

      const result = await commercialService.getCommercial(mockProjectId, mockCommercialId);

      expect(axios.get).toHaveBeenCalledWith(
        `/api/v1/projects/${mockProjectId}/commercials/${mockCommercialId}`,
      );
      expect(result).toEqual(mockCommercial);
    });
  });

  describe('updateCommercial', () => {
    it('should update a commercial item with propertyId and buildingId', async () => {
      const mockResponse = { data: { ...mockCommercial, title: 'Updated Commercial' } };
      (axios.patch as vi.Mock).mockResolvedValue(mockResponse);

      const result = await commercialService.updateCommercial(
        mockProjectId,
        mockCommercialId,
        mockCommercial,
      );

      expect(axios.patch).toHaveBeenCalledWith(
        `/api/v1/projects/${mockProjectId}/commercials/${mockCommercialId}`,
        mockCommercial,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should update a commercial item without propertyId and buildingId', async () => {
      const mockResponse = { data: { ...mockCommercial, title: 'Updated Commercial' } };
      (axios.patch as vi.Mock).mockResolvedValue(mockResponse);

      const result = await commercialService.updateCommercial(
        mockProjectId,
        mockCommercialId,
        mockCommercial,
      );

      expect(axios.patch).toHaveBeenCalledWith(
        `/api/v1/projects/${mockProjectId}/commercials/${mockCommercialId}`,
        mockCommercial,
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteCommercial', () => {
    it('should delete a commercial item with propertyId and buildingId', async () => {
      const mockResponse = { data: { success: true } };
      (axios.delete as vi.Mock).mockResolvedValue(mockResponse);

      await commercialService.deleteCommercial(
        mockProjectId,
        mockCommercialId,
      );

      expect(axios.delete).toHaveBeenCalledWith(
        `/api/v1/projects/${mockProjectId}/commercials/${mockCommercialId}`,
      );
    });

    it('should delete a commercial item without propertyId and buildingId', async () => {
      const mockResponse = { data: { success: true } };
      (axios.delete as vi.Mock).mockResolvedValue(mockResponse);

      await commercialService.deleteCommercial(mockProjectId, mockCommercialId);

      expect(axios.delete).toHaveBeenCalledWith(
        `/api/v1/projects/${mockProjectId}/commercials/${mockCommercialId}`,
      );
    });
  });
});
