import React, { Component } from 'react';
import { AreaChart, LineChart } from 'react-d3';
import $ from 'jquery';

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>Goodreads Visualizer</h1>
        <GoodreadsViz/>
      </div>
    );
  }
}

const areaData = [
  {
    name: "series1",
    values: [
      {x: 2006, y: 100},
      {x: 2007, y: 200},
      {x: 2008, y: 150},
      {x: 2009, y: 350}
    ]
  }
];


class GoodreadsViz extends Component {

  constructor () {
    super();
    this.state = {
      data: null
    };
  }

  componentWillMount () {
      $.ajax({
        url: "http://goodreads-api.jamesporter.me/review/list/51772290.xml",
        dataType: 'xml',
        timeout: 3000,
        data: {
          v: "2"
        },
        success: function(data) {
          console.log(data);
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error("error querying goodreads", status, err.toString());
        }.bind(this)
      });
  }

  render () {
    return (
      <AreaChart data={areaData}
                 title="foo"
                 legend={true}
                 width={400}
                 height={400}
                 viewBoxObject={{
                   x: 0,
                   y: 0,
                   height: 400,
                   width: 400
                 }}
                 xAxisTickInterval={{unit: 'num', interval: 2}}
                 xAxisLabel="foo"
                 yAxisLabel="bar"
                 title="Area Chart"
                 />
    );
  }
}
