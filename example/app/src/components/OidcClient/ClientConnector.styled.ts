import styled from 'styled-components'

export type ClientConnectorStyledProps = {
}

const ClientConnectorStyled = styled.div<ClientConnectorStyledProps>`
font-family: 'PT Sans', sans-serif;
font-size: 12pt;
color: #3b4351;
background-color: white;
text-align: left;

a {
    font-weight: bold;
    text-decoration: underline;
}

h4 {
    font-size: 14pt;
    font-weight: bold;
}

.bin-label-yes {
    color: green;
}

.bin-label-no {
    color: red;
}


pre {
    white-space: pre-wrap;
}

.status-label {
    font-size: 14pt;
}

.action-buttons {
    margin-top: 40px;
}

.app-details {
    margin-top: 20px;
    padding-left: 10px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    border-radius: 5px;
}

#signin-btn {
    margin-top: 10px;
}

#signout-btn {
    margin-top: 10px;
}

.horizontal-divider {
    border-top: .05rem solid #eaeded;
    height: .1rem;
    width: 100%;
    margin-bottom: 10px;
}

.app-precondition-label {
    font-size: 10pt;
    font-style: italic;
    color: #5755d9;
}
`
export default ClientConnectorStyled;
