import {Injectable} from '@angular/core';
import {ApiRoot} from "../persistence/ApiRoot";
import {CoreWebService} from "./core-web-service";
import {Observable} from 'rxjs/Rx';
import {RequestMethod} from '@angular/http';
import {Observer} from "rxjs/Observer";

@Injectable()
export class SiteService  {

    private allSiteUrl:string;
    private switchSiteUrl:string;

    private site:Site;
    private sites:Site[];

    private switchSiteObservable:Observable<Site>;
    private switchSiteObserver:Observer<Site>;

    constructor(_apiRoot: ApiRoot, private coreWebService: CoreWebService) {
        this.allSiteUrl = `${_apiRoot.baseUrl}api/v1/site/currentSite`;
        this.switchSiteUrl = `${_apiRoot.baseUrl}api/v1/site/switch`;

        this.switchSiteObservable = Observable.create( observer => {
            this.switchSiteObserver = observer;

            if (this.currentSite) {
                this.switchSiteObserver.next(this.site);
            }
        });
    }

    public getAllSites(): Observable<any> {

        return this.coreWebService.requestView({
            method: RequestMethod.Get,
            url: this.allSiteUrl
        }).map(response =>{
            this.sites = response.entity.sites;
            this.setCurrentSiteIdentifier( response.entity.currentSite );
            return {
                currentSite: Object.assign( {}, this.currentSite ),
                sites: response.entity.sites
            };
        });
    }

    private setCurrentSiteIdentifier(siteIdentifier:string){
        this.site = Object.assign({}, this.sites.filter( site => site.identifier === siteIdentifier)[0]);

        if (this.switchSiteObserver) {
            this.switchSiteObserver.next(this.currentSite);
        }
    }

    switchSite(siteId:String):Observable<any> {
        return this.coreWebService.requestView({
            method: RequestMethod.Put,
            url: `${this.switchSiteUrl}/${siteId}`
        }).map(response => {
            this.setCurrentSiteIdentifier(siteId);
            return response;
        });
    }

    public subscribeSwitchSite():Observable<Site>{
        return this.switchSiteObservable;
    }

    get currentSite():Site{
        return this.site;
    }
}

export interface Site{
    hostName:string
    type:string
    identifier:string
}