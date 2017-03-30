// Imports
import express = require("express");
import bodyParser = require('body-parser');
import expressWinston = require('express-winston');

import { OAuth2Middleware, MockRepository } from 'oauth2-middleware';

import * as ActiveDirectory from 'activedirectory';

// Imports logger
import { logger } from './logger';

export class WebApi {

    constructor(private app: express.Express, private port: number) {
        this.configureMiddleware(app);
        this.configureRoutes(app);
    }

    private configureMiddleware(app: express.Express) {
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(expressWinston.logger({
            winstonInstance: logger,
            meta: false,
            msg: 'HTTP Request: {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}'
        }));
    }

    private validateCredentialsFn(clientId, username: string, password: string): Promise<Boolean> {
        return new Promise((resolve: Function, reject: Function) => {
            
            var config = {
                url: 'ldap://EUROCT1.euromonitor.local',
                baseDN: 'dc=euromonitor,dc=local',
                username: `${username}@euromonitor.local`,
                password: password
            }

            var ad = new ActiveDirectory(config);

            ad.authenticate(`${username}@euromonitor.local`, password, (err: Error, auth: any) => {
                if (err) {
                    resolve(false);
                }else if (auth) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }

    private configureRoutes(app: express.Express) {
        app.use("/auth", new OAuth2Middleware(this.validateCredentialsFn, new MockRepository()).router);
    }

    public getApp() {
        return this.app;
    }

    public run() {
        this.app.listen(this.port);
    }
}



let port = 3000;
let api = new WebApi(express(), port);
api.run();
logger.info(`Listening on ${port}`);
