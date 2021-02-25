import {RequestHandler} from 'express';


export type ICasRouteHandle = RequestHandler;

export interface ICasApiHandler {
    handle: ICasRouteHandle;
}