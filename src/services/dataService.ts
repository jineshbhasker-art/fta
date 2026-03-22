import { VATReturn, CorporateTaxReturn, Correspondence, Payment, Registration } from '../types';

export const dataService = {
  async getVATReturns(): Promise<VATReturn[]> {
    const response = await fetch('/api/vat_returns');
    if (!response.ok) return [];
    return response.json();
  },

  async getVATReturn(id: string): Promise<VATReturn | null> {
    const response = await fetch(`/api/vat_returns/${id}`);
    if (!response.ok) return null;
    return response.json();
  },

  async saveVATReturn(data: any) {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/vat_returns/${data.id}` : '/api/vat_returns';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to save VAT return');
    const result = await response.json();
    return result.id || data.id;
  },

  async deleteVATReturn(id: string) {
    const response = await fetch(`/api/vat_returns/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete VAT return');
  },

  async getPayments(): Promise<Payment[]> {
    const response = await fetch('/api/payments');
    if (!response.ok) return [];
    return response.json();
  },

  async getCorporateTaxReturns(): Promise<CorporateTaxReturn[]> {
    const response = await fetch('/api/corporate_tax_returns');
    if (!response.ok) return [];
    return response.json();
  },

  async saveCorporateTaxReturn(data: any) {
    const response = await fetch('/api/corporate_tax_returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to save corporate tax return');
    const result = await response.json();
    return result.id;
  },

  async deleteCorporateTaxReturn(id: string) {
    const response = await fetch(`/api/corporate_tax_returns/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete corporate tax return');
  },

  async getVATRefunds(): Promise<any[]> {
    // Note: VAT refunds are not yet implemented in server.ts, returning empty for now
    return [];
  },

  async getCorrespondence(): Promise<Correspondence[]> {
    const response = await fetch('/api/correspondence');
    if (!response.ok) return [];
    return response.json();
  },

  async getRegistrations(): Promise<Registration[]> {
    const response = await fetch('/api/registrations');
    if (!response.ok) return [];
    return response.json();
  }
};
