import {Observable} from 'rxjs';

export function getSet(x_min, x_max, y_min, y_max, n_max, stepps) {
    return Observable.fromPromise(
        fetch('http://localhost:8080/getSet' +
          '?x_min=' + x_min +
          '&x_max=' + x_max +
          '&y_min=' + y_min +
          '&y_max=' + y_max +
          '&n_max=' + n_max +
          '&stepps=' + stepps
        ).then(res=> {
            return res.json();
        })
    );
}
