import {Request, Response} from 'express';

export interface ICasApiHandler {
    handle(req: Request, resp: Response): void;
}