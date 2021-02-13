import {Request, Response} from 'express';
import { renderToString } from "react-dom/server";
import React from "react";
import hbs from "handlebars";
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import { CasLoginView } from "../views/login/CasLoginView";
import { ServerStyleSheet } from 'styled-components';

export class CasInteractionsHandler extends CasHandler implements ICasApiHandler {
    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    public handle(_req: Request, resp: Response): void {
        const template = `
        <html>
        <head>
        {{{styles}}}
        <title>CertAssert</title>
        </head>
        <body>
        <div id="ssrContainer">{{{ssrContainer}}}</div>
        </body>
        </html>
        `;
        const hbsTemplate = hbs.compile(template);
        const css = new ServerStyleSheet();
    
        // Create the markup from the React application
        const markup = renderToString(
            css.collectStyles(<CasLoginView title={'Login'}/>)
        );
        const out = hbsTemplate({ styles: css.getStyleTags(), ssrContainer: markup });
        resp.send(out);
    }
}