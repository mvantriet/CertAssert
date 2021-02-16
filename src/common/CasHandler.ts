import {Request, Response, NextFunction, RequestHandler} from 'express';
import { CasComponent } from './CasComponent';
import { ICasLogger } from '../logging/interfaces/ICasLogger';
import { ICasDb } from '../db/interfaces/ICasDb';

export abstract class CasHandler extends CasComponent {

    protected db:ICasDb;

    constructor(db: ICasDb, logger: ICasLogger) {
        super(logger);
        this.db = db;
    }

    public getHandle(): RequestHandler {
        return this.handle.bind(this);
    }

    handle(_req: Request, _resp: Response, _next?:NextFunction): void {
        throw new Error("Abstract, override")
    }

    static disableCache(_req: Request, resp: Response, next: NextFunction): void {
        resp.set('Pragma', 'no-cache');
        resp.set('Cache-Control', 'no-cache, no-store');
        next();
    }
}