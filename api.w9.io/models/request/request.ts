import { Business, BusinessGet } from "../basemodels/business"
import { UUID } from "crypto";


export interface StateWHCreateRequest {
  StateWHRecords: StateWHRecord[];
  UserId?: string;
  FormType?: string;
}

export interface StateWHRecord {
  Sequence: string;
  RecordId: string;
  ReturnHeader: ReturnHeader;
  ReturnData: ReturnData;
}

export interface ReturnHeader {
  Qtr: string;
  TaxYr: string;
  Business: Business;
}

export interface ReturnData {
  FormSC1605: FormSC1605 | null;
  FormSC1606: FormSC1606 | null;
}

export interface FormSC1605 {
  IsChangeOfAdd: boolean;
  IsCloseWHAcc: boolean;
  WHAccCloseDate: string;
  WHIdNum: string;
  L1IncomeTaxWH: number  | null;
  L2IncomeTaxDeposits: number | null;
  L3Refund: number | null;
  L4TaxDue: number | null;
  L5Penalty: number | null;
  L5Interest: number | null;
  L5Total: number | null;
  L6BalanceDue: number | null;
}

export interface FormSC1606 {
  IsChangeOfAdd: boolean;
  IsCloseWHAcc: boolean;
  WHAccCloseDate: string;
  WHIdNum: string;
  L1IncomeTaxWH: number | null;
  L2IncomeTaxDeposits: number | null;
  L3Refund: number | null;
  L4TaxDue: number | null;
  L5Penalty: number | null;
  L5Interest: number | null;
  L5Total: number | null;
  L6BalanceDue: number | null;
  L7JantoMar: number | null;
  L7AprtoJun: number | null;
  L7JultoSep: number | null;
  L7OcttoDec: number | null;
  L7TotalTaxWH: number | null;
  L8W2s: number | null;
  L8W2Gs: number | null;
  L81099s: number | null;
  L8TotalTaxWH: number | null;
  L9TotalSCIncome: number | null;
  L10NoOfFormsSubmitted: number | null;
}

export interface StateUpdateRecord {
  Sequence: string;
  RecordId: string;
  ReturnHeader: ReturnHeader;
  ReturnData: ReturnData;
}
export interface UpdateRequest {
  SubmissionId: string;
  StateWHRecords: StateUpdateRecord[];
  UserId?: string;
  FormType?: string;
}

export interface StateWHGetRequest {
  SubmissionId: String;
  RecordId?: String;

}

export interface GetStateWHRecord {
  Sequence: String;
  RecordId: String;
  ReturnHeader: GetReturnHeader;
  ReturnData: ReturnData;
}

export interface GetReturnHeader {
  Qtr: String;
  TaxYr: String;
  Business: BusinessGet;
}