import { UnauthorizeReason } from "../../utils/enum";

export interface UserDetail {
  userId: string;
  userToken: string;
  userEmail: string;
  parentUserId: string;
  isIpFilter: boolean;
  isDomainFilter: boolean;
  ips: string[];
  domainRefIds: string[];
  ipAddress: string;
  addressbookToken: string;
  allowedLimit: number;
}

export interface AuthUserDetails {
  IsJWTAuthorized: boolean;
  UnauthorizeReason: UnauthorizeReason;
  UserToken: string;
  UserId: string;
}

export interface ApiReturn {
  submissionId: string;
  userId: string;
  formId: number;
  apiReturnId: number;
}

export interface ApiReturnRecords {
  apiReturnId: number;
  apiReturnRecordId?: string;
  returnId: number;
  businessId?: string;
  Sequence?: string;
  formId: number;
  dbaRefId?: string;
  formGroupId?: number;
  Status?: string;
  recordStatus?: string;
  UpdateTimeStamp?: Date;
  CreateTimeStamp?: Date;
  isupdatedreturn?: boolean;
  IsRejectedFlow?: boolean;
  returnUniqueId?: string;
}

export interface EmailDetails {
  FromAddress: string;
  ToAddress: string[];
  CCAddress?: string[];
  BCCAddress?: string[];
  Subject: string;
  Body: string;
  Attachments?: string[];
  FormName?: string;
}
