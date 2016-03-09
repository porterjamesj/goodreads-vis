import React, { Component } from 'react';
import { Hint, LineMarkSeries, XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, GridLines } from 'react-vis';
import $ from 'jquery';
import Q from 'q';
import {range, flatten} from 'lodash';
import moment from 'moment';
import Spinner from 'react-spinner';

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

const PAGE_SIZE = 20;

function pageRequester(url) {
  return function (page) {
    return Q($.ajax({
      url: url,
      dataType: 'xml',
      timeout: 3000,
      data: {
        v: "2",
        per_page: PAGE_SIZE,
        page: page,
        sort: "date_read",
        order: "a"
      }
    }));
  };
}

// return a promise for all of the users's reviews from goodreads
function loadUserReviews(userId) {
  let url = `http://goodreads-api.jamesporter.me/review/list/${userId}.xml`;
  let requestPage = pageRequester(url);
  console.log("making initial request to figure out how many pages there are");
  return requestPage(1).then(function (data) {
    console.log(data);
    let totalReviews = parseInt(data.querySelector("reviews").attributes.total.value, 10);
    let totalPages = Math.ceil(totalReviews/PAGE_SIZE);
    console.log(`total pages: ${totalPages}`);
    console.log("making requests for all pages");
    return Q.all(range(totalPages).map((i) => i+1).map((i) => requestPage(i)));
  }).then(function (datas) {
    return flatten(datas.map((d) => Array.prototype.slice.call(d.querySelectorAll("review"))));
  }, function (datas) { debugger; });
}

function getReviewDate(review) {
  return moment(new Date(review.querySelector("read_at").textContent));
}

function BookHint (props) {
  return (
    <Hint {...props}>
      <div className="rv-hint__content">
        <img src={props.value.imageUrl}/>
      </div>
    </Hint>
  );
}

class GoodreadsViz extends Component {
  constructor () {
    super();
    this.state = {
      reviews: null,
      over: null
    };
  }

  componentWillMount () {
    loadUserReviews("14278737")
      .done((reviews) => this.setState({reviews: reviews}));
  }

  // derive data to plot from the review xmls in this.state
  plotData () {
    if (this.state.reviews) {
      return this.state.reviews
        .filter((r) => r.querySelector("read_at").textContent)
        .reduce(function (acc, r) {
          let pages = parseInt(r.querySelector("book num_pages").textContent, 10) || 0;
          let priorPages = acc.length === 0 ? 0 : acc[acc.length-1].y;
          return acc.concat({
            x: getReviewDate(r).valueOf(),
            y: priorPages + pages,
            imageUrl: r.querySelector("book small_image_url").textContent,
            linkUrl: r.querySelector("book link").textContent,
            bookTitle: r.querySelector("book title").textContent
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
    if (this.state.reviews) {
      let data = this.plotData();
      let over = this.state.over;
      return (
        <XYPlot
           width={600}
           height={300}
           margin={{left: 60, bottom: 60, right: 60, top: 60}}
           yDomain={[0, Math.floor(1.1 * this.pagesRead())]}>
          <XAxis
            labelFormat={(v) => moment(new Date(v)).format('YYYY/MM/DD')}
            title="Date"
          />
          <YAxis title="Pages" />
          <VerticalGridLines />
          <HorizontalGridLines />
          <LineMarkSeries
             data={data}
             onValueMouseOver={(v) => this.setState({over: v})}
             onValueMouseOut={() => this.setState({over: null})}
           />
          {over ? <BookHint value={over}/> : null}
        </XYPlot>
      );
    } else {
      return <Spinner/>;
    }
  }
}
