import {Request, Response, NextFunction} from 'express';
import { CasComponent } from './CasComponent';
import { ICasLogger } from '../logging/interfaces/ICasLogger';
import { ICasDb } from '../db/interfaces/ICasDb';

export abstract class CasHandler extends CasComponent {

    protected db:ICasDb;

    constructor(db: ICasDb, logger: ICasLogger) {
        super(logger);
        this.db = db;
    }

    static disableCache(_req: Request, resp: Response, next: NextFunction): void {
        resp.set('Pragma', 'no-cache');
        resp.set('Cache-Control', 'no-cache, no-store');
        next();
    }
}