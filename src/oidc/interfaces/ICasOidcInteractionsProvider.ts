import {Request, Response} from 'express';

export type CasOidcInteractionDetails = {
    prompt: {
        name: string,
        details?: {
            scopes?: {
                new: Array<string>,
                accepted: Array<string>,
                rejected: Array<string>
            },
            claims?: {
                new: Array<string>,
                accepted: Array<string>,
                rejected: Array<string>
            }
        }
    },
    params?: {
        client_id?: string
    },
    uid: string,
}

export interface ICasOidcInteractionsProvider {
    getInteractionDetails(req: Request, resp: Response): Promise<CasOidcInteractionDetails>;
    finishInteraction(req: Request, resp: Response, result: any, mergeWithLastSubmission: boolean): Promise<void>;
}