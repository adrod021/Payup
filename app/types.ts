// Shared types used across UI and backend integration
// These act as the "contracts" the UI expects from the data layer

export type User = {
    id: string;
    displayName: string;
    email: string;
    phoneNumber?: string;
    role?: string; // Add this for admin/user permissions
};

export type BillItem = {
    id: string;
    name: string;
    quantity: number;
    price: number; // in dollars
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