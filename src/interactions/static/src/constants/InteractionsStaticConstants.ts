export type InteractionsStaticConstantsType = {
    signinPath: string
    consentPath: string
}

export const InteractionsStaticConstants: InteractionsStaticConstantsType = {
    signinPath: '/signin/:uid',
    consentPath: '/consent/:uid'
}