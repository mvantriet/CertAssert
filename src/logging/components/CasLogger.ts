import {ICasLogger, CasLogLevel} from "../interfaces/ICasLogger";

export class CasLogger implements ICasLogger {

    static DEFAULT_LOG_LEVEL: CasLogLevel = CasLogLevel.INFO;

    private logLevel: CasLogLevel;

    constructor(logLevel?: CasLogLevel) {
        this.logLevel = (logLevel) ? logLevel : CasLogger.DEFAULT_LOG_LEVEL;
    }

    log(message: string, logLevel?: CasLogLevel): void {
        let appliedLogLevel = (logLevel) ? logLevel : CasLogger.DEFAULT_LOG_LEVEL;
        if (appliedLogLevel <= this.logLevel) {
            console.log(new Date(), ' ', CasLogLevel[appliedLogLevel], ' ', message);
            return;
        }
        // TODO :: Consider dead-letter
    }
}