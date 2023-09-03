import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { Package } from '../models/package.model';
import { Condition, Summary } from '../models/summary.model';
import { Coords, LocationChangeResponse, SearchCriteria } from '../models/weather.model';
// import { locationEnv } from 'src/environments/environments';
import { environment } from 'src/environments/environment';

const apiBaseUrl = environment.API_BASE;
// const apiBaseUrl = window.location.origin + '/api';

// interface Coords {
//   lat: number;
//   lon: number;
// }

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // baseUrl = 'http://localhost:8000/core/packages/';
  baseUrl = apiBaseUrl + '/core/packages/';

  constructor(private http: HttpClient) { }

  getPackage(): Observable<Package> {
    return this.http.get<Package>(this.baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiSummary {
  // baseUrl = 'http://localhost:8000/weather/summary/';
  baseUrl = apiBaseUrl + '/weather/summary/';

  constructor(private http: HttpClient) {
    let coords: Coords = {
      lat: 0,
      lon: 0,
      postal: 0
    }
    localStorage.setItem('coords', JSON.stringify(coords));
    console.log("Api base: ", this.baseUrl)
   }

  getSummary(): Observable<Summary[]> {
    // let initUrl = 'http://localhost:8000/weather/initialize?';
    let initUrl = apiBaseUrl + '/weather/initialize?';
    // let initUrl = process.env['API_BASE'] + '/weather/initialize?';
    // let cords = {lat: 29.6330969, lon: -82.3570501}
    // let coords = {lat: 0, lon: 0};

    let coords: Coords = JSON.parse(localStorage.getItem('coords')!);

    if(coords.lat != 0 && coords.lon != 0) {
      coords = {lat: coords.lat, lon: coords.lon, postal: coords.postal};
      // localStorage.setItem('coords', JSON.stringify(coords));
    } else {
      coords = getCoords();
    }
    console.log("coords at startup: ");
    console.log(coords);

    console.log("Api base: ", this.baseUrl)

    let url = initUrl + 'lat=' + coords.lat + '&long=' + coords.lon;

    console.log("new deployment...")
    // return this.http.get<JSON>(url).pipe((data:any): any => {
    //   data.subscribe((data: any): Observable<Summary[]> => {
    //     return this.http.get<Summary[]>(this.baseUrl);
    //   })
    //   // return this.http.get<Summary[]>(this.baseUrl);

    // });

    let observer = new Observable<Summary[]>((observer) => {
      this.http.get<JSON>(url).subscribe((initialData: any) => {
        localStorage.setItem('coords', JSON.stringify(coords));
        localStorage.setItem('postalCode', initialData.postal_code);
        console.log("initialized postal code: " + initialData.postal_code, " local storage: " + localStorage.getItem('postalCode'));
        this.http.get<Summary[]>(this.baseUrl).subscribe((data: any) => {
          observer.next(data);
        })
      })

    })
    return observer;

  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiSearch {
  // baseUrl = 'http://localhost:8000/weather/search/';
  baseUrl = apiBaseUrl + '/weather/search/';
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  searchDays(data: SearchCriteria): Observable<Condition[]> {
    let body = {
      start: data.startDate,
      end: data.endDate,
      temperature: data.temperature,
      precipitation: data.precipitation,
      humidity: data.humidity,
      location: environment.POSTAL_CODE
    }

    let json = JSON.stringify(body);

    return this.http.post<Condition[]>(this.baseUrl, json, {headers: this.headers}).pipe(
      map((data: any) => {
        data = JSON.parse(data);
        let result: Array<Condition> = [];
        for(let i = 0; i < 50; i++) {
          if(data[i]) {
            let day: Condition = data[i] as Condition;
            result.push(day);
          }
        }
        return result
      })
    )
  }

}

@Injectable({
  providedIn: 'root'
})
export class ChangeLocation {
  baseUrl = apiBaseUrl + '/weather/change-location/?';
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  changeLocation(location: number): Observable<LocationChangeResponse> {
    let body = {
      location: location
    }

    let json = JSON.stringify(body);
    let url = this.baseUrl + 'postal-code=' + location;

    return this.http.get<LocationChangeResponse>(url, {headers: this.headers});
  };
}

function getCoords(): Coords {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let coords: Coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        postal: 0
      }
      localStorage.setItem('coords', JSON.stringify(coords));
      return coords;
    });
  } else {
    window.alert("Allow location services to use this feature");
  }
  let coords: Coords = {
    lat: 29.6330969,
    lon: -82.3570501,
    postal: 32608
  }
  return coords;
}

