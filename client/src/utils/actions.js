import {ReplaySubject} from 'rxjs';
const actions = new ReplaySubject();

export const handleAction = (type) => {
  return actions.asObservable().filter(act => act.type === type);
}

export const dispatch = (act) => {
  return actions.next(act);
}
