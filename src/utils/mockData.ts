import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const initializeMockData = async (userId: string) => {
  try {
    // Check if data already exists
    const q = query(collection(db, 'registrations'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) return;

    console.log('Initializing mock data for user:', userId);

    // Add Registrations
    await addDoc(collection(db, 'registrations'), {
      userId,
      taxType: 'VAT',
      trn: '100234567890003',
      status: 'Active',
      effectiveDate: '2024-01-12',
      entityName: 'Global Tech Solutions LLC'
    });

    await addDoc(collection(db, 'registrations'), {
      userId,
      taxType: 'Corporate Tax',
      trn: '200987654321001',
      status: 'Pending',
      effectiveDate: '2024-06-01',
      entityName: 'Global Tech Solutions LLC'
    });

    // Add VAT Returns
    await addDoc(collection(db, 'vat_returns'), {
      userId,
      period: '2025-Q4',
      dueDate: '2026-01-28',
      status: 'Filed',
      totalSales: 1250000,
      totalVAT: 62500,
      netVAT: 62500,
      filedAt: '2026-01-25T10:30:00Z'
    });

    await addDoc(collection(db, 'vat_returns'), {
      userId,
      period: '2026-Q1',
      dueDate: '2026-04-28',
      status: 'Draft',
      totalSales: 850000,
      totalVAT: 42500,
      netVAT: 42500,
      filedAt: null
    });

    await addDoc(collection(db, 'vat_returns'), {
      userId,
      period: '2026-Q2',
      dueDate: '2026-07-28',
      status: 'Draft',
      totalSales: 750000,
      totalVAT: 37500,
      netVAT: 37500,
      filedAt: null
    });

    // Add Correspondence
    await addDoc(collection(db, 'correspondence'), {
      userId,
      subject: 'VAT Registration Certificate',
      type: 'Certificate',
      status: 'Read',
      content: 'Your VAT registration certificate is now available for download.',
      createdAt: '2024-01-12T09:00:00Z'
    });

    await addDoc(collection(db, 'correspondence'), {
      userId,
      subject: 'Upcoming Filing Deadline Reminder',
      type: 'Message',
      status: 'Unread',
      content: 'This is a reminder that your Q1 2026 VAT return is due by April 28th.',
      createdAt: '2026-03-10T14:20:00Z'
    });

    // Add Payments
    await addDoc(collection(db, 'payments'), {
      userId,
      amount: 62500,
      type: 'VAT Payment - 2025-Q4',
      status: 'Paid',
      dueDate: '2026-01-28',
      paidAt: '2026-01-27T11:15:00Z'
    });

    await addDoc(collection(db, 'payments'), {
      userId,
      amount: 15000,
      type: 'Administrative Penalty',
      status: 'Outstanding',
      dueDate: '2026-03-30',
      paidAt: null
    });

    console.log('Mock data initialized successfully');
  } catch (err) {
    console.error('Error initializing mock data:', err);
  }
};
