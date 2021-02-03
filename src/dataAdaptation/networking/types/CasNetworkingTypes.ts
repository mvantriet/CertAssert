// Extend Express namespace
declare global {
    namespace Express {
        interface Request {
            client: RequestClient;
        }
    }
}

export type RequestClient = {
    authorized: boolean
}