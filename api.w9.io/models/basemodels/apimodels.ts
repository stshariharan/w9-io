export interface ApiReturn {
  submissionId: String;
  userId: String;
  formId: Number;
  apiReturnId: Number;
}

export interface ApiReturnRecords {
  apiReturnId: Number;
  apiReturnRecordId: String;
  returnId: Number;
  businessId: String;
  Sequence: String;
  formId: Number;
  dbaRefId: String;
  formGroupId: Number;
  isRejectedFlow: Boolean;
  isupdatedreturn: Boolean;
  recordStatus: String;
  Status: String;
  CreateTimeStamp: Date;
  UpdateTimeStamp: Date;
}

export interface ApiReturnRecord {
  BusinessId: string;       // business_id
  RecordId: string;         // api_return_record_id
  RecordStatus: string;     // record_status
  ReturnId: string;         // return_id
  ReturnUniqueId: string;   // return_unique_id
}