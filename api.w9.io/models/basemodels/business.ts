import { UUID } from "crypto";
import { ForeignAddress, USAddress } from "./address"

export interface Business {
    BusinessId: UUID | null;
    PayerRef: string;
    BusinessNm: string;
    FirstNm: string;
    MiddleNm: string;
    LastNm: string;
    Suffix: string;
    TradeNm: string;
    IsEIN: boolean;
    EINorSSN: string;
    Email: string;
    ContactNm: string;
    Phone: string;
    PhoneExtn: string;
    Fax: string;
    BusinessType: string;
    SigningAuthority: SigningAuthority | null;
    Form1099KSpecificFields: Form1099KSpecificFields | null;
    KindOfEmployer: string;
    KindOfPayer: string;
    IsBusinessTerminated: boolean;
    Form1042SDetails: Form1042SBusinessDetails | null;
    IsForeign: boolean | null;
    USAddress: USAddress;
    ForeignAddress: ForeignAddress;
    PayerAccNum: string;
    ACADetails: ACAAdditionalDetails | null;
    IsOnlineAccess: boolean;
    ContactLastNm: string;
    ACAReturnId?: number;
    ACAReturnPayerId?: number;
    StatusTS?: string;
    IsNota1099Flow?: boolean;
    IsSkipValidation?: boolean;
    IsSageUser?: boolean;
    StaffUserId?: string;
    IsDGE?: boolean;
}




export interface PSEDetails {
    PSEName: string;
    PSEPhone: string;
}

export interface Form1099KSpecificFields {
    FilerIndicator: string;
    IsPSESameAsPayer: boolean | null;
    PSEDetails: PSEDetails | null;
}

export interface Form1042SBusinessDetails {
    WHAgtCh3Cd: string;
    WHAgtCh4Cd: string;
    WHAgtGIIN: string;
    FTIN: string;
    Country: string;
}

export interface ACAAdditionalDetails {
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Suffix: string;
    Phone: string;
    IsGovernmentalUnit: boolean;
}


export interface SigningAuthority {
    Name: string;
    Phone: string;
    BusinessMemberType: string;
}


export interface BusinessGet {
    BusinessId: UUID | null;
    PayerRef : string | null;
    BusinessNm ?: string| null;
    FirstNm ?: string | null;
    MiddleNm ?: string | null;
    LastNm ?: string | null;
    Suffix ?: string | null;
    TradeNm ?: string | null;
    IsEIN: boolean;
    EINorSSN: string;
    Email ?: string| null;
    ContactNm ?: string| null;
    Phone ?: string| null;
    PhoneExtn ?: string| null;
    Fax ?: string| null;
    BusinessType ?: string| null;
    SigningAuthority ?: SigningAuthority | null;
    KindOfEmployer ?:string| null;
    KindOfPayer ?: string| null;
    IsBusinessTerminated: boolean;
    IsForeign: boolean | null;
    USAddress : GetUSAddress | null;
    ForeignAddress : GetForeignAddress | null;   
    ACADetails?: ACAAdditionalDetails | null;
    
}


export interface GetUSAddress {
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    ZipCd: string;
}

export interface GetForeignAddress {
    Address1: string;
    Address2: string;
    City: string;
    ProvinceOrStateNm: string;
    Country: string;
    PostalCd: string;
}

