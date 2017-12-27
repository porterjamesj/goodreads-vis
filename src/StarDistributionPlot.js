import React, { Component } from 'react';
import { VerticalBarSeries, XYPlot, XAxis, YAxis } from 'react-vis';
import { extractField } from './utils.js';
import some from 'lodash/some';
import clone from 'lodash/clone';
import repeat from 'lodash/repeat';

const NO_REVIEWS = [0,0,0,0,0];

export default class StarDistributionPlot extends Component {

  plotData() {
    return this.props.reviews
      .filter((r) => parseInt(extractField(r, "rating"), 10) > 0)
      .reduce((acc ,r) => {
        let rating = parseInt(extractField(r, "rating"), 10)-1;
        let next = clone(acc);
        next[rating] += 1;
        return next;
      }, NO_REVIEWS)
      .map((v, i) => ({x: i+1, y: v}));
  }

  render () {
    let data = this.plotData();
    if (some(data, (d) => d.y > 0)) {
      return (
        <XYPlot
           width={1000}
           height={500}
           xType='ordinal'
           margin={{left: 60, bottom: 60, right: 60, top: 0}}>
          <XAxis
             tickFormat={(n) => repeat("★", n)}/>
          <YAxis />
          <VerticalBarSeries data={data} />
        </XYPlot>
      );
    } else {
      return <div className="placeholder">Not enough data :(</div>;
    }
  }
}
