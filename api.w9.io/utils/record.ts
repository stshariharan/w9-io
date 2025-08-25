import { ResponseStatusCode } from "./enum";

export const ResponseStatusDisplay: Record<ResponseStatusCode, string> = {
  [ResponseStatusCode.Ok]: "Successful API call",
  [ResponseStatusCode.MultiStatus]:
    "Multiple statuses are available for the request",
  [ResponseStatusCode.BadRequest]: "Validation error has occurred",
  [ResponseStatusCode.Unauthorized]: "Invalid authorization credentials",
  [ResponseStatusCode.CreditsNotSufficient]:
    "The Credit in your account is not sufficient to transmit all requested records",
  [ResponseStatusCode.Forbidden]: "Permission Denied",
  [ResponseStatusCode.MethodNotAllowed]:
    "The request method (POST or GET) is not allowed on the requested resource",
  [ResponseStatusCode.NotFound]:
    "The resource you have specified cannot be found",
  [ResponseStatusCode.UnsupportedMediaType]:
    "The Media Type you have specified is Unsupported",
  [ResponseStatusCode.RequestLimitExceeded]:
    "The API rate limit for your account has exceeded. You can only send a maximum of @@RequestCount requests per minute. Please send the next request after 10 seconds",
  [ResponseStatusCode.InternalServerError]:
    "Some error occurred with this API call. Please contact system administrator",
  [ResponseStatusCode.NotAvailable]:
    "API is currently unavailable – typically due to a scheduled outage – try again soon",
  [ResponseStatusCode.InvalidDomain]: "Invalid Referer Value",
  [ResponseStatusCode.RequiredDomain]: "Referer Value Required",
  [ResponseStatusCode.PartnerUserAccessToken]:
    "Invalid Partner User Access Token",
  [ResponseStatusCode.InvalidIp]: "Invalid Ip Address",
};
