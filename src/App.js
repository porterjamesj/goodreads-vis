import React from 'react';
import { hashHistory, Router, Route, IndexRoute } from 'react-router';
import Q from 'q';
import Prolyfill from 'prolyfill';
Prolyfill(Q);
import 'whatwg-fetch';

import Plots from './Plots';


export function App(props) {
  return (
      <div className="big-container">
        <h1>Goodreads Visualizer!</h1>
        {props.children}
      </div>
  );
}

export function Routes() {
  return (
    <Router history={hashHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Plots}/>
        <Route path="/:userId" component={Plots}></Route>
      </Route>
    </Router>
  );
}
