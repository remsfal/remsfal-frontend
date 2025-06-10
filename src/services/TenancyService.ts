export interface TenantItem {
  id: string;
  firstName: string;
  lastName: string;
  unitTitle: string;
  rentalObject: string;
  rentalStart: Date;
  rentalEnd: Date;
}

export interface TenancyUnitItem {
  id: string;
  rentalObject: string;
  unitTitle: string;
}

export interface TenancyTenantItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TenancyItem {
  id: string;
  listOfTenants: TenancyTenantItem[];
  listOfUnits: TenancyUnitItem[];
  rentalStart: Date;
  rentalEnd: Date;
  active: boolean;
}

export default class TenancyService {
  generateMockTenantData(): TenantItem[] {
    return [
      {
        id: '1',
        firstName: 'Max',
        lastName: 'Mustermann',
        unitTitle: 'Wohnung 101',
        rentalObject: 'Wohnung',
        rentalStart: new Date('2020-01-01'),
        rentalEnd: new Date('2025-12-31'),
      },
      {
        id: '2',
        firstName: 'Erika',
        lastName: 'Musterfrau',
        unitTitle: 'Wohnung 202',
        rentalObject: 'Wohnung',
        rentalStart: new Date('2021-05-01'),
        rentalEnd: new Date('2026-04-30'),
      },
    ];
  }

  async fetchTenantData(): Promise<TenantItem[]> {
    // Hier könnte später ein API-Call eingefügt werden
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.generateMockTenantData());
      }, 500);
    });
  }

  generateMockTenancyData(): TenancyItem[] {
    return [
      {
        id: '1',
        listOfTenants: [
          { id: '1', firstName: 'Max', lastName: 'Mustermann', email: 'max.mustermann@sample.com' },
          {
            id: '2',
            firstName: 'Erika',
            lastName: 'Musterfrau',
            email: 'erika.musterfrau@sample.com',
          },
        ],
        listOfUnits: [
          { id: '1', rentalObject: 'Wohnung', unitTitle: 'Wohnung 101' },
          { id: '2', rentalObject: 'Wohnung', unitTitle: 'Wohnung 202' },
        ],
        rentalStart: new Date('2020-01-01'),
        rentalEnd: new Date('2024-12-31'),
        active: false,
      },
      {
        id: '2',
        listOfTenants: [
          { id: '3', firstName: 'Hans', lastName: 'Schmidt', email: 'hans.schmidt@sample.com' },
        ],
        listOfUnits: [{ id: '3', rentalObject: 'Wohnung', unitTitle: 'Wohnung 303' }],
        rentalStart: new Date('2021-05-01'),
        rentalEnd: new Date('2026-04-30'),
        active: true,
      },
    ];
  }

  loadMockTenancyData(id: string): TenancyItem | null {
    const tenancyData = this.generateMockTenancyData();
    return tenancyData.find((tenancy) => tenancy.id === id) || null;
  }

  async fetchTenancyData(): Promise<TenancyItem[]> {
    // Hier könnte später ein API-Call eingefügt werden
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.generateMockTenancyData());
      }, 500);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteTenancy(tenancyId: string): Promise<void> {
    // TODO: Implementieren
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateTenancyTenantItem(tenant: TenancyTenantItem): Promise<void> {
    // TODO: Implementieren
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateTenancyUnitItem(tenant: TenancyUnitItem): Promise<void> {
    // TODO: Implementieren
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createTenancy(tenancy: TenancyItem): Promise<void> {
    //TODO: Implementieren
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateTenancy(tenancy: TenancyItem | null): Promise<void> {
    //TODO: Implementieren
  }
}

export const tenancyService: TenancyService = new TenancyService();
