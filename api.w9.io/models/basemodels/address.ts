import { StateType } from "../../utils/enum";

export interface USAddress {
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    ZipCd: string;
    Country: string;
    StateType: StateType;
}

export interface ForeignAddress {
    Address1: string;
    Address2: string;
    City: string;
    ProvinceOrStateNm: string;
    Country: string;
    PostalCd: string;
    CountryType: string;
}

export interface StateZipCodeCondition {
    StateZipCodeConditionsId: number;
    StateAbbreviation: string;
    MinZipCode: string;
    MaxZipCode: string;
    EqualZipCode: string;
    IsStateReporting: boolean | null;
    IsDeleted: boolean;
    CreateTimeStamp: Date;
    UpdateTimeStamp: Date;
}
