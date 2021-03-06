import React, { Component } from 'react';
import { LineMarkSeries, XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines } from 'react-vis';
import { extractField, getReviewDate } from './utils.js';

import BookHint from './BookHint';

import _ from 'lodash';

export default class PagesVsTimePlot extends Component {
  constructor () {
    super();
    this.state = {
      over: null
    };
  }

  // derive data to plot from the review xmls in this.state
  plotData () {
    if (this.props.reviews) {
      return _(this.props.reviews)
        .filter((r) => extractField(r, "read_at"))
        .sortBy([getReviewDate])
        .reduce(function (acc, r) {
          let pages = parseInt(extractField(r, "book num_pages"), 10) || 0;
          let priorPages = acc.length === 0 ? 0 : acc[acc.length-1].y;
          return acc.concat({
            x: getReviewDate(r).valueOf(),
            y: priorPages + pages,
            imageUrl: extractField(r, "book small_image_url"),
            linkUrl: extractField(r, "book link"),
            bookTitle: extractField(r, "book title")
          });
        }, []);
    } else {
      return [];
    }
  }

  pagesRead() {
    let plotData = this.plotData();
    return plotData[plotData.length-1].y;
  }

  render () {
    let data = this.plotData();
    let over = this.state.over;
    if (data.length > 0) {
      return (
        <XYPlot
           width={1000}
           height={500}
           margin={{left: 60, bottom: 60, right: 60, top: 0}}
           yDomain={[0, Math.floor(1.1 * this.pagesRead())]}>
          <XAxis xType="time" title="Date" tickLabelAngle={-45} />
          <YAxis title="Pages" />
          <VerticalGridLines />
          <HorizontalGridLines />
          <LineMarkSeries
             data={data}
             onValueMouseOver={(v) => this.setState({over: v})}
             onValueMouseOut={(v) => this.setState({over: null})}
             onValueClick={(v) => window.location = v.linkUrl}
          />
          {over ? <BookHint value={over}/> : null}
        </XYPlot>
      );
    } else {
      return <div className="placeholder">Not enough data :(</div>;
    }
  }
}
