export * from "./common";
import * as requestModels from "../request/request";

import { Error } from "../basemodels/error";
export interface StateWHCreateResponse {
  SubmissionId?: string | null;
  StatusCode: string;
  StatusName: string;
  StatusMessage: string;
  SuccessRecords: SuccessRecord[] | null;
  ErrorRecords: ErrorRecord[] | null;
  Errors: Error[] | null;
}

export interface SuccessRecord {
  SequenceId: string;
  BusinessId: string;
  PayerRef: string | null;
  RecordId: string|null;
  FormType: string;
  Status: string;
  StatusTs: string;
  Info: string | null;
  Errors: Error[] | null;
}

export interface ErrorRecord {
  SequenceId: string;
  RecordId: string | null;
  Errors: Error[] | null;
}
export interface StateWHUpdateResponse {
  SubmissionId: string | null;
  StatusCode: string;
  StatusName: string;
  StatusMessage: string;
  SuccessRecords: SuccessRecord[] | null;
  ErrorRecords: ErrorRecord[] | null;
  Errors: Error[] | null;
}

export interface QuarterResponse {
  Status : string;
  Message: string;
  Response : boolean;
}

export interface StateWHGetResponse {
  StatusCode: String;
  StatusName: String;
  StatusMessage: String;
  SubmissionId: String | null;
  StateWHRecords: requestModels.GetStateWHRecord[] | null;
  Errors: Error[] | null;
}

export interface StateFormAPIResponse {
  Status: string;
  Message: string;
  Response: {
    ReturnId: string;
    ReturnUniqueId: string;
  };
}
