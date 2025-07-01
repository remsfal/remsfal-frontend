export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  period: string;
  price: number;
  deposit: number;
  extraCosts: number;
  email: string;
}

export const currentTenants: Tenant[] = [
  {
    id: 1,
    firstName: 'Lena',
    lastName: 'Schneider',
    period: '01.06.2025 - 11.06.2025',
    price: 125,
    deposit: 10,
    extraCosts: 13,
    email: 'lena.schneider@example.com',
  },
];

export const formerTenants: Tenant[] = [
  {
    id: 2,
    firstName: 'Tobias',
    lastName: 'Keller',
    period: '01.01.2023 - 31.12.2024',
    price: 120,
    deposit: 10,
    extraCosts: 12,
    email: 'tobias.keller@example.com',
  },
  {
    id: 3,
    firstName: 'Miriam',
    lastName: 'Fischer',
    period: '01.01.2021 - 31.12.2023',
    price: 115,
    deposit: 9,
    extraCosts: 12,
    email: 'miriam.fischer@example.com',
  },
];