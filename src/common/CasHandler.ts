import { CasComponent } from './CasComponent';
import { ICasLogger } from '../logging/interfaces/ICasLogger';
import { ICasDb } from '../db/interfaces/ICasDb';

export abstract class CasHandler extends CasComponent {

    protected db:ICasDb;

    constructor(db: ICasDb, logger: ICasLogger) {
        super(logger);
        this.db = db;
    }

}