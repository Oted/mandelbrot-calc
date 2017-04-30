import {Observable} from 'rxjs';
import {RxHR} from "@akanass/rx-http-request";

export function getSet(x_min, x_max, y_min, y_max, n_max, stepps) {
  return RxHR.get(
    'http://localhost:8080/get_set' +
    '?x_min=' + x_min +
    '&x_max=' + x_max +
    '&y_min=' + y_min +
    '&y_max=' + y_max +
    '&n_max=' + n_max +
    '&stepps=' + stepps,
    {
      'json' : true
    }
 );
}
