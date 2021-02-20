import React from 'react';
import './CasInteractionsApp.css';
import { Route, Switch } from "react-router-dom";
import CasLoginView from "../components/login";
import CasConsentView from "../components/consent";
import CasLogoutView from "../components/logout";
import CasErrorView from '../components/error/CasErrorView';
import { InteractionsStaticConstants} from "../constants/InteractionsStaticConstants";

function CasInteractionsApp() {
  return (
    <div className="CasInteractionsApp">
      <Switch>
        <Route path={InteractionsStaticConstants.signinPath} component={CasLoginView} />
        <Route path={InteractionsStaticConstants.consentPath} component={CasConsentView} />
        <Route path={InteractionsStaticConstants.logoutPath} component={CasLogoutView} />
        <Route path={InteractionsStaticConstants.errorPath} component={CasErrorView} status={404}/>
        <Route path={'/*'} component={CasErrorView} status={404}/>
      </Switch>
    </div>
  );
}

export default CasInteractionsApp;
