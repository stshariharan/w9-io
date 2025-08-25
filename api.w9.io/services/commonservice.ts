import {
  IAddressBookRepository,
  ICommonRepository,
} from "../interfaces/repository";
import {
  IAddressBookService,
  ICommonService,
  IBusinessService,
  IFormSCService,
} from "../interfaces/service";
import * as BaseModels from "../models/basemodels/baseModels";
import * as AddressBookRequest from "../models/basemodels/addressbook/addressbookrequest";
import * as AddressBookResponse from "../models/basemodels/addressbook/addressbookresponse";
import { DataValidation } from "../models/basemodels/error";
import { UserDetail } from "../models/basemodels/user";
import * as Enums from "../utils/enum";
import { RegexPatterns } from "../utils/regex";
import { utility } from "../utils/utility";
import { container } from "../di/container";
import * as Request from "../models/request/request";
import * as Response from "../models/response/response";
import config from "../config/env";
import { v7 as uuid } from "uuid";
import { GetgeneratedResponseBody } from "../utils/utility";
import Constants from "../utils/constants";
import { UUID } from "crypto";

export let SaveBusiness: AddressBookRequest.SaveBusiness;

export class CommonService implements ICommonService {
  constructor(
    private commonRepository: ICommonRepository,
    private apiAddressBookRepository: IAddressBookRepository,
    private apiAddressBookService: IAddressBookService,
    private apiBusinessService: IBusinessService,
    private formSCService: IFormSCService
  ) {}
  async getUserDetailByUserToken(
    userToken: String
  ): Promise<UserDetail | null> {
    return this.commonRepository.getUserDetails(userToken, "");
  }

  async getBusinessDetailBybusinessId(): Promise<AddressBookResponse.GetBusinessResponse | null> {
    const getBusinessRequest: AddressBookRequest.GetBusinessRequest = {
      BusinessId: "a16e0a78-95b3-4cd6-b304-26b2e9f6a702",
      UserId: "1021C62A-2D5D-4B0D-80D6-8399025D5FB2",
      IsMaskedTin: false,
    };

    const response = await this.apiAddressBookRepository.requestBusinessAPI<
      AddressBookRequest.GetBusinessRequest,
      AddressBookResponse.GetBusinessResponse
    >(
      "https://tbs-commonapi.stssprint.com/Business/GetBusinessDetailById",
      getBusinessRequest,
      ""
    );

    return response;
  }

  /**
   * Retrieves detailed information about a user from the repository.
   *
   * @param userToken - The authentication token of the user.
   * @param userId - The unique identifier of the user.
   * @returns A `UserDetail` object if found, otherwise `null`.
   */
  async getUserDetails(
    userToken: string,
    userId: string
  ): Promise<UserDetail | null> {
    // Delegate call to the common repository for actual DB fetching
    return this.commonRepository.getUserDetails(userToken, userId);
  }

  // #Sequence validation
  async validateSequence(
    sequenceId: string,
    index: string
  ): Promise<BaseModels.Error[] | null> {
    let errors: BaseModels.Error[] = [];
    if (sequenceId && sequenceId != null && sequenceId != "") {
      if (sequenceId.length > 50) {
        errors.push(await this.getErrorNameById("S00-000014", index));
      }
      if (!RegexPatterns.SEQUENCE_REGEX.test(sequenceId)) {
        errors.push(
          await this.commonRepository.getErrorNameById("S00-000015", index)
        );
      }
    } else {
      errors.push(
        await this.commonRepository.getErrorNameById("S00-000016", index)
      );
    }

    return errors;
  }
  // #Endregion

  // #Duplicate sequence validation
  async duplicateSequenceValidation(
    req: any,
    index: string
  ): Promise<BaseModels.Error[] | null> {
    let errors: BaseModels.Error[] = [];
    if (req.StateWHRecords || req.StateWHRecords?.length > 0) {
      if (index == "0") {
        const sequenceMap = new Map<string, number[]>();

        req.StateWHRecords.forEach((record: any, index: number) => {
          const seq = record?.Sequence?.trim();
          if (seq) {
            if (!sequenceMap.has(seq)) {
              sequenceMap.set(seq, []);
            }
            sequenceMap.get(seq)!.push(index);
          }
        });

        // Find sequences with duplicates
        for (const [seq, indexes] of sequenceMap.entries()) {
          if (indexes.length > 1) {
            // Only add errors for duplicates (after the first)
            for (let i = 1; i < indexes.length; i++) {
              const indexStr = indexes[i].toString();
              const error = await this.commonRepository.getErrorNameMessageById(
                "S00-000017",
                seq,
                indexStr
              );
              errors.push(error);
            }
          }
        }
      }
    } else {
      errors.push(
        await this.commonRepository.getErrorNameById("S00-000016", index)
      );
    }

    return errors;
  }
  // #Endregion

  async getErrorById(errorId: string): Promise<BaseModels.Error> {
    return (
      (await this.commonRepository?.getErrorById(errorId)) ??
      ({} as BaseModels.Error)
    );
  }

  async createState(
    req: Request.StateWHCreateRequest,
    userDetails: UserDetail
  ): Promise<Response.StateWHCreateResponse | null> {
    const response: Response.StateWHCreateResponse = {
      StatusCode: "",
      StatusName: "",
      StatusMessage: "",
      SubmissionId: "",
      SuccessRecords: [],
      ErrorRecords: [],
      Errors: [],
    };
    let index = 0;
    let isAPIReturns = false;
    let savedReturn: BaseModels.ApiReturn | null = null;
    for (const record of req.StateWHRecords) {
      let recordErrors: BaseModels.Error[] = [];

      if (!record.ReturnHeader) {
        const err = await this.getErrorById("S00-000183");
        if (err) recordErrors.push(err);
        continue;
      }

      // Validate Qtr
      if (!record.ReturnHeader?.Qtr) {
        const err = await this.getErrorById("S00-000166");
        if (err) recordErrors.push(err);
      } else if (!RegexPatterns.QTR_REGEX.test(record.ReturnHeader.Qtr)) {
        const err = await this.getErrorById("S00-000165");
        if (err) recordErrors.push(err);
      }

      // Validate TaxYr
      if (!record.ReturnHeader?.TaxYr) {
        const err = await this.getErrorById("S00-000167");
        if (err) recordErrors.push(err);
      } else if (!RegexPatterns.TAXYEAR_REGEX.test(record.ReturnHeader.TaxYr)) {
        const err = await this.getErrorById("S00-000168");
        if (err) recordErrors.push(err);
      }

      //#region Validate Business
      const err = await this.apiBusinessService.ValidateBusiness(
        record.ReturnHeader.Business,
        index.toString(),
        userDetails
      );
      if (err && err.length > 0) recordErrors.push(...err);
      //#endregion

      // #region Validate Tax year and Quarter
      const taxYrErr = await this.validateTaxYearAndQuarter(
        record.ReturnHeader.TaxYr,
        record.ReturnHeader.Qtr,
        userDetails.addressbookToken,
        index.toString()
      );
      if (taxYrErr && taxYrErr.length > 0) recordErrors.push(...taxYrErr);

      //#region Validate Sequence
      const seqErr = await this.validateSequence(
        record.Sequence,
        index.toString()
      );
      if (seqErr && seqErr.length > 0) recordErrors.push(...seqErr);

      const dupSeqErr = await this.duplicateSequenceValidation(
        req,
        index.toString()
      );
      if (dupSeqErr && dupSeqErr.length > 0) recordErrors.push(...dupSeqErr);
      // #endregion

      let formId = 0;
      let formType = "";
      //#region Validate Form Details
      if (recordErrors == null || recordErrors.length == 0) {
        if (req.FormType?.toUpperCase() === "SCWH") {
          if (
            record.ReturnData.FormSC1605 != null &&
            record.ReturnData.FormSC1605 != undefined
          ) {
            formId = Enums.FormType.WH1605;
            formType = "SC1605";
          } else if (
            record.ReturnData.FormSC1606 != null &&
            record.ReturnData.FormSC1606 != undefined
          ) {
            formId = Enums.FormType.WH1606;
            formType = "SC1606";
          }
        } else {
          if (
            record.ReturnData.FormSC1605 != null &&
            record.ReturnData.FormSC1605 != undefined
          ) {
            formId = Enums.FormType.WH1605;
            formType = "SC1605";
          } else if (
            record.ReturnData.FormSC1606 != null &&
            record.ReturnData.FormSC1606 != undefined
          ) {
            formId = Enums.FormType.WH1606;
            formType = "SC1606";
          }
        }
        const isReturnExist = await this.checkReturnExists(
          record.ReturnHeader.TaxYr,
          record.ReturnHeader.Qtr,
          record.ReturnHeader.Business.BusinessId,
          record.ReturnHeader.Business.EINorSSN,
          formId,
          userDetails.addressbookToken
        );
        if (isReturnExist) {
          recordErrors.push(
            await this.commonRepository.getErrorById("S00-000190")
          );
        }

        if (record.ReturnData != null) {
          const err = await this.formSCService.ValidateFormSCWHDetails(
            record.ReturnData,
            record.ReturnHeader.Qtr
          );
          if (err && err.length > 0) recordErrors.push(...err);
        }
      }
      //#endregion

      index++;
      // Decide if it’s an error or success record
      if (recordErrors.length > 0) {
        if (!response.ErrorRecords) {
          response.ErrorRecords = [];
        }
        // Only set in ErrorRecords, no direct push to response.Errors
        response.ErrorRecords.push({
          SequenceId: record.Sequence,
          RecordId: null,
          Errors: recordErrors,
        });
        continue;
      } else {
        SaveBusiness = await this.AssignBusinessDetails(
          record.ReturnHeader.Business
        );
        SaveBusiness.UserId = userDetails.userId;
        const BusinessDetailsSaveResponse =
          await this.apiAddressBookService.saveAndUpdateBusinessDetail(
            SaveBusiness,
            userDetails.addressbookToken
          );
        if (
          BusinessDetailsSaveResponse &&
          BusinessDetailsSaveResponse.BusinessId
        ) {
          record.ReturnHeader.Business.BusinessId = utility.getGuid(
            BusinessDetailsSaveResponse.BusinessId
          );

          //#region Save Logics

          if (!isAPIReturns) {
            const apiReturnData: BaseModels.ApiReturn = {
              submissionId: uuid(),
              userId: userDetails.userId,
              formId: formId,
              apiReturnId: 0,
            };
            savedReturn = await this.commonRepository.saveApiReturn(
              apiReturnData
            );
            isAPIReturns = true;
            response.SubmissionId = apiReturnData.submissionId.toString();
          }

          //#region API Return Save Logics

          //#endregion
          if (savedReturn !== null && savedReturn.apiReturnId > 0) {
            //#region API Return Records Save Logics

            let returnId = "";
            let returnunqid = "";
            let responseData = await this.formSCService.saveFormSCWHDetails(
              record,
              userDetails.addressbookToken,
              formId.toString(),
              returnId,
              returnunqid
            );

            if (
              responseData &&
              responseData.Response &&
              utility.getLong(responseData.Response.ReturnId) > 0
            ) {
              const apiReturnRecordsData: BaseModels.ApiReturnRecords = {
                apiReturnId: savedReturn.apiReturnId,
                returnId: utility.getLong(responseData.Response.ReturnId),
                formId: formId,
                recordStatus: "CREATED",
                businessId: BusinessDetailsSaveResponse.BusinessId,
                Sequence: record.Sequence,
                formGroupId: 4,
                returnUniqueId: responseData.Response.ReturnUniqueId,
                apiReturnRecordId: uuid(), // <-- Add the actual value here
              };

              const savedReturnRecord =
                await this.commonRepository.saveApiReturnRecords(
                  apiReturnRecordsData
                );
              if (savedReturnRecord?.apiReturnRecordId) {
                // If no new errors → add to SuccessRecords
                response.SuccessRecords ??= []; // if null/undefined, set as []
                response.SuccessRecords.push({
                  SequenceId: record.Sequence,
                  BusinessId: BusinessDetailsSaveResponse.BusinessId,
                  PayerRef: record.ReturnHeader.Business.PayerRef || null,
                  RecordId: apiReturnRecordsData.apiReturnRecordId || null,
                  FormType: formType,
                  Status: "CREATED",
                  StatusTs:
                    getIRSDateTimeFormat(savedReturnRecord.UpdateTimeStamp!) ??
                    "",
                  Info: null,
                  Errors: null,
                });

                //#endregion
              } else {
                if (!response.ErrorRecords) {
                  response.ErrorRecords = [];
                }
                const err = await this.getErrorById("S00-000170");
                if (err) recordErrors.push(err);

                response.ErrorRecords.push({
                  SequenceId: record.Sequence,
                  RecordId: null,
                  Errors: recordErrors,
                });
                continue;
              }
            } else {
              if (!response.ErrorRecords) {
                response.ErrorRecords = [];
              }
              const err = await this.getErrorById("S00-000170");
              if (err) recordErrors.push(err);

              response.ErrorRecords.push({
                SequenceId: record.Sequence,
                RecordId: null,
                Errors: recordErrors,
              });
              continue;
            }

            //#endregion
          }
        } else if (BusinessDetailsSaveResponse != null) {
          if (!response.ErrorRecords) {
            response.ErrorRecords = [];
          }
          const errors: BaseModels.Error = {
            Id: BusinessDetailsSaveResponse.Messages?.ErrorCode ?? null,
            Message: BusinessDetailsSaveResponse.Messages?.Message ?? null,
            Name: "Business-ERR",
          };
          recordErrors.push(errors);
          response.ErrorRecords.push({
            SequenceId: record.Sequence,
            RecordId: null,
            Errors: recordErrors,
          });
          continue;
        } else {
          if (!response.ErrorRecords) {
            response.ErrorRecords = [];
          }
          const err = await this.getErrorById("S00-000170");
          if (err) recordErrors.push(err);

          response.ErrorRecords.push({
            SequenceId: record.Sequence,
            RecordId: null,
            Errors: recordErrors,
          });
          continue;
        }
      }
    }

    //#region Response Status Handling

    if (
      response.ErrorRecords != null &&
      !response.ErrorRecords.length &&
      response.SuccessRecords != null &&
      response.SuccessRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.Ok.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.Ok];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.Ok];
      response.ErrorRecords = null;
      response.Errors = null;
    } else if (
      response.SuccessRecords != null &&
      !response.SuccessRecords.length &&
      response.ErrorRecords != null &&
      response.ErrorRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.BadRequest.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.BadRequest];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.BadRequest];
      response.Errors = null;
      response.SubmissionId = null;
      response.SuccessRecords = null;
    } else if (
      response.SuccessRecords != null &&
      response.SuccessRecords.length &&
      response.ErrorRecords != null &&
      response.ErrorRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.MultiStatus.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.MultiStatus];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.MultiStatus];

      response.Errors = response.Errors || [];
      response.Errors.push(
        await this.commonRepository.getErrorById("S00-000184")
      );
    }

    // Nullify Response
    if (
      response.ErrorRecords != null &&
      !response.ErrorRecords.length &&
      response.SuccessRecords != null &&
      !response.SuccessRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.BadRequest.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.BadRequest];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.BadRequest];
    }

    //#endregion
    return response;
  }

  async getErrorNameById(
    errorId: string,
    index: string
  ): Promise<BaseModels.Error> {
    return (
      (await container.commonRepository?.getErrorNameById(errorId, index)) ??
      ({} as BaseModels.Error)
    );
  }

  async getErrorMessageById(
    errorId: string,
    value1: string
  ): Promise<BaseModels.Error> {
    return (
      (await container.commonRepository?.getErrorMessageById(
        errorId,
        value1
      )) ?? ({} as BaseModels.Error)
    );
  }

  async getErrorNameMessageById(
    errorId: string,
    value1: string,
    index: string
  ): Promise<BaseModels.Error> {
    return (
      (await container.commonRepository?.getErrorNameMessageById(
        errorId,
        value1,
        index
      )) ?? ({} as BaseModels.Error)
    );
  }
  async GetErrorNameMessage(
    errorId: string,
    value1: string,
    value2: string,
    index: string
  ): Promise<BaseModels.Error> {
    return (
      (await container.commonRepository?.GetErrorNameMessage(
        errorId,
        value1,
        value2,
        index
      )) ?? ({} as BaseModels.Error)
    );
  }

  async AssignBusinessDetails(
    businessCreateRequest: BaseModels.Business
  ): Promise<AddressBookRequest.SaveBusiness> {
    const business: AddressBookRequest.SaveBusiness =
      {} as AddressBookRequest.SaveBusiness;
    business.Form1042sDetails =
      {} as AddressBookRequest.Form1042sBusinessDetails;
    //business.UserId = businessCreateRequest.UserId;
    business.BusinessId = utility.getGuid(businessCreateRequest.BusinessId);

    business.DBAName = businessCreateRequest.TradeNm;

    if (businessCreateRequest.IsEIN) {
      business.BusinessName = businessCreateRequest.BusinessNm;
      business.TIN = utility.getFormattedApiEIN(businessCreateRequest.EINorSSN);
      business.BusinessTinType = Enums.APIFormTINType.EIN.toString();
      business.FormGroupId = 2;
      business.BusinessFullName = businessCreateRequest.BusinessNm;
    } else {
      if (businessCreateRequest.FirstNm && businessCreateRequest.LastNm) {
        business.BusinessName = businessCreateRequest.FirstNm;
        business.BusinessLastName = businessCreateRequest.LastNm;
        business.BusinessMiddleName = businessCreateRequest.MiddleNm || "";
        business.BusinessSuffix = businessCreateRequest.Suffix || "";
        business.FormGroupId = 3;
        business.BusinessFullName = `${businessCreateRequest.FirstNm}${
          businessCreateRequest.MiddleNm
            ? " " + businessCreateRequest.MiddleNm
            : ""
        } ${businessCreateRequest.LastNm}${
          businessCreateRequest.Suffix ? " " + businessCreateRequest.Suffix : ""
        }`.trim();
      } else {
        business.BusinessName = businessCreateRequest.BusinessNm;
        business.FormGroupId = 2;
        business.BusinessFullName = businessCreateRequest.BusinessNm;
      }

      business.TIN = utility.getSSNFormattedString(
        businessCreateRequest.EINorSSN
      );
      business.BusinessTinType = Enums.APIFormTINType.SSN.toString();
    }

    business.EmailAddress = businessCreateRequest.Email;
    business.IsForeignAddress = utility.getBool(
      businessCreateRequest.IsForeign
    );

    if (utility.getBool(businessCreateRequest.IsForeign)) {
      business.Address1 = businessCreateRequest.ForeignAddress.Address1;
      business.Address2 = businessCreateRequest.ForeignAddress.Address2;
      business.ZIPCode = businessCreateRequest.ForeignAddress.PostalCd;
      business.CountryCode =
        businessCreateRequest.ForeignAddress.Country.toUpperCase();
      business.StateName =
        businessCreateRequest.ForeignAddress.ProvinceOrStateNm;
      business.City = businessCreateRequest.ForeignAddress.City;
    } else {
      business.Address1 = businessCreateRequest.USAddress.Address1;
      business.Address2 = businessCreateRequest.USAddress.Address2;
      business.City = businessCreateRequest.USAddress.City;
      if (
        businessCreateRequest.USAddress.ZipCd &&
        businessCreateRequest.USAddress.ZipCd.length === 9
      ) {
        businessCreateRequest.USAddress.ZipCd = utility.getFormattedApiZipcd(
          businessCreateRequest.USAddress.ZipCd
        );
      }
      business.ZIPCode = businessCreateRequest.USAddress.ZipCd;
      business.StateCode = businessCreateRequest.USAddress.State.toUpperCase();
      business.CountryCode = "US";
      business.StateName = "";
    }

    business.Phone = utility.getFormattedFaxOrPhoneNumber(
      businessCreateRequest.Phone
    );

    if (businessCreateRequest.Fax) {
      business.Form94xDetails =
        business.Form94xDetails ||
        ({} as AddressBookRequest.Form94xBusinessDetails);
      business.Form94xDetails.FaxNumber = utility.getFormattedFaxOrPhoneNumber(
        businessCreateRequest.Fax
      );
    }

    if (businessCreateRequest.PhoneExtn) {
      business.Form94xDetails =
        business.Form94xDetails ||
        ({} as AddressBookRequest.Form94xBusinessDetails);
      business.Form94xDetails.PhoneExtension = businessCreateRequest.PhoneExtn;
    } else {
      business.Form94xDetails =
        business.Form94xDetails ||
        ({} as AddressBookRequest.Form94xBusinessDetails);
      business.Form94xDetails.PhoneExtension = "";
    }

    business.AppType = "ETF";

    if (
      businessCreateRequest.BusinessType &&
      businessCreateRequest.SigningAuthority?.BusinessMemberType
    ) {
      business.Form94xDetails =
        business.Form94xDetails ||
        ({} as AddressBookRequest.Form94xBusinessDetails);
      business.Form94xDetails.BusinessTypeId = (Enums.BusinessType as any)[
        businessCreateRequest.BusinessType
      ].toString();

      if (utility.getLong(business.Form94xDetails.BusinessTypeId) > 0) {
        switch (business.Form94xDetails.BusinessTypeId) {
          case "1":
            business.Form94xDetails.BusinessMembersTypeId = (
              Enums.EstateBusinessMembers as any
            )[
              businessCreateRequest.SigningAuthority.BusinessMemberType
            ].toString();
            break;
          case "2":
            business.Form94xDetails.BusinessMembersTypeId = (
              Enums.PartnershipBusinessMembers as any
            )[
              businessCreateRequest.SigningAuthority.BusinessMemberType
            ].toString();
            break;
          case "3":
            business.Form94xDetails.BusinessMembersTypeId = (
              Enums.CorporationBusinessMembers as any
            )[
              businessCreateRequest.SigningAuthority.BusinessMemberType
            ].toString();
            break;
          case "5":
            business.Form94xDetails.BusinessMembersTypeId = (
              Enums.ExemptOrganizationBusinessMembers as any
            )[
              businessCreateRequest.SigningAuthority.BusinessMemberType
            ].toString();
            break;
          case "7":
            business.Form94xDetails.BusinessMembersTypeId = (
              Enums.SoleProprietorshipBusinessMembers as any
            )[
              businessCreateRequest.SigningAuthority.BusinessMemberType
            ].toString();
            break;
        }
      }
    }

    if (businessCreateRequest.KindOfEmployer) {
      const kindOfEmployer = utility.removeSpecialChars(
        businessCreateRequest.KindOfEmployer
      );
      if ((Enums.KindOfEmployer as any)[kindOfEmployer.toUpperCase()]) {
        business.KindOfEmployer = kindOfEmployer.toUpperCase();
      }
    }

    if (businessCreateRequest.KindOfPayer) {
      const kindOfPayer = utility.removeSpecialChars(
        businessCreateRequest.KindOfPayer
      );
      if ((Enums.KindOfPayer as any)[kindOfPayer.toUpperCase()]) {
        business.KindOfPayer = kindOfPayer.toUpperCase();
      }
    }

    // if (businessCreateRequest.FormId === FormType.FormTypeC) {
    //     business.ACAIsGovernmentalUnit = businessCreateRequest.ACADetails.IsGovernmentalUnit;
    // } else {
    //     business.ACAIsGovernmentalUnit = false;
    // }

    business.ContactName = businessCreateRequest.ContactNm || "";
    business.ContactLastName = businessCreateRequest.ContactLastNm || "";
    business.IsLastTaxYear = businessCreateRequest.IsBusinessTerminated;

    if (businessCreateRequest.SigningAuthority) {
      business.Form94xDetails = business.Form94xDetails || ({} as any);
      business.Form94xDetails.DayTimePhone =
        utility.getFormattedFaxOrPhoneNumber(
          businessCreateRequest.SigningAuthority.Phone
        );
      business.Form94xDetails.SigningAuthorityName =
        businessCreateRequest.SigningAuthority.Name;
    }

    business.ReferenceNumber = businessCreateRequest.PayerRef;

    if (businessCreateRequest.Form1099KSpecificFields) {
      business.FilerIndicatorPayer =
        businessCreateRequest.Form1099KSpecificFields.FilerIndicator || "";
      business.IsPSESameAsPayers = utility.getBool(
        businessCreateRequest.Form1099KSpecificFields.IsPSESameAsPayer
      );
      if (businessCreateRequest.Form1099KSpecificFields.PSEDetails) {
        business.PSEName =
          businessCreateRequest.Form1099KSpecificFields.PSEDetails.PSEName ||
          "";
        business.PSEPhone =
          businessCreateRequest.Form1099KSpecificFields.PSEDetails.PSEPhone ||
          "";
      }
    }

    if (businessCreateRequest.Form1042SDetails) {
      business.Form1042sDetails =
        {} as AddressBookRequest.Form1042sBusinessDetails;
      business.Form1042sDetails.Ch3StatusCode =
        businessCreateRequest.Form1042SDetails.WHAgtCh3Cd;
      business.Form1042sDetails.Ch4StatusCode =
        businessCreateRequest.Form1042SDetails.WHAgtCh4Cd;
      business.Form1042sDetails.WithHoldingGIIN =
        businessCreateRequest.Form1042SDetails.WHAgtGIIN;
      business.Form1042sDetails.WithHoldingFTIN =
        businessCreateRequest.Form1042SDetails.FTIN;
    }

    return business;
  }

  async updateState(
    req: Request.UpdateRequest,
    userDetails: UserDetail
  ): Promise<Response.StateWHUpdateResponse | null> {
    const response: Response.StateWHUpdateResponse = {
      StatusCode: "",
      StatusName: "",
      StatusMessage: "",
      SubmissionId: "",
      SuccessRecords: [],
      ErrorRecords: [],
      Errors: [],
    };

    if (
      req.SubmissionId != null &&
      req.SubmissionId != undefined &&
      req.SubmissionId != "00000000-0000-0000-0000-000000000000"
    ) {
      // Inside your service/controller method
      const submissionRecords =
        await this.commonRepository.CheckIsValidSubmissionId(
          req.SubmissionId,
          userDetails.userId
        );
      let index = 0;
      let isAPIReturns = false;
      let savedReturn: BaseModels.ApiReturn | null = null;
      if (submissionRecords && submissionRecords.length > 0) {
        for (const record of req.StateWHRecords) {
          let recordErrors: BaseModels.Error[] = [];
          // Check valid RecordId
          const matchingRecord = submissionRecords.find(
            (r: any) => r.RecordId == record.RecordId
          );

          if (matchingRecord) {
            if (matchingRecord.RecordStatus !== "TRANSMITTED") {
            } else {
              const err = await this.getErrorById("S00-000187");
              if (err) recordErrors.push(err);
            }
          } else if (record.RecordId) {
            const err = await this.getErrorById("S00-000099");
            if (err) recordErrors.push(err);
          }
          // Validate Qtr
          if (!record.ReturnHeader?.Qtr) {
            const err = await this.getErrorById("S00-000166");
            if (err) recordErrors.push(err);
          } else if (!RegexPatterns.QTR_REGEX.test(record.ReturnHeader.Qtr)) {
            const err = await this.getErrorById("S00-000165");
            if (err) recordErrors.push(err);
          }

          // Validate TaxYr
          if (!record.ReturnHeader?.TaxYr) {
            const err = await this.getErrorById("S00-000167");
            if (err) recordErrors.push(err);
          } else if (
            !RegexPatterns.TAXYEAR_REGEX.test(record.ReturnHeader.TaxYr)
          ) {
            const err = await this.getErrorById("S00-000168");
            if (err) recordErrors.push(err);
          }

          //#region Validate Business
          const err = await this.apiBusinessService.ValidateBusiness(
            record.ReturnHeader.Business,
            index.toString(),
            userDetails
          );
          if (err && err.length > 0) recordErrors.push(...err);
          //#endregion

          //#region Validate Tax year and Quarter
          const taxYrErr = await this.validateTaxYearAndQuarter(
            record.ReturnHeader.TaxYr,
            record.ReturnHeader.Qtr,
            userDetails.addressbookToken,
            index.toString()
          );
          if (taxYrErr && taxYrErr.length > 0) recordErrors.push(...taxYrErr);

          //#region Validate Sequence
          const seqErr = await this.validateSequence(
            record.Sequence,
            index.toString()
          );
          if (seqErr && seqErr.length > 0) recordErrors.push(...seqErr);

          const dupSeqErr = await this.duplicateSequenceValidation(
            req,
            index.toString()
          );
          if (dupSeqErr && dupSeqErr.length > 0)
            recordErrors.push(...dupSeqErr);
          let formId = 0;
          let formType = "";

          //#region Validate Form Details
          if (recordErrors == null || recordErrors.length == 0) {
            if (req.FormType?.toUpperCase() === "SCWH") {
              if (
                record.ReturnData.FormSC1605 != null &&
                record.ReturnData.FormSC1605 != undefined
              ) {
                formId = Enums.FormType.WH1605;
                formType = "SC1605";
              } else if (
                record.ReturnData.FormSC1606 != null &&
                record.ReturnData.FormSC1606 != undefined
              ) {
                formId = Enums.FormType.WH1606;
                formType = "SC1606";
              }
            }
            else {
              if (
                record.ReturnData.FormSC1605 != null &&
                record.ReturnData.FormSC1605 != undefined
              ) {
                formId = Enums.FormType.WH1605;
                formType = "SC1605";
              } else if (
                record.ReturnData.FormSC1606 != null &&
                record.ReturnData.FormSC1606 != undefined
              ) {
                formId = Enums.FormType.WH1606;
                formType = "SC1606";
              }
            }
            if (
              record.RecordId == null ||
              record.RecordId == undefined ||
              record.RecordId == "00000000-0000-0000-0000-000000000000"
            ) {
              const isReturnExist = await this.checkReturnExists(
                record.ReturnHeader.TaxYr,
                record.ReturnHeader.Qtr,
                record.ReturnHeader.Business.BusinessId,
                record.ReturnHeader.Business.EINorSSN,
                formId,
                userDetails.addressbookToken
              );
              if (isReturnExist) {
                recordErrors.push(
                  await this.commonRepository.getErrorById("S00-000190")
                );
              }
            }
            if (record.ReturnData != null) {
              const err = await this.formSCService.ValidateFormSCWHDetails(
                record.ReturnData,
                record.ReturnHeader.Qtr
              );
              if (err && err.length > 0) recordErrors.push(...err);
            }
          }
          //#endregion
          index++;
          // Decide if it’s an error or success record
          if (recordErrors.length > 0) {
            if (!response.ErrorRecords) {
              response.ErrorRecords = [];
            }
            // Only set in ErrorRecords, no direct push to response.Errors
            response.ErrorRecords.push({
              SequenceId: record.Sequence,
              RecordId: record.RecordId,
              Errors: recordErrors,
            });
            continue;
          } else {
            SaveBusiness = await this.AssignBusinessDetails(
              record.ReturnHeader.Business
            );
            SaveBusiness.UserId = userDetails.userId;
            const BusinessDetailsSaveResponse =
              await this.apiAddressBookService.saveAndUpdateBusinessDetail(
                SaveBusiness,
                userDetails.addressbookToken
              );
            if (
              BusinessDetailsSaveResponse &&
              BusinessDetailsSaveResponse.BusinessId
            ) {
              record.ReturnHeader.Business.BusinessId = utility.getGuid(
                BusinessDetailsSaveResponse.BusinessId
              );

              //#region Save Logics
              if (!isAPIReturns) {
                const apiReturnData: BaseModels.ApiReturn = {
                  submissionId: req.SubmissionId,
                  userId: userDetails.userId,
                  formId: formId,
                  apiReturnId: 0,
                };
                savedReturn = await this.commonRepository.saveApiReturn(
                  apiReturnData
                );
                isAPIReturns = true;
                response.SubmissionId = apiReturnData.submissionId.toString();
              }
              if (savedReturn != null && savedReturn.apiReturnId > 0) {
                //#region API Return Records Save Logics

                let returnId =
                  matchingRecord && matchingRecord?.ReturnId
                    ? matchingRecord?.ReturnId
                    : "";
                let returnunqid =
                  matchingRecord && matchingRecord?.ReturnUniqueId
                    ? matchingRecord?.ReturnUniqueId
                    : "";
                let responseData = await this.formSCService.saveFormSCWHDetails(
                  record,
                  userDetails.addressbookToken,
                  formId.toString(),
                  returnId,
                  returnunqid
                );

                if (
                  responseData &&
                  responseData.Response &&
                  utility.getLong(responseData.Response.ReturnId) > 0
                ) {
                  const apiReturnRecordsData: BaseModels.ApiReturnRecords = {
                    apiReturnId: savedReturn.apiReturnId,
                    returnId: utility.getLong(responseData.Response.ReturnId),
                    formId: formId,
                    recordStatus: "CREATED",
                    businessId: BusinessDetailsSaveResponse.BusinessId,
                    Sequence: record.Sequence,
                    formGroupId: 4,
                    returnUniqueId: responseData.Response.ReturnUniqueId,
                    apiReturnRecordId:
                      record.RecordId != null &&
                      record.RecordId != undefined &&
                      record.RecordId != "00000000-0000-0000-0000-000000000000"
                        ? record.RecordId
                        : uuid(), // <-- Add the actual value here
                  };

                  const savedReturnRecord =
                    await this.commonRepository.saveApiReturnRecords(
                      apiReturnRecordsData
                    );
                  if (savedReturnRecord?.apiReturnRecordId) {
                    // If no new errors → add to SuccessRecords
                    response.SuccessRecords ??= []; // if null/undefined, set as []
                    response.SuccessRecords.push({
                      SequenceId: record.Sequence,
                      BusinessId: BusinessDetailsSaveResponse.BusinessId,
                      PayerRef: record.ReturnHeader.Business.PayerRef || null,
                      RecordId: apiReturnRecordsData.apiReturnRecordId || "",
                      FormType: formType,
                      Status:
                        record.RecordId != null &&
                        record.RecordId != undefined &&
                        record.RecordId !=
                          "00000000-0000-0000-0000-000000000000"
                          ? "UPDATED"
                          : "CREATED",
                      StatusTs:
                        getIRSDateTimeFormat(
                          savedReturnRecord.UpdateTimeStamp!
                        ) ?? "",
                      Info: null,
                      Errors: null,
                    });

                    //#endregion
                  } else {
                    if (!response.ErrorRecords) {
                      response.ErrorRecords = [];
                    }
                    const err = await this.getErrorById("S00-000170");
                    if (err) recordErrors.push(err);

                    response.ErrorRecords.push({
                      SequenceId: record.Sequence,
                      RecordId: record.RecordId,
                      Errors: recordErrors,
                    });
                    continue;
                  }
                } else {
                  if (!response.ErrorRecords) {
                    response.ErrorRecords = [];
                  }
                  const err = await this.getErrorById("S00-000170");
                  if (err) recordErrors.push(err);

                  response.ErrorRecords.push({
                    SequenceId: record.Sequence,
                    RecordId: record.RecordId,
                    Errors: recordErrors,
                  });
                  continue;
                }

                //#endregion
              }
            } else if (BusinessDetailsSaveResponse != null) {
              if (!response.ErrorRecords) {
                response.ErrorRecords = [];
              }
              const errors: BaseModels.Error = {
                Id: BusinessDetailsSaveResponse.Messages?.ErrorCode ?? null,
                Message: BusinessDetailsSaveResponse.Messages?.Message ?? null,
                Name: "Business-ERR",
              };
              recordErrors.push(errors);
              response.ErrorRecords.push({
                SequenceId: record.Sequence,
                RecordId: record.RecordId,
                Errors: recordErrors,
              });
              continue;
            } else {
              if (!response.ErrorRecords) {
                response.ErrorRecords = [];
              }
              const err = await this.getErrorById("S00-000170");
              if (err) recordErrors.push(err);

              response.ErrorRecords.push({
                SequenceId: record.Sequence,
                RecordId: record.RecordId,
                Errors: recordErrors,
              });
              continue;
            }
          }
        }
      } else {
        response.Errors = response.Errors || [];
        response.Errors.push(
          await this.commonRepository.getErrorById("S00-000098")
        );
      }
    } else {
      response.Errors = response.Errors || [];
      response.Errors.push(
        await this.commonRepository.getErrorById("S00-000097")
      );
    }
    //#region Response Status Handling
    if (
      response.ErrorRecords != null &&
      !response.ErrorRecords.length &&
      response.SuccessRecords != null &&
      response.SuccessRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.Ok.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.Ok];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.Ok];
      response.ErrorRecords = null;
      response.Errors = null;
    } else if (
      response.SuccessRecords != null &&
      !response.SuccessRecords.length &&
      response.ErrorRecords != null &&
      response.ErrorRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.BadRequest.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.BadRequest];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.BadRequest];
      response.SubmissionId = null;
      response.SuccessRecords = null;
      response.Errors = null;
    } else if (
      response.SuccessRecords != null &&
      response.SuccessRecords.length &&
      response.ErrorRecords != null &&
      response.ErrorRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.MultiStatus.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.MultiStatus];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.MultiStatus];

      response.Errors = response.Errors || [];
      response.Errors.push(
        await this.commonRepository.getErrorById("S00-000184")
      );
    }

    // Nullify Response if both success & error are empty
    if (
      response.ErrorRecords != null &&
      !response.ErrorRecords.length &&
      response.SuccessRecords != null &&
      !response.SuccessRecords.length
    ) {
      response.StatusCode = Enums.ResponseStatusCode.BadRequest.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.BadRequest];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.BadRequest];
    }
    //#endregion

    return response;
  }

  //#region Validate Business

  async GetState(
    req: Request.StateWHGetRequest,
    userDetails: UserDetail
  ): Promise<Response.StateWHGetResponse> {
    const errors: BaseModels.Error[] = [];

    const response: Response.StateWHGetResponse = {
      StatusCode: "",
      StatusName: "",
      StatusMessage: "",
      SubmissionId: "",
      StateWHRecords: [],
      Errors: [],
    };
    req.SubmissionId = utility.getGuid(req.SubmissionId).toString();

    const isValidsubmissionId: Boolean | null =
      await this.commonRepository.CheckOnlyValidSubmissionId(
        req.SubmissionId,
        userDetails.userId
      );
    if (isValidsubmissionId === true) {
      let isValid: Boolean | null = null;

      if (req.RecordId) {
        req.RecordId = utility.getGuid(req.RecordId).toString();

        isValid = await this.commonRepository.CheckIsValidSubmissionIdAndRecord(
          req.SubmissionId,
          userDetails.userId,
          req.RecordId
        );
      } else {
        isValid = true;
      }
      if (isValid === true) {
        let recordDetails = await this.commonRepository.GetReturnUniqueIds(
          req.SubmissionId,
          userDetails.userId,
          req.RecordId
        );

        
        

        const promises = recordDetails.map((item) => {
  let url = `${config.StatesApiUrl}${Constants.GetStateDetails}${item.returnUniqueId}`;
  return {
    sequenceId: item.sequenceId,
    recordId: item.recordId,
    promise: this.commonRepository.GetFormDetails<Response.StateWHGetResponse>(
      url,
      userDetails.addressbookToken
    )
  };
});

        try {
          
  const responses = await Promise.all(promises.map(p => p.promise));

  for (let i = 0; i < responses.length; i++) {
const resp = responses[i];
    const meta = promises[i];

            if (resp) {
              const mapped = await this.mapApiResponseToStateWH(
                resp,
                userDetails
              );
    mapped.StateWHRecords?.forEach(r => {
        r.RecordId = meta.recordId;
        r.Sequence = meta.sequenceId.toString();
      });

              response.StateWHRecords?.push(...(mapped.StateWHRecords ?? []));

              // optional: update top-level status
              response.StatusCode = mapped.StatusCode;
              response.StatusName = mapped.StatusName;
              response.StatusMessage = mapped.StatusMessage;
              response.SubmissionId = req.SubmissionId;

              response.Errors = null;
            }
          }
        } catch (error) {
          console.log("Error while fetching form details", error);
        }
      } else {
        errors.push(await this.commonRepository.getErrorById("S00-000099"));
        response.StatusCode = Enums.ResponseStatusCode.BadRequest.toString();
        response.StatusName =
          Enums.ResponseStatusCode[Enums.ResponseStatusCode.BadRequest];
        response.StatusMessage =
          Enums.ResponseStatusDescription[Enums.ResponseStatusCode.BadRequest];
        response.Errors = errors;
        response.StateWHRecords = null;
        response.SubmissionId = null;
        return response;
      }
    } else {
      errors.push(await this.commonRepository.getErrorById("S00-000098"));

      response.StatusCode = Enums.ResponseStatusCode.BadRequest.toString();
      response.StatusName =
        Enums.ResponseStatusCode[Enums.ResponseStatusCode.BadRequest];
      response.StatusMessage =
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.BadRequest];
      response.StateWHRecords = null;
      response.Errors = errors;
      response.SubmissionId = null;

      return response;
    }

    return response;
  }
  //#endregion

  //#region Quarter and Taxyear validation
  async validateTaxYearAndQuarter(
    taxYear: string,
    quarterId: string,
    token: string,
    index: string
  ): Promise<BaseModels.Error[] | null> {
    let errors: BaseModels.Error[] = [];

    const validTaxYear = config.SupportedTaxYear;

    if (validTaxYear.includes(taxYear) && taxYear != "") {
      // Check if quarter exists and is not empty/whitespace
      if (!utility.IsNullOrWhiteSpace(quarterId) && quarterId != "") {
        let url = `${config.StatesApiUrl}${Constants.GetQuarterDetails}${quarterId}&taxYear=${taxYear}`;
        const fetchQuarterDetails =
          await this.commonRepository.GetFormDetails<Response.QuarterResponse>(
            url,
            token
          );

        if (fetchQuarterDetails && fetchQuarterDetails != null) {
          if (fetchQuarterDetails.Status?.toLowerCase() != "success") {
            errors.push(
              await this.commonRepository.getErrorNameById("S00-000165", index)
            );
          }
        }
      } else {
        errors.push(
          await this.commonRepository.getErrorNameById("S00-000166", index)
        );
      }
    } else {
      // Check if TaxYr exists and is not empty/whitespace
      if (utility.IsNullOrWhiteSpace(taxYear)) {
        errors.push(
          await this.commonRepository.getErrorNameById("S00-000167", index)
        );
      } else {
        errors.push(
          await this.commonRepository.getErrorNameById("S00-000168", index)
        );
      }
    }

    return errors;
  }
  //#endregion

  async mapApiResponseToStateWH(
    response: any,
    userDetails: UserDetail
  ): Promise<Response.StateWHGetResponse> {
    return {
      StatusCode: Enums.ResponseStatusCode.Ok.toString(),
      StatusName: Enums.ResponseStatusCode[Enums.ResponseStatusCode.Ok],
      StatusMessage:
        Enums.ResponseStatusDescription[Enums.ResponseStatusCode.Ok],
      Errors: null,
      SubmissionId: "",

      StateWHRecords: [
        {
          Sequence: "",
          RecordId: "",
          ReturnHeader: {
            Qtr: Enums.Quarters[response.Response?.QuarterId] ?? "",
            TaxYr: response.Response?.TaxYear ?? "",
            Business: await this.mapBusinessDetails<BaseModels.BusinessGet>(
              response.Response,
              response.Response?.BusinessDetails,
              userDetails
            ),
          },
          ReturnData: {
            FormSC1605:
              response.Response?.FormId === 1
                ? GetgeneratedResponseBody<Request.FormSC1605>(
                    response.Response?.DataSchema
                  )
                : null,

            FormSC1606:
              response.Response?.FormId === 2
                ? GetgeneratedResponseBody<Request.FormSC1606>(
                    response.Response?.DataSchema
                  )
                : null,
          },
        },
      ],
    };
  }

  async mapBusinessDetails<T>(
    biz: any,
    details: any,
    userDetails: UserDetail
  ): Promise<T> {
    if (!details) {
      return {} as T;
    }
    const getBusinessRequest: AddressBookRequest.GetBusinessRequest = {
      BusinessId: biz.BusinessId,
      UserId: userDetails.userId,
      IsMaskedTin: false,
    };

    const response = await this.apiAddressBookRepository.requestBusinessAPI<
      AddressBookRequest.GetBusinessRequest,
      AddressBookResponse.GetBusinessResponse
    >(
      "https://tbs-commonapi.stssprint.com/Business/GetBusinessDetailById",
      getBusinessRequest,
      userDetails.addressbookToken
    );

    let businessDetails = response.BusinessDetails;

    const business: BaseModels.BusinessGet = {
      BusinessId: biz.BusinessId ?? null,
      BusinessNm:
        businessDetails.BusinessTinType.toUpperCase() == "EIN" ||
        utility.IsNullOrWhiteSpace(businessDetails.BusinessLastName)
          ? businessDetails.BusinessName
          : null,
      PayerRef: businessDetails.ReferenceNumber ?? null,
      FirstNm:
        businessDetails.BusinessTinType.toUpperCase() != "EIN" ||
        !utility.IsNullOrWhiteSpace(businessDetails.BusinessLastName)
          ? businessDetails.BusinessName
          : null,
      MiddleNm:
        businessDetails.BusinessTinType.toUpperCase() != "EIN" ||
        !utility.IsNullOrWhiteSpace(businessDetails.BusinessLastName)
          ? businessDetails.BusinessMiddleName
          : null,
      LastNm:
        businessDetails.BusinessTinType.toUpperCase() != "EIN" ||
        !utility.IsNullOrWhiteSpace(businessDetails.BusinessLastName)
          ? businessDetails.BusinessLastName
          : null,
      Suffix:
        businessDetails.BusinessTinType.toUpperCase() != "EIN" ||
        !utility.IsNullOrWhiteSpace(businessDetails.BusinessLastName)
          ? businessDetails.BusinessSuffix
          : null,
      TradeNm: businessDetails.DBAName ?? null,
      IsEIN:
        businessDetails.BusinessTinType.toUpperCase() == "EIN" ? true : false,
      EINorSSN: businessDetails.UnMaskedTin,
      Email: businessDetails.EmailAddress ?? null,
      ContactNm: businessDetails.ContactName ?? null,
      Phone: businessDetails.Phone ?? null,
      PhoneExtn: businessDetails.Form94xDetails
        ? businessDetails.Form94xDetails.PhoneExtension
        : null,
      Fax: businessDetails.Form94xDetails
        ? businessDetails.Form94xDetails.FaxNumber
        : null,
      BusinessType:
        businessDetails.Form94xDetails?.BusinessTypeId != null
          ? Enums.BusinessType[
              Number(businessDetails.Form94xDetails.BusinessTypeId)
            ]
          : null,
      SigningAuthority: !utility.IsNullOrWhiteSpace(
        businessDetails.Form94xDetails?.SigningAuthorityName
      )
        ? {
            Name: businessDetails.Form94xDetails.SigningAuthorityName,
            Phone: businessDetails.Form94xDetails.DayTimePhone ?? null,
            BusinessMemberType:
              this.GetBusinessMemberType(
                businessDetails?.Form94xDetails?.BusinessMembersTypeId ?? 0,
                businessDetails?.Form94xDetails?.BusinessTypeId ?? 0
              ) ?? "",
          }
        : null,
      KindOfEmployer: businessDetails.KindOfEmployer ?? null,
      KindOfPayer: businessDetails.KindOfPayer ?? null,
      IsBusinessTerminated: businessDetails.IsLastTaxYear ?? false,
      IsForeign: businessDetails.IsForeignAddress ? true : false,
      USAddress: !businessDetails.IsForeignAddress
        ? {
            Address1: businessDetails.Address1 ?? null,
            Address2: businessDetails.Address2 ?? null,
            City: businessDetails.City ?? null,
            State: businessDetails.StateCode ?? null,
            ZipCd: businessDetails.ZIPCode ?? null,
          }
        : null,
      ForeignAddress: businessDetails.IsForeignAddress
        ? {
            Address1: businessDetails.Address1 ?? null,
            Address2: businessDetails.Address2 ?? null,
            City: businessDetails.City ?? null,
            ProvinceOrStateNm: businessDetails.StateName ?? null,
            Country: businessDetails.CountryCode ?? null,
            PostalCd: businessDetails.ZIPCode ?? null,
          }
        : null,
      ACADetails: null,
    };
    return business as T;
  }

  //#region Quarter and Taxyear validation
  async checkReturnExists(
    taxYear: string,
    quarterId: string,
    businessId: UUID | null,
    ein: string,
    formId: number,
    token: string
  ): Promise<boolean> {
    let response = false;

    let url = `${config.StatesApiUrl}${
      Constants.GetReturnExistsDetails
    }${quarterId}&taxYear=${taxYear}&businessId=${
      businessId ?? ""
    }&formId=${formId}&ein=${ein}`;
    const fetchReturnExistsDetails =
      await this.commonRepository.GetFormDetails<Response.QuarterResponse>(
        url,
        token
      );

    if (fetchReturnExistsDetails && fetchReturnExistsDetails != null) {
      if (
        fetchReturnExistsDetails.Status?.toLowerCase() == "success" &&
        fetchReturnExistsDetails.Response
      ) {
        response = true;
      }
    }

    return response;
  }
  //#endregion

  GetBusinessMemberType(
    memberTypeId: string,
    memberType: string
  ): string | null {
    if (memberTypeId && memberType) {
      switch (memberType.toString()) {
        case "1":
          return Enums.EstateBusinessMembers[utility.getLong(memberTypeId)];
        case "2":
          return Enums.PartnershipBusinessMembers[
            utility.getLong(memberTypeId)
          ];
        case "3":
          return Enums.CorporationBusinessMembers[
            utility.getLong(memberTypeId)
          ];
        case "5":
          return Enums.ExemptOrganizationBusinessMembers[
            utility.getLong(memberTypeId)
          ];
        case "7":
          return Enums.SoleProprietorshipBusinessMembers[
            utility.getLong(memberTypeId)
          ];
        default:
          return null;
      }
    } else {
      return null;
    }
  }

  async GetBusinessDetails<T>(bizID: string, userDetails: UserDetail): Promise<T | null> {
    const getBusinessRequest: AddressBookRequest.GetBusinessRequest = {
      BusinessId: bizID,
      UserId: userDetails.userId,
      IsMaskedTin: false,
    };

    const response = await this.apiAddressBookRepository.requestBusinessAPI<
      AddressBookRequest.GetBusinessRequest,
      AddressBookResponse.GetBusinessResponse
    >(
      Constants.GetBusinessDetailById,
      getBusinessRequest,
      userDetails.addressbookToken
    );

    const businessDetails = response?.BusinessDetails ?? {} as AddressBookResponse.GetBusinessResponse;
 
    if(businessDetails?.BusinessId){
      const business: BaseModels.Business = {
        BusinessId: utility.getGuid(bizID),
        BusinessNm: businessDetails?.BusinessTinType?.toUpperCase() === "EIN" || utility.IsNullOrWhiteSpace(businessDetails?.BusinessLastName)
          ? businessDetails?.BusinessName ?? null
          : "",
        PayerRef: businessDetails?.ReferenceNumber ?? null,
        FirstNm: businessDetails?.BusinessTinType?.toUpperCase() !== "EIN" || !utility.IsNullOrWhiteSpace(businessDetails?.BusinessLastName)
          ? businessDetails?.BusinessName ?? null
          : "",
        MiddleNm: businessDetails?.BusinessTinType?.toUpperCase() !== "EIN" || !utility.IsNullOrWhiteSpace(businessDetails?.BusinessLastName)
          ? businessDetails?.BusinessMiddleName ?? null
          : "",
        LastNm: businessDetails?.BusinessTinType?.toUpperCase() !== "EIN" || !utility.IsNullOrWhiteSpace(businessDetails?.BusinessLastName)
          ? businessDetails?.BusinessLastName ?? null
          : "",
        Suffix: businessDetails?.BusinessTinType?.toUpperCase() !== "EIN" || !utility.IsNullOrWhiteSpace(businessDetails?.BusinessLastName)
          ? businessDetails?.BusinessSuffix ?? null
          : "",
        TradeNm: businessDetails?.DBAName ?? null,
        IsEIN: businessDetails?.BusinessTinType?.toUpperCase() === "EIN",
        EINorSSN: businessDetails?.UnMaskedTin ?? null,
        Email: businessDetails?.EmailAddress ?? null,
        ContactNm: businessDetails?.ContactName ?? null,
        Phone: businessDetails?.Phone ?? null,
        PhoneExtn: businessDetails?.Form94xDetails?.PhoneExtension ?? null,
        Fax: businessDetails?.Form94xDetails?.FaxNumber ?? null,
        BusinessType: businessDetails?.Form94xDetails
          ? Enums.BusinessType[Number(businessDetails.Form94xDetails.BusinessTypeId)] ?? null
          : "",
        SigningAuthority: !utility.IsNullOrWhiteSpace(businessDetails?.Form94xDetails?.SigningAuthorityName)
          ? {
            Name: businessDetails?.Form94xDetails?.SigningAuthorityName ?? null,
            Phone: businessDetails?.Form94xDetails?.DayTimePhone ?? null,
            BusinessMemberType: this.GetBusinessMemberType(
              businessDetails?.Form94xDetails?.BusinessMembersTypeId ?? 0,
              businessDetails?.Form94xDetails?.BusinessTypeId ?? 0
            ) ?? "",
          }
          : {} as BaseModels.SigningAuthority,
        KindOfEmployer: businessDetails?.KindOfEmployer ?? null,
        KindOfPayer: businessDetails?.KindOfPayer ?? null,
        IsBusinessTerminated: businessDetails?.IsLastTaxYear ?? false,
        IsForeign: businessDetails?.IsForeignAddress ?? false,
        USAddress: !businessDetails?.IsForeignAddress
          ? {
            Address1: businessDetails?.Address1 ?? null,
            Address2: businessDetails?.Address2 ?? null,
            City: businessDetails?.City ?? null,
            State: businessDetails?.StateCode ?? null,
            ZipCd: businessDetails?.ZIPCode ?? null,
            Country: businessDetails?.CountryCode ?? null,
            StateType: {} as Enums.StateType,
          }
          : {} as BaseModels.USAddress,
        ForeignAddress: businessDetails?.IsForeignAddress
          ? {
            Address1: businessDetails?.Address1 ?? null,
            Address2: businessDetails?.Address2 ?? null,
            City: businessDetails?.City ?? null,
            ProvinceOrStateNm: businessDetails?.StateName ?? null,
            Country: businessDetails?.CountryCode ?? null,
            PostalCd: businessDetails?.ZIPCode ?? null,
            CountryType: businessDetails?.CountryCode ?? null,
          }
          : {} as BaseModels.ForeignAddress,
        IsDGE: false,
        StaffUserId: "",
        IsSageUser: false,
        IsSkipValidation: false,
        IsNota1099Flow: false,
        StatusTS: "",
        ACAReturnPayerId: 0,
        ACAReturnId: 0,
        ContactLastNm: "",
        IsOnlineAccess: false,
        ACADetails: {} as BaseModels.ACAAdditionalDetails,
        PayerAccNum: "",
        Form1042SDetails: {
          WHAgtCh3Cd: businessDetails?.Form1042sDetails?.Ch3StatusCode ?? null,
          WHAgtCh4Cd: businessDetails?.Form1042sDetails?.Ch4StatusCode ?? null,
          WHAgtGIIN: businessDetails?.Form1042sDetails?.WithHoldingGIIN ?? null,
          FTIN: businessDetails?.Form1042sDetails?.WithHoldingFTIN ?? null,
          Country: "",
        },
        Form1099KSpecificFields:
          businessDetails?.IsPSESameAsPayers ||
            businessDetails?.FilerIndicatorPayer ||
            businessDetails?.PSEName ||
            businessDetails?.PSEPhone
            ? {
              FilerIndicator: businessDetails?.FilerIndicatorPayer ?? null,
              IsPSESameAsPayer: businessDetails?.IsPSESameAsPayers ?? null,
              PSEDetails: {
                PSEName: businessDetails?.PSEName ?? null,
                PSEPhone: businessDetails?.PSEPhone ?? null,
              },
            }
            : {} as BaseModels.Form1099KSpecificFields,
      };
      return business as T;
    }
    return null;
  }
}

function getIRSDateTimeFormat(date: Date): string {
  const pad = (num: number, size: number = 2) =>
    String(num).padStart(size, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Timezone offset
  const offsetMinutes = date.getTimezoneOffset();
  const sign = offsetMinutes > 0 ? "-" : "+";
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetMins = pad(Math.abs(offsetMinutes) % 60);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${sign}${offsetHours}:${offsetMins}`;
}
