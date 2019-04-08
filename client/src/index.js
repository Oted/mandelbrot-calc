import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Observable} from 'rxjs';
import {handleAction, dispatch} from './utils/actions';
import * as Api from './utils/api';
import * as Split from './utils/split';

const initialState = {
  x_min : -2.0,
  x_max : 1,
  y_min : -1.5,
  y_max : 1.5,
  n_max : 50,
  stepps : window.innerHeight > 1000 ? 1000 : window.innerHeight,
  points : {},
  latest_box : {},
  latest_points: [],
  split : 6,
  width : window.innerHeight > 1000 ? 1000 : window.innerHeight,
  height: window.innerHeight > 1000 ? 1000 : window.innerHeight
};

const stateUpdate$ = Observable.merge(
  handleAction('get_set')
  .switchMap(act => {
    return Observable.concat(...
      Split.getSets(initialState.split, act.scope.x_min, act.scope.x_max, act.scope.y_min, act.scope.y_max, act.scope.n_max, act.scope.stepps)
    );
  })
  .map(data => state => {
    let nested = {};

    nested[data.box.split_section] = {
      points : data.res.body.result,
      box : data.box
    };

    console.log(data.box);

    return {
      ...state,
      // points : Object.assign({}, nested, state.points),
      latest_points : data.res.body.result,
      latest_box : data.box,
      x_min : data.scope[1],
      x_max : data.scope[2],
      y_min : data.scope[3],
      y_max : data.scope[4],
      n_max : data.scope[5]
    }
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
