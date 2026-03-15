export type UserRole = 'corporate' | 'person' | 'agent' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  taxType: 'VAT' | 'Corporate Tax' | 'Excise Tax';
  trn: string;
  status: 'Active' | 'Pending' | 'Suspended';
  effectiveDate: string;
  entityName: string;
}

export interface VATReturn {
  id: string;
  userId: string;
  period: string;
  dueDate: string;
  status: 'Filed' | 'Draft' | 'Overdue';
  totalSales: number;
  totalVAT: number;
  netVAT: number;
  filedAt?: string;
}

export interface CorporateTaxReturn {
  id: string;
  userId: string;
  accountingPeriod: string;
  taxableIncome: number;
  taxAmount: number;
  status: 'Filed' | 'Draft' | 'Overdue';
  filedAt?: string;
  dueDate: string;
}

export interface Correspondence {
  id: string;
  userId: string;
  subject: string;
  type: 'Message' | 'Certificate' | 'NOC' | 'Audit';
  status: 'Unread' | 'Read' | 'Resolved';
  content: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: 'Paid' | 'Outstanding' | 'Processing';
  dueDate: string;
  paidAt?: string;
}
