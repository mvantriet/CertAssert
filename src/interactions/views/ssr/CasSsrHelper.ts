import { CasViewTemplates } from '../templates/CasViewTemplates';
import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from 'styled-components';
import hbs from "handlebars";

export function Ssr(title: string, component: JSX.Element): string {
    const template = CasViewTemplates.getSsrTemplate();
    const hbsTemplate = hbs.compile(template);
    const css = new ServerStyleSheet();
    const markup = renderToString(
        css.collectStyles(component)
    );
    return hbsTemplate({ title: title, styles: css.getStyleTags(), ssrContainer: markup });
}