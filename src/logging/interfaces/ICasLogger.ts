export enum CasLogLevel {
    CRITICAL = 1,
    SEVERE = 2,
    INFO = 2,
    DEBUG = 3 
}

export interface ICasLogger {
    log(message: string, logLevel?: CasLogLevel): void;
}