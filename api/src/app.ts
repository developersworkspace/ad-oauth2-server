// Imports
import express = require("express");
import bodyParser = require('body-parser');
import expressWinston = require('express-winston');

import { OAuth2Middleware } from 'oauth2-middleware';

import * as ActiveDirectory from 'activedirectory';

import * as request from 'request';

import { MockRepository } from './repository';

// Imports configuration
import { config } from './config';

// Imports logger
import { logger } from './logger';

export class WebApi {

    private clientId = '8d851ff6-9571-4a29-acaf-5d1ec8979cb5';
    private clientSecret = '7d3123bd-bd7f-433b-9c8f-c59c51af692a';
    private redirectUri = `${config.api.uri}/callback`;

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

            var configuration = {
                url: 'ldap://EUROCT1.euromonitor.local',
                baseDN: 'dc=euromonitor,dc=local',
                username: `${username}@euromonitor.local`,
                password: password
            }

            var ad = new ActiveDirectory(configuration);

            ad.authenticate(`${username}@euromonitor.local`, password, (err: Error, auth: any) => {
                if (err) {
                    resolve(false);
                } else if (auth) {
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


        app.get('/callback', (req, res) => {

            request({
                method: 'GET',
                uri: `${config.api.uri}/auth/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=authorization_code&code=${req.query.token}&redirect_uri=${this.redirectUri}`,
                json: true
            }, (error, response, body) => {
                if (error) {
                    res.status(500).end();
                } else if (response.statusCode == 200) {

                    let username = body.info.username;

                    request({
                        method: 'POST',
                        uri: 'http://trinity.euromonitor.local/api/auth/token',
                        body: {
                            SubscriberId: 40335,
                            Username: `EURO_NT\\${username}`,
                            ApplicationId: 1
                        },
                        json: true
                    }, (error, response, body) => {
                        if (response.statusCode == 200) {
                            res.redirect(`http://portal.euromonitor.local/Portal/Account/WebAppGatewayCallback?ClearClaim=true&AuthToken=${body}`);
                        } else {
                            res.send(body);
                        }
                    });
                } else {
                    res.status(500).end();
                }
            });
        });
    }

    public getApp() {
        return this.app;
    }

    public run() {
        this.app.listen(this.port);
    }
}


let api = new WebApi(express(), config.api.port);
api.run();
logger.info(`Listening on ${config.api.port}`);
