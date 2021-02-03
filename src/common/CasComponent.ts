import { ICasLogger } from '../logging/interfaces/ICasLogger';

export abstract class CasComponent {

    protected logger: ICasLogger;

    constructor(logger: ICasLogger) {
        this.logger = logger;
    }
}