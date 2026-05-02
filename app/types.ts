// Shared types used across UI and backend integration
export type User = {
    uid: string;
    username: string; // Changed from displayName to match your Firestore schema
    displayName?: string; // Kept as optional for Firebase Auth compatibility
    email: string | null; // Nullable if signing up via phone
    phoneNumber?: string | null; // Nullable if signing up via email
    role?: string; 
    signupMethod?: 'email' | 'phone';
};

export type BillItem = {
    id: string;
    name: string;
    quantity: number;
    price: number; 
};

export type OCRResult = {
    vendor?: string;
    date?: string;
    total?: number;
    items: BillItem[];
    rawText?: string;
};

export type BillSession = {
    id: string;
    hostId: string;
    memberIds: string[];
    createdAt: string;
    status: 'pending' | 'active' | 'complete';
    ocrResult?: OCRResult;
    total?: number;
};

export type Invite = {
    id: string;
    groupId: string;
    invitedBy: string;
    invitedUserId?: string;
    invitedEmail?: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
    acceptedAt?: string;
    declinedAt?: string;
};