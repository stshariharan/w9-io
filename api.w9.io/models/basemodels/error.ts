export interface DataValidation {
    Status: String;
    Errors: Error[]
}

export interface Error {
    Id: String;
    Name: String;
    Message: String;
}