import { apiClient, type ApiComponents } from '@/services/ApiClient';

/** -------------------- TYPES & UTILS -------------------- **/

export type PropertyJson = ApiComponents['schemas']['PropertyJson'];
export type PropertyListJson = ApiComponents['schemas']['PropertyListJson'];
export type RentalUnitTreeNodeJson = ApiComponents['schemas']['RentalUnitTreeNodeJson'];
export type UnitType = ApiComponents['schemas']['UnitType'];

export enum EntityType {
  Apartment = 'APARTMENT',
  Commercial = 'COMMERCIAL',
  Storage = 'STORAGE',
  Site = 'SITE',
  Building = 'BUILDING',
  Project = 'PROJECT',
  Property = 'PROPERTY',
}

export function toRentableUnitView(entity: UnitType | undefined): string {
  if (!entity) {
    return 'View';
  }
  return entity[0]!.toUpperCase() + entity.substring(1).toLowerCase() + 'View';
}

/** -------------------- SERVICE -------------------- **/

class PropertyService {
  async createProperty(projectId: string, property: PropertyJson): Promise<PropertyJson> {
    return apiClient.post(
      '/api/v1/projects/{projectId}/properties',
      property,
      { pathParams: { projectId } },
    ) as Promise<PropertyJson>;
  }

  async getPropertyTree(projectId: string): Promise<PropertyListJson> {
    return apiClient.get(
      '/api/v1/projects/{projectId}/properties',
      { pathParams: { projectId } },
    );
  }

  async getProperty(projectId: string, propertyId: string): Promise<PropertyJson> {
    return apiClient.get(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      { pathParams: { projectId, propertyId } },
    );
  }

  async updateProperty(projectId: string, propertyId: string, property: PropertyJson): Promise<PropertyJson> {
    return apiClient.patch(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      property,
      { pathParams: { projectId, propertyId } },
    ) as Promise<PropertyJson>;
  }

  async deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return apiClient.delete(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      { pathParams: { projectId, propertyId } },
    );
  }

/**
   * Calculates the breadcrumb path to a specific node ID.
   */
  async getBreadcrumbPath(
    projectId: string,
    targetNodeId: string,
  ): Promise<{ title: string; id: string; type: UnitType }[]> {
    try {
      const data = await this.getPropertyTree(projectId);
      const tree = (data.properties ?? []) as RentalUnitTreeNodeJson[];

      const findPath = (
        nodes: RentalUnitTreeNodeJson[],
        targetId: string,
        currentPath: RentalUnitTreeNodeJson[],
      ): RentalUnitTreeNodeJson[] | null => {
        for (const node of nodes) {
          if (node.key === targetId) {
            return [...currentPath, node];
          }
          if (node.children && node.children.length > 0) {
            const found = findPath(node.children, targetId, [...currentPath, node]);
            if (found) return found;
          }
        }
        return null;
      };

      const resultNodes = findPath(tree, targetNodeId, []);
      
      if (!resultNodes) return [];

      return resultNodes.map((node) => ({
        title: node.data?.title || 'Unbenannt',
        id: node.key,
        type: node.data?.type ?? EntityType.Property, 
      }));

    } catch (e) {
      console.error('Breadcrumb calculation failed', e);
      return [];
    }
  }

  async getParentId(projectId: string, childId: string): Promise<string | undefined> {
    try {
      const data = await this.getPropertyTree(projectId);
      const tree = (data.properties ?? []) as RentalUnitTreeNodeJson[];

      const findParent = (
        nodes: RentalUnitTreeNodeJson[],
        target: string,
        parent: string | undefined,
      ): string | undefined => {
        for (const node of nodes) {
          if (node.key === target) {
            return parent;
          }
          if (node.children && node.children.length > 0) {
            const found = findParent(node.children, target, node.key);
            if (found) return found;
          }
        }
        return undefined;
      };

      return findParent(tree, childId, undefined);
    } catch (e) {
      console.error('Fehler bei der Eltern-Suche:', e);
      return undefined;
    }
  }
}

export const propertyService = new PropertyService();