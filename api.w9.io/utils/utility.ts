import { RegexPatterns } from "./regex";
import { UnauthorizeReason, CountryType, Quarters } from "./enum";
import config from "../config/env";
import { UUID } from "crypto";
import { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { StateType } from "../utils/enum";
import * as BaseModels from "../models/basemodels/baseModels";

export const utility = {
  RemoveSpecialCharacters(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, "");
  },

  IsValidName(value: string, maxLength: number): boolean {
    if (!value?.trim()) return false;
    if (value.length > maxLength) return false;
    return true;
  },

  IsValidRegexName(value: string, regexformat: RegExp): boolean {
    return regexformat.test(value);
  },

  ContainsSpecialChars(value: string): boolean {
    return RegexPatterns.SPECIAL_CHARS.some((char) => value.includes(char));
  },

  IsNullOrWhiteSpace(value: String | null | undefined): Boolean {
    return value === null || value === undefined || value.trim()?.length === 0;
  },

  // Convert to Guid (just validate UUID in TS)
  getGuid(value: any): UUID {
    const EMPTY_UUID: UUID = "00000000-0000-0000-0000-000000000000";

    if (typeof value === "string") {
      const cleanedValue = value.trim()?.toLowerCase();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(cleanedValue)) {
        return cleanedValue as UUID;
      }
    }

    return EMPTY_UUID;
  },
  // Get Formatted Phone/Fax Number
  getFormattedFaxOrPhoneNumber(value: string): string {
    if (!value?.trim()) return "";
    const number = this.removeSpecialChars(value);
    if (number.length === 10) {
      return `(${number.substring(0, 3)}) ${number.substring(
        3,
        6
      )}-${number.substring(6)}`;
    }
    return value;
  },
  // Get Formatted EIN
  getFormattedApiEIN(EIN: string): string {
    if (!EIN) return "";
    EIN = this.removeSpecialChars(EIN);
    if (EIN.length === 9) {
      return `${EIN.substring(0, 2)}-${EIN.substring(2)}`;
    }
    return EIN;
  },

  // Convert to SSN Format
  getSSNFormattedString(value: string): string {
    if (!value) return "";
    value = this.removeSpecialChars(value);
    if (value.length === 9) {
      return `${value.substring(0, 3)}-${value.substring(
        3,
        5
      )}-${value.substring(5)}`;
    }
    return value;
  },

  // Get Formatted ZipCode
  getFormattedApiZipcd(zipcd: string): string {
    if (!zipcd) return "";
    zipcd = this.removeSpecialChars(zipcd);
    if (zipcd.length > 5) {
      return `${zipcd.substring(0, 5)}-${zipcd.substring(5)}`;
    }
    return zipcd;
  },

  // Remove special characters
  removeSpecialChars(value: string): string {
    if (!value) return "";
    return value.replace(/[,`'"#&;\/:*?<>| \-\(\)_]/g, "").trim();
  },

  getBool(value: unknown): boolean {
    return value != null && value.toString().toLowerCase() === "true";
  },

  getInt(value: unknown): number {
    return value != null && !isNaN(Number(value))
      ? parseInt(value.toString(), 10)
      : 0;
  },

  getDecimal2Digits(value: unknown): number {
    if (value == null || isNaN(Number(value))) return 0;
    return parseFloat(Number(value).toFixed(2));
  },

  getIRSDateTimeFormat(dateTime: Date): string {
    // Format: yyyy-MM-dd HH:mm:ss ±hh:mm
    const pad = (n: number) => n.toString().padStart(2, "0");
    const tzOffset = -dateTime.getTimezoneOffset();
    const sign = tzOffset >= 0 ? "+" : "-";
    const hours = pad(Math.floor(Math.abs(tzOffset) / 60));
    const minutes = pad(Math.abs(tzOffset) % 60);
    return (
      `${dateTime.getFullYear()}-${pad(dateTime.getMonth() + 1)}-${pad(
        dateTime.getDate()
      )} ` +
      `${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}:${pad(
        dateTime.getSeconds()
      )} ${sign}${hours}:${minutes}`
    );
  },

  getFloat(value: unknown): number {
    return value != null && !isNaN(Number(value))
      ? parseFloat(value.toString())
      : 0;
  },

  getShort(value: unknown): number {
    const val = this.getInt(value);
    return val >= -32768 && val <= 32767 ? val : 0;
  },

  getDateTime(value: unknown): Date | null {
    if (value == null) return null;
    const date = new Date(value.toString());
    return isNaN(date.getTime()) ? null : date;
  },

  getLong(value: unknown): number {
    return this.getInt(value);
  },
  RemoveSpecialCharsForPhoneOrFaxForTLS(
    value: string | null | undefined
  ): string {
    if (!value) {
      return "";
    }

    return value
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .replace(/-/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "");
  },
  hasAlphabet(value: string): boolean {
    return /[a-zA-Z]/.test(value);
  },

  IsValidAmount(value: number | string | null): boolean {
    if (value === null || value === undefined) return false;

    const numValue = Number(value);

    // Check if numeric and positive
    if (isNaN(numValue) || numValue < 0) return false;

    const strValue = numValue.toString();

    // Max 11 digits including decimal, max 2 decimal places
    const regex = /^\d{1,9}(\.\d{1,2})?$/;
    return regex.test(strValue);
  },
  getCountryCodeById(id: number | string): string | null {
    const key = Object.keys(CountryType).find(
      (k) => (CountryType as any)[k] === id
    );
    return key ?? null;
  },
 ValidateDateFormat(DateString: string): boolean {
  // Allowed regex formats
  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/dd/yyyy
    /^(\d{2})-(\d{2})-(\d{4})$/,   // MM-dd-yyyy
    /^(\d{1})\/(\d{1,2})\/(\d{4})$/, // M/d/yyyy
    /^(\d{1})-(\d{1,2})-(\d{4})$/,   // M-d-yyyy
  ];

  for (const regex of formats) {
    const match = regex.exec(DateString);

    if (match) {
      // Extract numbers from capture groups
      const [date,monthStr, dayStr, yearStr ] = match;
      let month = Number(monthStr);
      let day = Number(dayStr);
      let year = Number(yearStr);

      // Handle 2-digit years → assume 20xx
      if (yearStr.length === 2) {
        year += 2000;
      }

      const parsedDate = new Date(year, month - 1, day);

      // ✅ check if parsed date matches exactly
      if (
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() === month - 1 &&
        parsedDate.getDate() === day
      ) {
        // return { success: true, date: parsedDate };
        return true;
      }
    }
  }

  // return { success: false, date: null };
  return false;
}
}

/**
 * Returns an appropriate authentication error code string
 */
export const getAuthErrorResponse = (
  reason: UnauthorizeReason,
  isPuatFlow: boolean = false,
  isDropInUIFlow: boolean = false
): string => {
  switch (reason) {
    case UnauthorizeReason.EXPIRED:
      return isPuatFlow
        ? "AUTH-100022"
        : isDropInUIFlow
          ? "AUTH-100044"
          : "AUTH-100018";
    case UnauthorizeReason.JWT_INVALID:
      return "AUTH-100026";
    case UnauthorizeReason.JWT_EMPTY:
      return isPuatFlow ? "AUTH-100023" : "AUTH-100020";
    case UnauthorizeReason.IP_INVALID:
      return "AUTH-100019";
    case UnauthorizeReason.TRANSIENT_TOKEN_EMPTY:
      return "AUTH-100043";
    case UnauthorizeReason.TRANSIENT_TOKEN_INVALID:
      return "AUTH-100042";
    case UnauthorizeReason.USERID_INVALID:
      return "AUTH-100045";
    default:
      return "AUTH-100026"; // Default to invalid JWT
  }
};

//Get Enum Name

export const getEnumName = (enumValue: any, enumData: any) => {
  return enumData[enumValue];
};

/**
 * Generates the final flattened request object for API/DB
 * - Maps FormId, QuarterId, TaxYear, BusinessId from header
 * - Stringifies the Business block into BusinessDetails
 * - Stringifies the first available form into DataSchema
 */
export const generateFlattenedRequest = (
  requestBody: any,
  formId: string,
  returnId: string,
  returnunqid: string,
  stateCode: string
): any => {
  // Extract header + business safely
  const header = requestBody?.ReturnHeader || {};
  const business = header?.Business || {};
  const returnData = requestBody?.ReturnData || {};

  // Pick first non-null ReturnData form.
  let firstForm: any = null;
  for (const key in returnData) {
    if (returnData[key]) {
      firstForm = returnData[key];
      break;
    }
  }

  // Construct the flattened payload
  const flattened = {
    FormId: formId || null, // or map your own ID
    QuarterId:  Quarters[header?.Qtr] || null,
    TaxYear: header?.TaxYr || null,
    BusinessId: utility.getGuid(business?.BusinessId),
    ReturnUniqueId: returnunqid || null,
    StateCode: stateCode, // default fallback
    BusinessDetails: JSON.stringify({
      IsEIN: business?.IsEIN,
      EINorSSN: business?.EINorSSN,
      BusinessNm: business?.BusinessNm,
      TradeNm: business?.TradeNm,
      Country: business?.IsForeign ? business?.ForeignAddress?.Country : "US",
      Address1:
        business?.USAddress?.Address1 || business?.ForeignAddress?.Address1,
      Address2:
        business?.USAddress?.Address2 || business?.ForeignAddress?.Address2,
      City: business?.USAddress?.City || business?.ForeignAddress?.City,
      State:
        business?.USAddress?.State ||
        business?.ForeignAddress?.ProvinceOrStateNm,
      ZipCd: business?.USAddress?.ZipCd || business?.ForeignAddress?.PostalCd,
      ProvinceOrStateNm: business?.ForeignAddress?.ProvinceOrStateNm,
      PostalCd: business?.ForeignAddress?.PostalCd,
      TaxYr: header?.TaxYr,
      Qtr: header?.Qtr,
      BusinessId: header?.BusinessId,
      Email: business?.Email,
      ContactNm: business?.ContactNm,
      Phone: business?.Phone,
      PhoneExtn: business?.PhoneExtn,
      Fax: business?.Fax,
      BusinessType: business?.BusinessType,
      Name: business?.SigningAuthority?.Name,
      BusinessMemberType: business?.SigningAuthority?.BusinessMemberType,
      KindOfEmployer: business?.KindOfEmployer,
      KindOfPayer: business?.KindOfPayer,
      IsBusinessTerminated: business?.IsBusinessTerminated,
    }),
    DataSchema: firstForm ? JSON.stringify(firstForm) : "{}", // stringified form
  };

  return flattened;
};

/**
 * Reconstructs the nested `ReturnData` object by parsing the form data JSON string
 * and attaching it under the given form object name (e.g., "FormSC1605").
 *
 * @param responseBody - The base response object that should contain ReturnData
 * @param objName - The key name under ReturnData (e.g., "FormSC1605", "FormSC1606")
 * @param formData - The JSON string representing the form details
 * @returns The updated responseBody with ReturnData populated
 */
export const generateResponseBody = (
  responseBody: any,
  objName: string,
  formData: string
) => {
  // Validate inputs before modifying the response
  if (responseBody && objName && formData) {
    // Dynamically assign the parsed formData to the specified object key
    // Using [objName] ensures the variable value is used as the property name
    responseBody.ReturnData = {
      [objName]: JSON.parse(formData),
    };
  }

  // Return the updated response object (unchanged if validation failed)
  return responseBody;
};

export function GetgeneratedResponseBody<T>(
  formData: string | object | null
): T {
  if (!formData) {
    // return an empty object cast to type T (so TS won’t complain)
    return {} as T;
  }

  if (typeof formData === "string") {
    return JSON.parse(formData) as T;
  }

  return formData as T;
}



export const getClientIpAddress = (req: FastifyRequest): string => {
  let hostIp: string | undefined;

  // If behind Cloudflare/ELB, use special header to get real client IP
  if (config.IsClfElb) {
    hostIp =
      req.headers["cf-connecting-ip"]?.toString() ||
      req.headers["CF-Connecting-IP"]?.toString() ||
      req.headers["CF-CONNECTING-IP"]?.toString();
  }

  // If not behind Cloudflare or IP not found, fall back to configured header or Fastify's req.ip
  if (!hostIp) {
    hostIp = req.headers[config.ClientIpAddressKey]?.toString() || req.ip;
  }

  return hostIp;
};

export const getUserToken = (req: FastifyRequest): string => {
  try {
    const accessToken = req.headers.authorization
      ?.toString()
      ?.replace("Bearer", "")
      ?.trim();

    if (!accessToken) {
      return "";
    }

    const { aud } = jwt.decode(accessToken) as { aud: string };

    return aud ?? "";
  } catch (error) {
    return "";
  }
};

