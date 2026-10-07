import { describe, test, expect } from 'vitest';
import { clientService } from '@/features/contractor/customers/services/ClientService';

describe('ClientService with MSW', () => {
  test('getClients resolves with the projects and their billing data', async () => {
    const result = await clientService.getClients('org-123');
    expect(result.total).toBe(1);
    const project = result.projects[0]!;
    expect(project.title).toBe('Wohnanlage Musterstraße');
    expect(project.owner).toBe('WEG Musterstraße');
    expect(project.careOf).toBe('Test GmbH');
    expect(project.billingAddress?.city).toBe('Berlin');
  });
});
