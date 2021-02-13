import React from "react";
import { hydrate } from "react-dom";
import { CasLoginView } from "./CasLoginView";
hydrate(<CasLoginView/>, document.getElementById("ssrContainer"));