import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server'; // your MSW server setup
import { commercialService, type CommercialUnit } from '../../src/services/CommercialService';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CommercialService (MSW with http)', () => {
  const mockProjectId = 'project123';
  const mockBuildingId = 'building123';
  const mockCommercialId = 'commercial123';

  const mockCommercial: CommercialUnit = {
    title: 'Commercial Space 1',
    location: 'Downtown',
    description: 'A spacious commercial area',
    commercialSpace: 100,
    usableSpace: 80,
    heatingSpace: 60,
  };

  it('should create a commercial item', async () => {
    server.use(
      http.post(`/api/v1/projects/:projectId/buildings/:buildingId/commercials`, async ({ request }) => {
        const body = (await request.json()) as CommercialUnit;
        return HttpResponse.json({
          id: 'commercial-new-id',
          ...body,
        });
      }),
    );

    const result = await commercialService.createCommercial(mockProjectId, mockBuildingId, mockCommercial);

    expect(result).toMatchObject({
      id: 'commercial-new-id',
      title: mockCommercial.title,
      location: mockCommercial.location,
      description: mockCommercial.description,
      commercialSpace: mockCommercial.commercialSpace,
      usableSpace: mockCommercial.usableSpace,
      heatingSpace: mockCommercial.heatingSpace,
    });
  });

  it('should get a commercial item', async () => {
    server.use(
      http.get(`/api/v1/projects/:projectId/commercials/:commercialId`, ({ params }) => {
        return HttpResponse.json({
          id: params.commercialId,
          title: 'Commercial Space 1',
          location: 'Downtown',
          description: 'A spacious commercial area',
          commercialSpace: 100,
          usableSpace: 80,
          heatingSpace: 60,
        });
      }),
    );

    const result = await commercialService.getCommercial(mockProjectId, mockCommercialId);

    expect(result).toMatchObject({
      id: mockCommercialId,
      title: 'Commercial Space 1',
      location: 'Downtown',
      description: 'A spacious commercial area',
      commercialSpace: 100,
      usableSpace: 80,
      heatingSpace: 60,
    });
  });

  it('should update a commercial item', async () => {
    server.use(
      http.patch(`/api/v1/projects/:projectId/commercials/:commercialId`, async ({ request, params }) => {
        const body = (await request.json()) as CommercialUnit;
        return HttpResponse.json({
          id: params.commercialId,
          ...body,
        });
      }),
    );

    const updatedCommercial = { ...mockCommercial, title: 'Updated Commercial' };
    const result = await commercialService.updateCommercial(mockProjectId, mockCommercialId, updatedCommercial);

    expect(result).toMatchObject({
      id: mockCommercialId,
      title: 'Updated Commercial',
      location: updatedCommercial.location,
    });
  });

  it('should delete a commercial item', async () => {
    server.use(
      http.delete(`/api/v1/projects/:projectId/commercials/:commercialId`, () => {
        return HttpResponse.json({ success: true }, { status: 200 });
      }),
    );

    await expect(commercialService.deleteCommercial(mockProjectId, mockCommercialId)).resolves.toBeUndefined();
  });
});
