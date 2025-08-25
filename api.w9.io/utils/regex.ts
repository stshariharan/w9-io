export const RegexPatterns = {
  BUSINESS_NAME_REGEX: /^[0-9a-zA-Z\s\-\(\)\&\,\.\#'s]+$/,
  NAME_REGEX: /^[0-9a-zA-Z\s\-\(\)\&\,\.\#'s]+$/,
  SPECIAL_CHARS: ["\r", "\t", "\f", "\n", "\b"],
  SEQUENCE_REGEX: /^([a-zA-Z0-9-])+$/,
  TAXYEAR_REGEX: /^\d{4}$/,
  QTR_REGEX: /^[A-Za-z0-9]{2}$/,
  POSTAL_CODE_REGEX: /^[0 - 9a - zA - Z\s -\(\) \&\, \.\/'s] + $/,
  TIN_REGEX: /^\d{9}$/,
  PROVINCE_STATE_REGEX: /^[0-9a-zA-Z\s\-()&#,'.s]+$/,
  CITY_REGEX: /^[a-zA-Z\s\-()&#./'s]+$/,
  FOREIGN_ADDRESS_REGEX: /^[0-9a-zA-Z\s\-()&#,./'s]+$/,
  EMAIL_ADDRESS_REGEX: /^(?:[a-zA-Z0-9+_.-]+(?:\.[a-zA-Z0-9+_.-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/,
  PHONE_NUMBER_REGEX: /^[0-9]+$/,
  PHONE_EXT_REGEX: /^[0-9]+$/,
  FAX_REGEX: /^[0-9]+$/,
  BUSINESS_TYPE_REGEX: /^[A-Za-z]+$/

};
