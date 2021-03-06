// Imports repositories
import { IRepository } from 'oauth2-middleware';

// Imports configuration
import { config } from './config';

export class MockRepository implements IRepository {

    private authorizeInformation = [];

    private clients = [
        {
            name: 'Passport',
            clientId: '8d851ff6-9571-4a29-acaf-5d1ec8979cb5',
            clientSecret: '7d3123bd-bd7f-433b-9c8f-c59c51af692a',
            redirectUris: [
                `${config.api.uri}/callback`
            ]
        }
    ];

    private codes = [];

    private sessions = [];

    constructor() {

    }

    public saveAuthorizeInformation(id: string, responseType: string, clientId: string, redirectUri: string, scope: string, state: string, expiryTimestamp: number): Promise<Boolean> {

        this.authorizeInformation.push({
            id: id,
            responseType: responseType,
            clientId: clientId,
            redirectUri: redirectUri,
            state: state,
            expiryTimestamp: expiryTimestamp
        });

        return Promise.resolve(true);
    }

    public findAuthorizeInformationById(id: string): Promise<any> {
        let result = this.authorizeInformation.find(x => x.id == id);

        return Promise.resolve(result);
    }

    public findClientByClientId(clientId: string): Promise<any> {
        let result = this.clients.find(x => x.clientId == clientId);

        return Promise.resolve(result);
    }

    public saveCode(id: string, code: string, clientId: string, username: string, expiryTimestamp: number): Promise<Boolean> {
        this.codes.push({
            id: id,
            code: code,
            clientId: clientId,
            username: username,
            expiryTimestamp: expiryTimestamp
        });

        return Promise.resolve(true);
    }


    public saveAccessToken(code: string, accessToken: string, expiryTimestamp: number, scope: string, username: string): Promise<Boolean> {
        return Promise.resolve(true);
    }

    public findCodeByCode(code: string): Promise<any> {
        let result = this.codes.find(x => x.code == code);

        return Promise.resolve(result);
    }

    public saveSession(sessionId: string, username: string, clientId: string): Promise<Boolean> {
         this.sessions.push({
            sessionId: sessionId,
            username: username,
            clientId: clientId
        });

        return Promise.resolve(true);
    }

    public findSessionBySessionId(sessionId: string): Promise<any> {
        let result = this.sessions.find(x => x.sessionId == sessionId);

        return Promise.resolve(result);
    }

}
