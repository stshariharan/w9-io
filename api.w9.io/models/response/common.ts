import * as baseModels from "../basemodels/baseModels";

export interface ApiMiddlewareResponse {
  StatusCode: Number;
  StatusMessage: String;
  StatusName: String;
  Errors?: baseModels.Error[];
}
