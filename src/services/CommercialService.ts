// src/services/CommercialService.ts
import { typedRequest } from './api/typedRequest';
import type { paths, components } from './api/platform-schema';

function apiPath<P extends keyof paths>(path: P): P {
  return path;
}

export type CommercialJson = components['schemas']['CommercialJson'];

export type CreateCommercialRequest =
  paths['/api/v1/projects/{projectId}/buildings/{buildingId}/commercials']['post']['requestBody']['content']['application/json'];

export type CommercialUnit =
  paths['/api/v1/projects/{projectId}/commercials/{commercialId}']['patch']['requestBody']['content']['application/json'];

export const commercialService = {
  createCommercial: (
    projectId: string,
    buildingId: string,
    commercial: CreateCommercialRequest,
  ): Promise<CommercialJson> =>
    typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/commercials',
      'post',
      CommercialJson
    >('post', apiPath('/api/v1/projects/{projectId}/buildings/{buildingId}/commercials'), {
      pathParams: { projectId, buildingId },
      body: commercial,
    }),

  getCommercial: (projectId: string, commercialId: string): Promise<CommercialJson> =>
    typedRequest<'/api/v1/projects/{projectId}/commercials/{commercialId}', 'get', CommercialJson>(
      'get',
      apiPath('/api/v1/projects/{projectId}/commercials/{commercialId}'),
      {
        pathParams: { projectId, commercialId },
      },
    ),

  updateCommercial: (
    projectId: string,
    commercialId: string,
    commercial: CommercialUnit,
  ): Promise<CommercialJson> =>
    typedRequest<
      '/api/v1/projects/{projectId}/commercials/{commercialId}',
      'patch',
      CommercialJson
    >('patch', apiPath('/api/v1/projects/{projectId}/commercials/{commercialId}'), {
      pathParams: { projectId, commercialId },
      body: commercial,
    }),

  deleteCommercial: (projectId: string, commercialId: string): Promise<void> =>
    typedRequest<'/api/v1/projects/{projectId}/commercials/{commercialId}', 'delete', void>(
      'delete',
      apiPath('/api/v1/projects/{projectId}/commercials/{commercialId}'),
      {
        pathParams: { projectId, commercialId },
      },
    ),
};
