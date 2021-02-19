import styled from 'styled-components'

export type CasConsentViewStyledProps = {
    authorised: boolean
}

const CasConsentViewStyled = styled.div<CasConsentViewStyledProps>`

font-family: 'PT Sans', sans-serif;
font-size: 12pt;
color: #3b4351;
background-color: white;

h4 {
    font-size: 18pt;
    font-weight: bold;
}

.consent-content {
    padding-left: 10px;
    padding-bottom: 20px;
}

.status-label {
    font-size: 14pt;
}

.action-buttons {
    margin-top: 40px;
}

.authorization-state {
    font-size: 14pt;
    font-weight: bold;
    color: ${(props) => props.authorised ? 'green' : 'red'};
}

.consent-details {
    margin-top: 20px;
    padding-left: 10px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    border-radius: 5px;
}

#ca-consent-btn {
    margin-top: 10px;
}

#ca-abort-btn {
    margin-top: 10px;
}

.horizontal-divider {
    border-top: .05rem solid #eaeded;
    height: .1rem;
    width: 100%;
}

.consent-question-label {
    font-size: 14pt;
    font-style: italic;
    color: #5755d9;
}

.consent-client-label {
    color: red;
    font-style: normal;
}

`
export default CasConsentViewStyled;
