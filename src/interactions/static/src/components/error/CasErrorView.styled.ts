import styled from 'styled-components'

export type CasErrorViewStyledProps = {
}

const CasErrorViewStyled = styled.div<CasErrorViewStyledProps>`

font-family: 'PT Sans', sans-serif;
font-size: 12pt;
color: #3b4351;
background-color: white;

h4 {
    font-size: 18pt;
    font-weight: bold;
}

.error-content {
    padding-left: 10px;
    padding-bottom: 20px;
    width: 400px;
}

.error-details {
    margin-top: 20px;
    padding-left: 10px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    border-radius: 5px;
}

.error-description {
    width: 300px;
    word-wrap: break-word;
}

.horizontal-divider {
    border-top: .05rem solid #eaeded;
    height: .1rem;
    width: 100%;
}

.error-label {
    font-size: 14pt;
    font-style: italic;
    color: #5755d9;
}

`
export default CasErrorViewStyled;
