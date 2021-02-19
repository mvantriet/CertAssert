import React from 'react';
import './CasInteractionsApp.css';
import { Route, Switch } from "react-router-dom";
import CasLoginView from "../components/login";
import CasConsentView from "../components/consent";

import { InteractionsStaticConstants} from "../constants/InteractionsStaticConstants";

function CasInteractionsApp() {
  return (
    <div className="CasInteractionsApp">
      <Switch>
        <Route path={InteractionsStaticConstants.signinPath} component={CasLoginView} />
        <Route path={InteractionsStaticConstants.consentPath} component={CasConsentView} />
      </Switch>
    </div>
  );
}

export default CasInteractionsApp;
