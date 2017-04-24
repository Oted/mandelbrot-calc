import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Observable} from 'rxjs';
import {handleAction, dispatch} from './utils/actions';
import * as Api from './utils/api';

const initialState = window.localStorage.mandel_state ? JSON.parse(window.localStorage.mandel_state) : {
  x_min : -2,
  x_max : 1,
  y_min : -1.5,
  y_max : 1.5,
  n_max : 25,
  stepps : 1500,
  split_x : 4,
  split_y : 1
};

const stateUpdate$ = Observable.merge(
  handleAction('get_set')
  .switchMap(act => {
    console.log('get_set', act.scope);
    let merged = {};
    return Api.getSet(act.scope.x_min, act.scope.x_max, act.scope.y_min, act.scope.y_max, act.scope.n_max, act.scope.stepps);
  })
  .map(data => state => {
    return {
      ...state,
      points : Object.assign({}, data, state.words)
    }
  })
);

const appState$ = Observable
  .of(initialState)
  .merge(stateUpdate$)
  .scan((state, patch) => {
      return patch(state)
  })
  .do(s => {
    if (s && Object.keys(s).length > 0) {
      localStorage.setItem('mandel_state', JSON.stringify(s));
    }
  });

appState$.subscribe(state => {
  ReactDOM.render(
      <App {...state} dispatch={dispatch} />,
      document.getElementById('root')
  );
}, error => {
  console.log('ERRR', error);
  throw error;
});
