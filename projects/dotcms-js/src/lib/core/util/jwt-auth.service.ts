import { throwError as observableThrowError, Observable } from 'rxjs';
import { Inject, Injectable, NgModule } from '@angular/core';
import { NotificationService } from './notification.service';
import { Http, Headers, Response, RequestMethod, RequestOptions } from '@angular/http';
import { SettingsStorageService } from './settings-storage.service';
import { map, catchError } from 'rxjs/operators';

/**
 * Service for managing JWT Auth Token from dotCMS Site/Host
 */
@Injectable()
@Inject('http')
@Inject('notificationService')
@Inject('settingsStorageService')
export class JWTAuthService {
    constructor(
        private http: Http,
        private notificationService: NotificationService,
        private settingsStorageService: SettingsStorageService
    ) {}

    /**
     * Will POST to the dotCMS to retrieve a dotCMS Auth Token
     * @param siteURL Site/Host of dotCMS
     * @param username
     * @param password
     * @returns Observable<R> String return for the token
     */
    getJWT(siteURL: string, username: string, password: string): Observable<string> {
        const data = {
            expirationDays: 30,
            password: password,
            user: username
        };
        return this.doPostAuth(siteURL, data).pipe(
            map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    this.handleError(res);
                    throw new Error('This request has failed ' + res.status);
                }
                return this.extractJWT(res);
            }),
            catchError((error) => this.handleError(error))
        );
    }

    /**
     * Will login and save the Auth Token to local storage
     * @param siteURL
     * @param username
     * @param password
     * @returns Observable<R>
     */
    login(siteURL: string, username: string, password: string): Observable<string> {
        return this.getJWT(siteURL, username, password).pipe(
            map((token) => {
                this.settingsStorageService.storeSettings(siteURL, token);
                return token;
            })
        );
    }

    private doPostAuth(siteUrl: string, data: any): Observable<Response> {
        const opts: RequestOptions = new RequestOptions();
        opts.method = RequestMethod.Post;
        opts.headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http.post(
            siteUrl + '/api/v1/authentication/api-token',
            JSON.stringify(data),
            opts
        );
    }

    private extractJWT(res: Response): string {
        const obj = JSON.parse(res.text());
        const results: string = obj.entity.token;
        return results;
    }

    private handleError(error: any): Observable<string> {
        const errMsg = error.message
            ? error.message
            : error.status
                ? `${error.status} - ${error.statusText}`
                : 'Server error';
        if (errMsg) {
            console.error(errMsg);
            this.notificationService.displayErrorMessage(
                'There was an error; please try again : ' + errMsg
            );
            return observableThrowError(errMsg);
        }
    }
}

@NgModule({
    providers: [JWTAuthService]
})
export class DotJWTAuthModule {}
