const sqlQueries = {
  GetApiReturnBySubmissionId: `SELECT api_return_id as "apiReturnId" FROM tbs_api_returns WHERE submission_id = $1 AND is_deleted = false`,
  UpdateApiReturns: `UPDATE tbs_api_returns SET submission_status = $1, user_id = $2, form_id = $3, updated_time_stamp=now(), is_deleted = false WHERE submission_id = $4 AND is_deleted = false RETURNING api_return_id as "apiReturnId"`,
  SaveApiReturns: `INSERT INTO tbs_api_returns ( submission_id, submission_status, user_id, form_id, created_time_stamp, updated_time_stamp, is_deleted ) VALUES ( $1, $2, $3, $4, now(),now(), false )RETURNING api_return_id as "apiReturnId"`,
  GetApiReturnRecords: `SELECT  api_return_record_Id as "apiReturnRecordId", api_return_Id as "apiReturnId", return_id as "returnId", Record_status as "recordStatus", business_Id as "businessId", Sequence as "sequence", form_id as "formId"  FROM tbs_api_return_records WHERE api_return_record_id = $1 AND is_deleted = false`,
  SaveApiReturnRecords: `INSERT INTO tbs_api_return_records ( api_return_record_id, return_id, api_return_id, business_id, sequence, form_id, dba_ref_id, updated_time_stamp, created_time_stamp, is_deleted, record_status, is_updated_return,form_group_id,return_unique_id ) VALUES ( $1, $2, $3, $4, $5, $6, $7, now(),now(), false, $8, false,$9, $10 )`,
  UpdateApiReturnRecords: `UPDATE tbs_api_return_records SET return_id = $1, api_return_id = $2, business_id = $3, sequence = $4, form_id = $5, dba_ref_id = $6, updated_time_stamp = now(), is_deleted = false, record_status = $7, is_updated_return = false, form_group_id = $8, return_unique_id = $9 WHERE api_return_record_id = $10 and Is_deleted = false`,
  GerReturnRecordErrors: `SELECT * FROM etf_API_Return_Records_Error WHERE api_return_record_id = @RecordId AND (rejection_type != 'STATE' OR rejection_type IS NULL) AND is_deleted = false`,
  UpdareReturnRecordErrors: `UPDATE etf_API_Return_Records_Error SET is_deleted = false, updated_time_stamp = now() WHERE api_return_records_error_id = @errorId`,
  GetErrors:
    "SELECT Id, Name, Message FROM etf_api_static_errors WHERE Is_Deleted = 0",
  GetIpAndDomainDetails:
    "SELECT Ip_Address AS ip_address, Domain_Ref_Id AS domain_id FROM etf_API_User_Whitelisted_IP WHERE User_Id = @UserId AND Is_Deleted = 0",
  GetApiDetails:
    "SELECT User_Id AS user_id,Is_All_IP_Allowed AS is_ip_filter,Is_All_Domain_Allowed AS is_domain_filter,Api_Allowed_Limit AS allowedLimit FROM etf_applications WHERE User_Id = @UserId AND Is_Deleted = 0",
  GetUserDetailsByUserToken:
    "SELECT User_Id AS user_id, Email_Address AS user_email, User_Token AS user_token FROM etf_Hub_Users WHERE User_Token = @userToken AND Is_Deleted = 0",
  GetUserDetailsByUserId:
    "SELECT User_Id AS user_id, Email_Address AS user_email FROM etf_Hub_Users WHERE User_Id = @userId AND Is_Deleted = 0",
  GetStateZipCodeCondition:
    "SELECT szcc.State_Abbrevation AS StateAbbreviation, szcc.Min_Zip_Code AS MinZipCode, szcc.Max_Zip_Code AS MaxZipCode, szcc.Equal_Zip_Code AS EqualZipCode, st.Is_State_Reporting AS IsStateReporting FROM etf_static_StateZipCodeConditions szcc JOIN etf_Static_State st ON szcc.State_Abbrevation = st.State_Code WHERE szcc.Is_Deleted = 0 AND st.Is_Deleted = 0",
  GetValidSubmissionIdAndRecordId:
    "SELECT * FROM tbs_api_returns ar JOIN tbs_api_return_records arr ON ar.api_return_id = arr.api_return_id WHERE ar.submission_id = $1 AND ar.user_id = $2 AND  ($3::uuid IS NULL OR arr.api_return_record_id = $3::uuid) AND ar.is_deleted = false AND arr.is_deleted = false LIMIT 1",
  GetValidSubmissionId:
    "SELECT * FROM tbs_api_returns ar JOIN tbs_api_return_records arr ON ar.api_return_id = arr.api_return_id WHERE ar.submission_id = $1 AND ar.user_id = $2 AND ar.is_deleted = false AND arr.is_deleted = false LIMIT 1",
  FetchApiReturnId:
    " SELECT api_return_id AS apireturnid FROM tbs_api_returns WHERE submission_id = $1 AND user_id = $2 AND is_deleted = false",
  FetchBusinessRecords: `SELECT business_id AS "BusinessId",api_return_record_id AS "RecordId",record_status AS "RecordStatus", Return_Id as "ReturnId", return_unique_id as "ReturnUniqueId" FROM tbs_api_return_records WHERE api_return_id = $1 AND is_deleted = false`,
  FetchTokenDetails: `SELECT L.White_Label_Id AS WhiteLabelId, L.Private_Key AS SecretKey, L.Public_Key AS PublicKey, L.JWT_Key AS JwtKey FROM etf_Hub_White_Label L WHERE L.White_Label_Id = @whitelabelId AND L.Is_Deleted = 0`,
  FetchUserDetails: `SELECT U.User_Id UserId , U.Contact_Name ContactName , U.User_Type_Id UserTypeId , U.Email_Address EmailAddress , U.Phone_Number PhoneNumber , U.Hide_Feedback_Next_Time HideFeedbackNextTime , UD.Is_Enable_MFA IsEnableMFA , UD.Is_Enable_MFA_Mobile IsEnableMFAMobile , UD.Mobile_Number MFAMobileNumber ,UD.User_Blocked_Type UserBlockedType , U.Access_Token UserAccessToken , U.Partner_Id PartnerId , ISNULL(U.Is_Partner_Approved,0) IsPartnerApproved ,CASE WHEN U.User_Token is null OR U.User_Token=''  THEN 0 ELSE 1 END IsAPIUser , UD.White_Label_Id WhiteLabelId , U.Is_SSO_User IsSSOUser FROM etf_Hub_Users U JOIN etf_Hub_Users_Detail UD ON U.User_Id = UD.User_Id WHERE U.User_Id = @userId AND U.Is_Deleted = 0 AND UD.Is_Deleted = 0`,
  GetReturnUniqueId: `SELECT  arr.return_unique_id as "returnUniqueId", arr.Sequence as "sequenceId", arr.api_return_record_id as "recordId" FROM tbs_api_returns ar JOIN tbs_api_return_records arr ON ar.api_return_id = arr.api_return_id WHERE ar.submission_id = $1  AND ar.user_id = $2 AND  ($3::uuid IS NULL OR arr.api_return_record_id = $3::uuid) AND ar.is_deleted = false AND arr.is_deleted = false`,
};

export default sqlQueries;
