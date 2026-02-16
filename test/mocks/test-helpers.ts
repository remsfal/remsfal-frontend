// Used in tests to capture the last request data for each entity.
// This object allows test assertions to verify the payloads sent to mock handlers.
export const lastRequests: Record<string, Record<string, unknown> | null> = {
  property: null,
  tenancy: null,
  apartment: null,
  createdCommercial: null,
  updatedCommercial: null,
  createdSite: null,
  updatedSite: null,
  createdTask: null,
  updatedTask: null,
};
