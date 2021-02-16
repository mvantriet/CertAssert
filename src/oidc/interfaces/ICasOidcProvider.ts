import * as http from 'http';
import * as http2 from 'http2';

export interface ICasOidcProvider {
    init(): Promise<void>;
    getCallback(): (req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) => void;
}