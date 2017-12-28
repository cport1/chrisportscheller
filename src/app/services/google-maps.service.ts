import {Injectable} from '@angular/core';
import {} from '@types/googlemaps';

const getScriptSrc = (callbackName) => {
  return `https://maps.googleapis.com/maps/api/js?key=AIzaSyD3BZLpO0e9qxEnHnCtIzsIlBJUx5Aqn7Q&callback=${callbackName}`;
};

@Injectable()


export class GoogleMapsService {

  private map: google.maps.Map;
  private geocoder: google.maps.Geocoder;
  private scriptLoadingPromise: Promise<void>;

  constructor() {
    // Loading script
    this.initScriptLoadingPromise();
    // Loading other components
    this.onReady().then(() => {
      this.geocoder = new google.maps.Geocoder();
    });
  }

  onReady(): Promise<void> {
    return this.scriptLoadingPromise;
  }
  private initScriptLoadingPromise() {
    const script = window.document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    const callbackName = 'callback';
    script.src = getScriptSrc(callbackName);
    this.scriptLoadingPromise = new Promise<void>((resolve: Function, reject: Function) => {
      (<any>window)[callbackName] = () => {
        resolve();
      };

      script.onerror = (error: Event) => {
        reject(error);
      };
    });
    window.document.body.appendChild(script);
  }

}
