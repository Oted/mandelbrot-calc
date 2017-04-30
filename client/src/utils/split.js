import {Observable} from 'rxjs';
import * as Api from './api';

export function getSets(split, x_min, x_max, y_min, y_max, n_max, stepps) {
  const x_interval = (x_max - x_min) / split;
  const y_interval = (y_max - y_min) / split;

  let boxes = [];
  let x_i = 1;
  let y_i = 1;

  for (var x = x_min; x < x_max; x+=x_interval) {
    y_i = 1;
    for (var y = y_min; y < y_max; y+=y_interval) {
      boxes.push({
        x_min : x,
        x_max : x + x_interval,
        y_min : y,
        y_max : y + y_interval,
        stepps : Math.floor(stepps / split),
        n_max : n_max,
        split_section : x_i + '-' + y_i
      });

      y_i++;
    }

    x_i++;
  }

  return boxes.map((box) => {
    return Observable.zip(
      Api.getSet(box.x_min, box.x_max, box.y_min, box.y_max, box.n_max, box.stepps),
      Observable.of(box),
      Observable.of({...arguments}),
      (res,box,scope) => {return {res, box, scope}}
    )
  });
}
