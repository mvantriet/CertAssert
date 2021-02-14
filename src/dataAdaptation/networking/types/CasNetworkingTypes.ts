import { CasCert } from "../../../model/CasCert";
// Extend Express namespace
declare global {
    namespace Express {
        interface Request {
            client: RequestClient,
            cas: RequestCasExtensions
        }
    }
}

export type RequestCasExtensions = {
    clientCertificate?: CasCert.ClientCert
}

export type RequestClient = {
    authorized: boolean
}