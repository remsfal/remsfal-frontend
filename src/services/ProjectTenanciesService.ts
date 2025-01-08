export interface TenantItem {
    id: string;
    firstName: string;
    lastName: string;
    unitTitle: string;
    rentalObject: string;
    rentalStart: Date;
    rentalEnd: Date;
}

class ProjectTenanciesService {
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
}

export default new ProjectTenanciesService();