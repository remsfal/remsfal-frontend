export type TenantContractStatus = 'Active' | 'Expired';

export type TenantContractSummary = {
  id: string;
  address: string;
  leaseStart: string;
  leaseEnd: string;
  status: TenantContractStatus;
};

export type TenantContractDetail = TenantContractSummary & {
  monthlyRent: number;
  deposit: number;
  landlord: string;
  documents: { label: string; url: string }[];
};

class TenantContractService {
  async listContracts(): Promise<TenantContractSummary[]> {
    const response = await fetch('/api/tenant/contracts');
    if (!response.ok) {
      throw new Error('Failed to load contracts');
    }
    return response.json();
  }

  async getContract(contractId: string): Promise<TenantContractDetail> {
    const response = await fetch(`/api/tenant/contracts/${contractId}`);
    if (!response.ok) {
      throw new Error('Failed to load contract');
    }
    return response.json();
  }
}

export const tenantContractService = new TenantContractService();

