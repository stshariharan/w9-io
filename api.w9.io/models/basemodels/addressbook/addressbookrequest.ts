import { UUID } from "crypto";

export interface Form94xBusinessDetails {
  Sample94XBusinessId?: string | null;
  ReportedName?: string;
  ReportedTin?: string;
  CeaseofOperationsDate?: Date | null;
  PhoneExtension: string;
  DayTimePhone: string;
  Source: string;
  BusinessTypeId: string;
  BusinessMembersTypeId: string;
  FaxNumber: string;
  IsSignAuthUseFutureReturns?: boolean | null;
  IsAggregateFiler?: boolean | null;
  IsDifferentAddress?: boolean | null;
  IsDefaultPINForAllTaxPayers?: boolean | null;
  IsAllowRecipientsOnlineRetrival?: boolean | null;
  IsMainBusiness?: boolean | null;
  IsEIN?:boolean | null;
  SigningAuthorityName?: string;
  SigningAuthorityTitle?: string;
}

export interface Form1042sBusinessDetails {
  Sample1042SBusinessId?: string;
  Ch3StatusCode: string;
  Ch4StatusCode?: string;
  WithHoldingGIIN?: string;
  WithHoldingFTIN?: string;
}

export interface SaveBusiness {
  BusinessFullName?: string; // ignored in JSON
  BusinessId: UUID | null;
  UserId: string;
  BusinessName?: string;
  BusinessLastName?: string;
  BusinessSuffix?: string;
  BusinessMiddleName?: string;
  ReferenceNumber?: string;
  BusinessTinType?: string;
  TIN?: string;
  BusinessStatus?: number | null;
  IsForeignAddress?: boolean | null;
  Address1?: string;
  Address2?: string;
  City?: string;
  StateCode?: string;
  CountryCode?: string;
  ZIPCode?: string;
  StateName?: string;
  PayerCorrectionType?: string;
  Is1099?: boolean | null;
  IsW2?: boolean | null;
  KindOfEmployer?: string;
  KindOfPayer?: string;
  IsLastTaxYear?: boolean | null;
  ContactName?: string;
  ContactLastName?: string;
  ContactSuffix?: string;
  ContactMiddleInitial?: string;
  EmailAddress?: string;
  Phone?: string;
  ScheduleFiling?: Date | null;
  IsScheduleFiling?: boolean | null;
  etfPayerId?: string | null;
  GroupId?: (number | null)[];
  PrimaryColor?: string;
  DBAName?: string;
  SecondaryColor?: string;
  ZohoOrganizationId?: string;
  QuickBooksRealmId?: string;
  QuickBooksPayerId?: number | null;
  FreshBooksAccountId?: string;
  XeroOrganizationId?: string;
  NameControl?: string;
  IsSoleProprietor?: boolean | null;
  ACAFilerType?: string;
  ACAIsGovernmentalUnit?: boolean | null;
  IsReturnAutoGenEnabled?: boolean | null;
  PSEName?: string;
  PSEPhone?: string;
  FilerIndicatorPayer?: string;
  IsPSESameAsPayers?: boolean | null;
  BusinessLogoPath?: string;
  BusinessUrl?: string;
  IsApiEnabled?: boolean | null;
  LastUsedOn: Date;
  ReportingAgentIndicator?: string;
  ReportingAgentEin?: string;
  IsOrganization?: boolean | null;
  Form94xDetails?: Form94xBusinessDetails;
  Form1042sDetails?: Form1042sBusinessDetails;
  AppType?: string;
  FormGroupId: number;
  IsFortuneBusinessAcknowledge: boolean;
}

export interface TINDetails {
  UserId: string;
  TinType: string;
  TIN: string;
}

export interface GetBusinessDetailsByPayerRef {
  UserId: string;
  ReferenceNumber: string;
}

export interface GetBusinessDetailsByEINSSN {
  UserId: string;
  TIN: TINDetails[];
}

export interface GetValidBusinessRequest {
  userId: string;
  businessId: string;
}

export interface JwtKeyDetails {
  WhiteLableId: string;
  SecretKey: string;
  PublicKey: string;
  JwtKey: string;
}

export interface JwtKeyUserDetails {
  UserId: string;
  ContactName: string;
  UserTypeId: number;
  EmailAddress: string;
  PhoneNumber: string;
  HideFeedbackNextTime: string;
  IsEnableMFA: boolean;
  IsEnableMFAMobile: boolean;
  UserBlockedType: string;
  PartnerId: number;
  IsPartnerApproved: boolean;
  IsAPIUser: boolean;
  WhiteLabelId: string;
  IsSSOUser: boolean;
  UserType: string;
  IsCoAdmin: string;
  PartnerShipName: string;
  SecretKey: string;
  PublicKey: string;
  JwtKey: string;
  IsApproverCreateReturn: string;
  ExpiresTime: number;
  StaffUniqueId: string;
}

export interface GetBusinessList {
  UserId: string;
  IsMaskedTin: boolean;
}

export interface DeleteBusinessRequest {
  UserId: string;
  BusinessId: string;
  FormGroupId: number;
  IsForcedDelete: boolean;
}

export interface DBADetails {
  DBANameId: number;
  DBAName: string;
  IsTransmitted: boolean;
}

export interface GetBusinessRequest {
  UserId?: string;
  BusinessId: string;
  IsMaskedTin: boolean;
}

export interface ValidateBusinessId {
  UserId: string;
  BusinessId: string;
}

export interface BusinessIdByPayerRefRequest {
  ReferenceNumber: string;
  UserId: string;
}

export interface GetListOfPayerRefsRequest {
  UserId: string;
}

export interface GetMainBusinessDetails {
  UserId: string;
}

export interface GetDBADetailsByDBARefORIdRequest {
  UserId: string;
  BusinessId?: string | null;
  DbaRefId?: string | null;
  DbaRef?: string;
}

export interface DeleteDBADetailsByDBARefId {
  UserId: string;
  BusinessId?: string | null;
  DbaRefId?: string | null;
  FormGroupId: number;
}

export interface GetListBusinessIdsRequest {
  UserId: string;
  BusinessIds: string[];
}

export interface UpdateTaxPayerTinByBusinessId {
  TaxPayerPIN?: string;
  PIN?: string;
  BusinessId: string;
  UserId: string;
}

export interface DBADetail {
  DBAName?: string;
  DBANameId?: number | null;
  IsTransmitted?: boolean;
  SequenceId?: string;
  DBARefNo?: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  StateCode?: string;
  CountryCode?: string;
  ZipCode?: string;
  DBARefId?: string | null;
  FormGroupId: number;
  StateName?: string;
}

export interface DBADetailRequest {
  BusinessId: string;
  DBADetails: DBADetail[];
}
