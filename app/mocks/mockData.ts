import type { BillSession, OCRResult, User } from '@/app/types';

/**
 * Mock Data Store
 * This file provides static data for testing UI components and layouts
 * without requiring active connections to Firebase or the OCR service.
 */

// Basic user profile for testing authentication-dependent UI
export const mockUser: User = {
  uid: 'user_1',
  username: 'Alex',
  email: 'alex@example.com',
};

// Simple receipt data to verify basic OCR display and item mapping
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

// Standard session state to test the initial "Pending" status of a bill
export const mockBillSession: BillSession = {
  id: 'session_1',
  hostId: mockUser.uid,
  memberIds: [mockUser.uid],
  createdAt: new Date().toISOString(),
  status: 'pending',
  ocrResult: mockOCRResult,
  total: 32.45,
};


 // Long Receipt - Use this to verify that the ScrollView and container heights handle many items without cutting off the "Total" at the bottom.

export const mockLongOCRResult: OCRResult = {
  vendor: 'Big Family Dinner',
  date: '2026-03-27',
  total: 154.20,
  rawText: '...',
  items: [
    { id: 'item_1', name: 'Pizza Large', quantity: 2, price: 44.00 },
    { id: 'item_2', name: 'Garlic Bread', quantity: 3, price: 15.00 },
    { id: 'item_3', name: 'Family Salad', quantity: 1, price: 12.00 },
    { id: 'item_4', name: 'Soft Drinks', quantity: 6, price: 18.00 },
    { id: 'item_5', name: 'Pasta Alfredo', quantity: 2, price: 32.00 },
    { id: 'item_6', name: 'Tiramisu', quantity: 4, price: 33.20 },
  ],
};


 // Stress Test: Large Group Use this to check if the "Waiting Room" or "Lobby" UI handles a long list of participants gracefully without breaking the layout.
 export const mockLargeGroupSession: string[] = [
  'alex@example.com', 'jordan@test.com', 'sam@split.com', 
  'casey@pay.com', 'taylor@up.com', 'riley@bill.com'
];