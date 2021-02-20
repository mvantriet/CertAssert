export type InteractionsStaticConstantsType = {
    signinPath: string,
    consentPath: string,
    errorPath: string,
    logoutPath: string
}

export const InteractionsStaticConstants: InteractionsStaticConstantsType = {
    signinPath: '/signin/:uid',
    consentPath: '/consent/:uid',
    errorPath: '/error',
    logoutPath: '/logout/:uid'
}