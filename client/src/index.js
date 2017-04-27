import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Observable} from 'rxjs';
import {handleAction, dispatch} from './utils/actions';
import * as Api from './utils/api';

const initialState = {
  x_min : -2.0,
  x_max : 1,
  y_min : -1.5,
  y_max : 1.5,
  // x_min : -1.2481945087999997,
  // x_max : -1.2481868287999998,
  // y_min : 0.06312480000000005,
  // y_max : 0.06313248000000006,
  n_max : 70,
  stepps : 1200,
  split_x : 1,
  split_y : 1,
  points : {}
};

const stateUpdate$ = Observable.merge(
  handleAction('get_set')
  .switchMap(act => {
    const actO = Observable.of(act);
    const apiO  = Api.getSet(act.scope.x_min, act.scope.x_max, act.scope.y_min, act.scope.y_max, act.scope.n_max, act.scope.stepps);
    return Observable.zip(actO, apiO, (a,b) => {return {act: a, res: b}});
  })
  .map(data => state => {
    let nested = {};
    nested[data.act.split_section] = data.res.body.result;
    return {
      ...state,
      points : Object.assign({}, state.points, nested),
      x_min : data.act.scope.x_min,
      x_max : data.act.scope.x_max,
      y_min : data.act.scope.y_min,
      y_max : data.act.scope.y_max,
      n_max : data.act.scope.n_max,
      stepps : data.act.scope.stepps
    }
  }),
  handleAction('set_set')
  .switchMap(act => {

  })
);

const appState$ = Observable
  .of(initialState)
  .merge(stateUpdate$)
  .scan((state, patch) => {
      return patch(state)
  })
  // .do(s => {
    // if (s && Object.keys(s).length > 0) {
      // localStorage.setItem('mandel_state', JSON.stringify(s));
    // }
  // });

appState$.subscribe(state => {
  ReactDOM.render(
      <App {...state} dispatch={dispatch} />,
      document.getElementById('root')
  );
}, error => {
  console.log('ERRR', error);
  throw error;
});
