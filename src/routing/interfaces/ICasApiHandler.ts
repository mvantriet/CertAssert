import {Request, Response, NextFunction} from 'express';

export type ICasRouteHandle = (req: Request, resp: Response, next?: NextFunction) => void;

export interface ICasApiHandler {
    handle: ICasRouteHandle;
}