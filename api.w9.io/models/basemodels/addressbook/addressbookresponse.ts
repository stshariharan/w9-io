
export interface BusinessDetailsResponse {
  BusinessId: string;
  Status: string;
}
export interface Messages {
  ErrorCode: string;
  Message: string;
  ShortMessage: string;
  LongMessage: string;
}
export interface BusinessDetailsSaveResponse {
  BusinessId: string;
  Status: string;
  Messages: Messages;
  DbaNameId: Number;
}
export interface BusinessTINDetailsResponse {
  BusinessIds: string[];
  Status: string;
}
export interface ValidBusinessResponse {
  IsValidBusiness: boolean;
  Status: string;
}
export interface GetBusiness {
  //W2/1099    
  BusinessId: string;
  UserId: string;
  BusinessName: string;
  BusinessLastName: string;
  BusinessSuffix: string;
  BusinessMiddleName: string;
  ReferenceNumber: string;
  BusinessTinType: string;
  TIN: string;
  UnMaskedTin: string;
  BusinessStatus?: number | null;
  IsForeignAddress?: boolean | null;
  Address1: string;
  Address2: string;
  City: string;
  StateCode: string;
  CountryCode: string;
  ZIPCode: string;
  StateName: string;
  PayerCorrectionType: string;
  Is1099?: boolean | null;
  IsW2?: boolean | null;
  KindOfEmployer: string;
  KindOfPayer: string;
  IsLastTaxYear?: boolean | null;
  ContactName: string;
  ContactLastName: string;
  ContactSuffix: string;
  ContactMiddleInitial: string;
  EmailAddress: string;
  Phone: string;
  ScheduleFiling?: Date | null;
  IsScheduleFiling?: boolean | null;
  etfPayerId?: string | null;
  GroupId?: Number[] | null;
  PrimaryColor: string;
  DBAName: string;
  SecondaryColor: string;
  TaxPayerPIN: string;
  PIN: string;
  ZohoOrganizationId: string;
  UseQuickBooksRealmIdId: string;
  QuickBooksPayerId: Number;
  FreshBooksAccountId: string;
  XeroOrganizationId: string;

  //ACA
  NameControl: string;

  //API
  IsSoleProprietor?: boolean | null;
  ACAFilerType: string;
  ACAIsGovernmentalUnit?: boolean | null;
  IsReturnAutoGenEnabled?: boolean | null;
  PSEName: string;
  PSEPhone: string;
  FilerIndicatorPayer: string;
  IsPSESameAsPayers?: boolean | null;
  BusinessLogoPath: string;
  BusinessUrl: string;
  IsApiEnabled?: boolean | null;
  LastUsedOn: Date;
  ReportingAgentIndicator: string;
  ReportingAgentEin: string;
  IsOrganization?: boolean | null;
  Form94xDetails: Form94xBusinessDetails;
  Form1042sDetails: Form1042sBusinessDetails;
  AppType: string;
  FormGroupId: number;
  IsFortuneBusinessAcknowledge: boolean;
}
export interface Form94xBusinessDetails {
  Sample94XBusinessId?: string | null;
  ReportedName: string;
  ReportedTin: string;
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
  IsEIN?: boolean | null;
  SigningAuthorityName: string;
  SigningAuthorityTitle: string;
}
export interface Form1042sBusinessDetails {
  Sample1042SBusinessId?: string | null;
  Ch3StatusCode: string;
  Ch4StatusCode: string;
  WithHoldingGIIN: string;
  WithHoldingFTIN: string;
}
export interface GetBusinessResponse {
  BusinessDetails: GetBusiness;
  Status: string;
}
export interface GetBusinessIdsfromEINSSN {
  BusinessIds: string[];
  Status: string;
  Messages: any;
}
export interface ValidBusiness {
  IsValidBusiness: boolean;
  Status: string;
  Messages: any;
}
export interface DeleteBusinessResponse {
  Status: string;
  Messages: any;
}
export interface ValidateBusinessIdResponse {
  IsValidBusiness: boolean;
  Status: string;
  Messages: Messages;
}
export interface GetBusinessDetailsByEINSSNResponse {
  BusinessIds: string[];
  Status: string;
  Messages: Messages;
}
export interface BusinessListresponse {
  BusinessDetailList: GetBusiness[];
  Messages: Messages;
}

export interface ValidPayerRefBusiness {
  BusinessDetailList: string | null;
}
export interface GetListOfPayerRefsResponse {
  PayerRefList?: PayerRefList[] | null;
}
export interface PayerRefList {
  AccountNumber: string;
  BusinessId: string;
}
export interface DbaDetailsByDABRefOrId {
  DbaDetails: DbaDetailsUsingDbaRef[];
}
export interface DeleteDbaDetailsResponse {
  Status: string;
  Messages: Messages;
}
export interface DbaDetailsUsingDbaRef {
  BusinessId: string;
  DBARefId: string;
  DBARef: string;
  SequenceId: string;
  DBAName: string;
  Address1: string;
  Address2: string;
  City: string;
  StateName: string;
  StateCode: string;
  CountryCode: string;
  ZipCode: string;
  DBANameId: number;
  IsReturnTransmitted: boolean;
  IsReturnInprogress: boolean;
}
export interface DBADetailResponse {
  DBADetails: SaveDBADetails[];
  Status: string;
  Messages: Messages;
}
export interface SaveDBADetails {
  DBARef: string;
  DBAName: string;
  DBARefId: Messages;
}
export interface DBADetails {
  DBANameId: number;
  DBAName: string;
  IsTransmitted: boolean;
}
export interface GetMainBusinessResponse {
  BusinessId?: string | null;
  Status: string;
  Messages: Messages;
}