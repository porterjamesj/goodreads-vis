import React from 'react';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';
import Q from 'q';
import Prolyfill from 'prolyfill';
import 'whatwg-fetch';
import PlotManager from './PlotManager';

Prolyfill(Q);





function App(props) {
  return (
      <div className="big-container">
        <h1>Goodreads Visualizer!</h1>
        <Route exact path="/" component={PlotManager}/>
        <Route path="/:userId" component={PlotManager}/>
      </div>
  );
}

export function Routes() {
  return (
    <HashRouter>
      <Route path="/" component={App}>
      </Route>
    </HashRouter>
  );
}
