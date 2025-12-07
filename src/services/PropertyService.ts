import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

/** -------------------- TYPES & UTILS -------------------- **/

// Backend-driven types for properties and tree nodes
export type PropertyUnit = ApiComponents['schemas']['PropertyJson'];
export type PropertyList = ApiComponents['schemas']['PropertyListJson'];
export type RentableUnitTreeNode = ApiComponents['schemas']['RentalUnitTreeNodeJson'];
export type RentalUnitNodeData = ApiComponents['schemas']['RentalUnitNodeDataJson'];
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
  async createProperty(projectId: string, property: PropertyUnit): Promise<PropertyUnit> {
    return apiClient.post(
      '/api/v1/projects/{projectId}/properties',
      property,
      {pathParams: { projectId },},
    ) as Promise<PropertyUnit>;
  }

  async getPropertyTree(projectId: string): Promise<PropertyList> {
    return apiClient.get('/api/v1/projects/{projectId}/properties', {pathParams: { projectId },});
  }

  async getProperty(projectId: string, propertyId: string): Promise<PropertyUnit> {
    return apiClient.get('/api/v1/projects/{projectId}/properties/{propertyId}', {pathParams: { projectId, propertyId },});
  }

  async updateProperty(projectId: string, propertyId: string, property: PropertyUnit): Promise<PropertyUnit> {
    return apiClient.patch(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      property,
      {pathParams: { projectId, propertyId },},
    );
  }

  async deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return apiClient.delete('/api/v1/projects/{projectId}/properties/{propertyId}', {pathParams: { projectId, propertyId },});
  }

  async getBreadcrumbPath(projectId: string, targetNodeId: string): Promise<{ title: string; id: string; type: UnitType }[]> {
    try {
      // 1. Wir holen den ganzen Baum (da wir die Parents sonst nicht kennen)
      const data = await this.getPropertyTree(projectId);
      const tree = data.properties as RentableUnitTreeNode[];

      // 2. Rekursive Suchfunktion
      const findPath = (
        nodes: RentableUnitTreeNode[],
        targetId: string,
        currentPath: RentableUnitTreeNode[]
      ): RentableUnitTreeNode[] | null => {
        for (const node of nodes) {
          // Treffer? Pfad zurückgeben + aktuellen Node
          if (node.key === targetId) {
            return [...currentPath, node];
          }
          // Hat Kinder? Rekursiv weitersuchen
          if (node.children && node.children.length > 0) {
            const found = findPath(node.children, targetId, [...currentPath, node]);
            if (found) return found;
          }
        }
        return null; // Nichts gefunden in diesem Ast
      };

      // 3. Suche starten
      const resultNodes = findPath(tree, targetNodeId, []);
      
      if (!resultNodes) return [];

      // 4. Mapping auf einfaches Format für die Breadcrumbs
      return resultNodes.map(node => ({
        title: node.data?.title || 'Unbenannt',
        id: node.key,
        type: node.data?.type as UnitType
      }));

    } catch (e) {
      console.error('Breadcrumb calculation failed', e);
      return [];
    }
  }
}

export const propertyService = new PropertyService();
