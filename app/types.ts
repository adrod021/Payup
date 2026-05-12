/**
 * APP DATA TYPES
 * Defines the strict structures for users, bills, and session logic.
 */

// User profile data stored in Firestore
export type User = {
    uid: string;
    username: string;        // The user's chosen handle
    displayName?: string;    // Optional field for Firebase Auth parity
    email: string | null;    // Can be null if using Phone Login
    phoneNumber?: string | null; // Can be null if using Email Login
    role?: string; 
    signupMethod?: 'email' | 'phone';
};

// Represents a single line item from a receipt
export type BillItem = {
    id: string;
    name: string;
    quantity: number;
    price: number; 
};

// Data returned from Google ML Kit OCR after processing an image
export type OCRResult = {
    vendor?: string;
    date?: string;
    total?: number;
    items: BillItem[];
    rawText?: string; // Stored for debugging OCR accuracy
};

// A collaborative bill-splitting session
export type BillSession = {
    id: string;
    hostId: string;
    memberIds: string[];
    createdAt: string;
    status: 'pending' | 'active' | 'complete';
    ocrResult?: OCRResult;
    total?: number;
};

// Relationship document for friend requests and session invites
export type Invite = {
    id: string;
    groupId: string;
    invitedBy: string;      // UID of the sender
    invitedUserId?: string; // UID of receiver (if already a user)
    invitedEmail?: string;  // Contact method used to find them
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
    acceptedAt?: string;
    declinedAt?: string;
};