import fs from 'fs';
import constants from 'constants';
import * as https from "https";
import * as http from "http";
import * as tls from "tls";

import { CasComponent } from '../../common/CasComponent';
import { ICasServer } from '../interfaces/ICasServer';
import { ICasLogger } from '../../logging/interfaces/ICasLogger';

export type ICasRequestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

export class CasServer extends CasComponent implements ICasServer {

  private keyPath: string;
  private certificatePath: string;
  private initialCAcertificatesPaths: string[];
  private serverPort: number;
  private httpRedirectPort: number;
  private requestHandler: ICasRequestHandler;
  private openSecureConnections: Set<tls.TLSSocket>;
  private openInsecureConnections: Set<tls.TLSSocket>;
  private secureServer: https.Server;
  private insecureServer: http.Server;
  private secureServerOptions: tls.TlsOptions;  

  constructor(keyPath: string, 
              certificatePath: string,
              initialCAcertificatesPaths: string[],
              requestHandler: ICasRequestHandler,
              serverPort: number,
              httpRedirectPort: number,
              logger: ICasLogger) {
    super(logger);
    this.keyPath = keyPath;
    this.certificatePath = certificatePath;
    this.requestHandler = requestHandler;
    this.initialCAcertificatesPaths = initialCAcertificatesPaths;
    this.serverPort = serverPort;
    this.httpRedirectPort = httpRedirectPort;
    this.logger = logger;
    this.openSecureConnections = new Set<tls.TLSSocket>();
    this.openInsecureConnections = new Set<tls.TLSSocket>();
    this.secureServer = new https.Server();
    this.insecureServer = new https.Server();
    this.secureServerOptions = {};
  }

  init() {
    // Always do this within the server as well, rather than solely relying on syncing from the DB at boot
    // If the DB fails at startup or is corrupted, at least the server can be connected to using the initial trusted CAs
    this.secureServerOptions = {
      secureOptions: constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION | 
      constants.SSL_OP_NO_TICKET,
      sessionTimeout: 1,
      key: fs.readFileSync(this.keyPath),
      cert: fs.readFileSync(this.certificatePath),
      ca: this.initialCAcertificatesPaths.map((caCertPath) => fs.readFileSync(caCertPath)).join('\n'),
      requestCert: true,
      rejectUnauthorized: false,
      minVersion: 'TLSv1',
      maxVersion: 'TLSv1.2',
      honorCipherOrder: true,
      ciphers: [
        'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', // TLS 1.2 ciphers
        'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
        'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256',
        'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
        'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384',
        'TLS_RSA_WITH_AES_128_GCM_SHA256',
        'TLS_RSA_WITH_AES_256_GCM_SHA384',
        'TLS_RSA_WITH_AES_128_CBC_SHA',
        'TLS_RSA_WITH_AES_256_CBC_SHA',
        'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA', // TLS 1.1 ciphers
        'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
        'TLS_RSA_WITH_AES_128_CBC_SHA',
        'TLS_RSA_WITH_AES_256_CBC_SHA',
        'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA', // TLS 1 Ciphers
        'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
        'TLS_RSA_WITH_AES_128_CBC_SHA',
        'TLS_RSA_WITH_AES_256_CBC_SHA',
        'DES-CBC3-SHA', // == TLS_RSA_WITH_3DES_EDE_CBC_SHA
    ].join(':')
    };
    this.secureServer = https.createServer(this.secureServerOptions, this.requestHandler);
    this.secureServer.on('connection', (socket: tls.TLSSocket) => {
      this.openSecureConnections.add(socket);
      socket.on('close', () => {
        this.openSecureConnections.delete(socket);
      });
    });
    this.secureServer.listen(this.serverPort);

    this.insecureServer = http.createServer((req, res) => {
      res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
      res.end();
    })

    this.insecureServer.on('connection', (socket: tls.TLSSocket) => {
      this.openInsecureConnections.add(socket);
      socket.on('close', () => {
        this.openInsecureConnections.delete(socket);
      });
    });
    this.insecureServer.listen(this.httpRedirectPort);
    this.logger.log(`Server started on: https://localhost:${this.serverPort} and redirect from http://localhost:${this.httpRedirectPort}`);
  }

  close(force: boolean) {
    if (force) {
      this.logger.log(`Server closing open connections forcefully`);
      this.openSecureConnections.forEach((con) => {
        con.destroy();
        this.openSecureConnections.delete(con);
      })
      this.openInsecureConnections.forEach((con) => {
        con.destroy();
        this.openInsecureConnections.delete(con);
      })
    }
    const httpsServerClose = new Promise((resolve, reject) => {
      this.secureServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.log(`Secure server on port: ${this.serverPort} closed`);
          resolve();
        }
      })
    });
    const httpServerClose = new Promise((resolve, reject) => {
      this.insecureServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.log(`Insecure server on port: ${this.httpRedirectPort} closed`);
          resolve();
        }
      })  
    });
    // Add extra timeout to ensure listener process is cleaned up
    // For example jest otherwise will still pickup the listener process
    return Promise.all([httpsServerClose, httpServerClose]).then(() => {
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          this.logger.log(`Server close done`);
          resolve()
        }, 2000);
      })
    });
  }
}