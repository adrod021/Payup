import type { BillSession, OCRResult, User } from '@/app/types';

export const mockUser: User = {
  id: 'user_1',
  displayName: 'Alex',
  email: 'alex@example.com',
};

export const mockOCRResult: OCRResult = {
  vendor: 'Sample Cafe',
  date: '2026-03-16',
  total: 32.45,
  rawText: 'Sample Cafe\nTotal $32.45\n',
  items: [
    { id: 'item_1', name: 'Latte', quantity: 1, price: 4.5 },
    { id: 'item_2', name: 'Sandwich', quantity: 1, price: 7.25 },
  ],
};

export const mockBillSession: BillSession = {
  id: 'session_1',
  hostId: mockUser.id,
  memberIds: [mockUser.id],
  createdAt: new Date().toISOString(),
  status: 'pending',
  ocrResult: mockOCRResult,
  total: 32.45,
};

//just a mock data file for testing purposes. You can expand this with more mock users, sessions, and OCR results as needed.