import * as styled from 'styled-components'

export type CasLoginViewStyledProps = {
    authorised: boolean
}

const CasLoginViewStyled = styled.default.div<CasLoginViewStyledProps>`
    h1 {
        color: ${props => props.authorised ? 'green' : 'red'};
    };
`
export default CasLoginViewStyled;
