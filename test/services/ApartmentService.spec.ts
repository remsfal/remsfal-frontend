import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { apartmentService, type Apartment } from '@/services/ApartmentService';

const mockApartment: Apartment = {
  id: 'apartment-1',
  title: 'Apartment 101',
  location: 'First Floor',
  description: 'Spacious apartment with balcony',
  usableSpace: 85,
  livingSpace: 75,
  heatingSpace: 70,
  rooms: 3,
};

const handlers = [
  http.post('/api/v1/projects/:projectId/buildings/:buildingId/apartments', async ({ request }) => {
    const body = (await request.json()) as Apartment;
    return HttpResponse.json(
      {
        ...body,
        id: 'new-apartment-id',
      },
      { status: 201 },
    );
  }),
  http.get('/api/v1/projects/:projectId/apartments/:apartmentId', ({ params }) => {
    if (params.apartmentId === 'not-found') {
      return HttpResponse.json({ message: 'Apartment not found' }, { status: 404 });
    }
    return HttpResponse.json({
      ...mockApartment,
      id: params.apartmentId,
    });
  }),
  http.patch('/api/v1/projects/:projectId/apartments/:apartmentId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Apartment>;
    return HttpResponse.json({
      ...mockApartment,
      ...body,
      id: params.apartmentId,
    });
  }),
  http.delete('/api/v1/projects/:projectId/apartments/:apartmentId', ({ params }) => {
    if (params.apartmentId === 'cannot-delete') {
      return HttpResponse.json({ message: 'Cannot delete' }, { status: 403 });
    }
    return HttpResponse.json({}, { status: 204 });
  }),
];

const server = setupServer(...handlers);

describe('ApartmentService', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('createApartment', () => {
    it('should create a new apartment', async () => {
      const newApartment: Apartment = {
        title: 'New Apartment',
        location: 'Second Floor',
        description: 'Modern apartment',
        usableSpace: 90,
        livingSpace: 80,
        heatingSpace: 75,
        rooms: 3,
      };

      const result = await apartmentService.createApartment('project-1', 'building-1', newApartment);
      expect(result.id).toBe('new-apartment-id');
      expect(result.title).toBe('New Apartment');
      expect(result.location).toBe('Second Floor');
    });

    it('should handle creation errors', async () => {
      server.use(
        http.post('/api/v1/projects/:projectId/buildings/:buildingId/apartments', () => {
          return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
        }),
      );

      await expect(
        apartmentService.createApartment('project-1', 'building-1', mockApartment),
      ).rejects.toThrow();
    });
  });

  describe('getApartment', () => {
    it('should fetch a single apartment', async () => {
      const result = await apartmentService.getApartment('project-1', 'apartment-1');
      expect(result.id).toBe('apartment-1');
      expect(result.title).toBe('Apartment 101');
    });

    it('should handle 404 error', async () => {
      await expect(apartmentService.getApartment('project-1', 'not-found')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/v1/projects/:projectId/apartments/:apartmentId', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        }),
      );

      await expect(apartmentService.getApartment('project-1', 'apartment-1')).rejects.toThrow();
    });
  });

  describe('updateApartment', () => {
    it('should update an apartment', async () => {
      const updates: Apartment = {
        ...mockApartment,
        title: 'Updated Apartment',
        usableSpace: 95,
      };

      const result = await apartmentService.updateApartment('project-1', 'apartment-1', updates);
      expect(result.title).toBe('Updated Apartment');
      expect(result.usableSpace).toBe(95);
    });

    it('should handle partial updates', async () => {
      const partialUpdate: Apartment = {title: 'Only Title Updated',};

      const result = await apartmentService.updateApartment('project-1', 'apartment-1', partialUpdate);
      expect(result.title).toBe('Only Title Updated');
    });

    it('should handle update errors', async () => {
      server.use(
        http.patch('/api/v1/projects/:projectId/apartments/:apartmentId', () => {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
        }),
      );

      await expect(
        apartmentService.updateApartment('project-1', 'apartment-1', mockApartment),
      ).rejects.toThrow();
    });
  });

  describe('deleteApartment', () => {
    it('should delete an apartment successfully', async () => {
      const result = await apartmentService.deleteApartment('project-1', 'apartment-1');
      expect(result).toBe(true);
    });

    it('should return false on deletion failure', async () => {
      const result = await apartmentService.deleteApartment('project-1', 'cannot-delete');
      expect(result).toBe(false);
    });

    it('should return false on network errors', async () => {
      server.use(
        http.delete('/api/v1/projects/:projectId/apartments/:apartmentId', () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        }),
      );

      const result = await apartmentService.deleteApartment('project-1', 'apartment-1');
      expect(result).toBe(false);
    });
  });
});
