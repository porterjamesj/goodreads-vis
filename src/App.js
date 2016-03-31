import React, { Component } from 'react';
import { hashHistory, Router, Route, IndexRoute } from 'react-router';
import Q from 'q';
import Prolyfill from 'prolyfill';
Prolyfill(Q);
import 'whatwg-fetch';

import PlotManager from './PlotManager';


function App(props) {
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
        <IndexRoute component={PlotManager}/>
        <Route path="/:userId" component={PlotManager}></Route>
      </Route>
    </Router>
  );
}
