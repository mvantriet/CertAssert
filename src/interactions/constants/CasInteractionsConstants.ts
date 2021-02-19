type CasInteractionsConstantsType = {
    prefix: string,
    interactionPath: string,
    loginPath: string,
    abortPath: string,
    continuePath: string,
    confirmPath: string
}

export const CasInteractionsConstants:CasInteractionsConstantsType = {
    prefix: '/interaction',
    interactionPath: '/:uid',
    loginPath: '/:uid/login',
    abortPath: '/:uid/abort',
    continuePath: '/:uid/continue',
    confirmPath: '/:uid/confirm'
}