
export interface EmailDetails {
    FromAddress: string;
    ToAddress: string[];
    CCAddress?: string[];
    BCCAddress?: string[];
    Subject: string;
    Body: string;
    FormName?: string;
}