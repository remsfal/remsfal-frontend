import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../../test/mocks/handlers'; 
import { commercialService } from '../../src/services/CommercialService';

const server = setupServer(...handlers);

describe('CommercialService with MSW', () => {
  const projectId = 'project-1';
  const buildingId = 'building-1';
  const commercialId = 'commercial-1';

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('getCommercial returns commercial data', async () => {
    const commercial = await commercialService.getCommercial(projectId, commercialId);
    expect(commercial).toEqual({
      id: commercialId,
      title: 'Commercial Space 1',
      location: 'Downtown',
      description: 'A spacious commercial area',
      commercialSpace: 100,
      usableSpace: 80,
      heatingSpace: 60,
    });
  });

  test('createCommercial returns newly created commercial', async () => {
    const newCommercial = {
      title: 'New Commercial',
      location: 'Midtown',
      description: 'Test description',
      commercialSpace: 50,
      usableSpace: 40,
      heatingSpace: 30,
    };

    const created = await commercialService.createCommercial(projectId, buildingId, newCommercial);
    expect(created).toMatchObject({
      id: 'commercial-new-id',
      ...newCommercial,
    });
  });

  test('updateCommercial returns updated commercial', async () => {
    const updates = { title: 'Updated Title', usableSpace: 75 };

    const updated = await commercialService.updateCommercial(projectId, commercialId, updates);
    expect(updated).toMatchObject({
      id: commercialId,
      ...updates,
    });
  });

  test('deleteCommercial succeeds', async () => {
    await expect(commercialService.deleteCommercial(projectId, commercialId)).resolves.toBeUndefined();
  });
});
