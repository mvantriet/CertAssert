import { Router } from "express";

export interface ICasRouter {
    
    toExpressRouter(): Router;

}