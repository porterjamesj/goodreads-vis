import React, { Component } from 'react';
import { Hint, LineMarkSeries, XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, GridLines } from 'react-vis';
import $ from 'jquery';
import Q from 'q';
import {range, flatten} from 'lodash';
import Spinner from 'react-spinner';

export default class App extends Component {

  constructor () {
    super();
    this.state = {userId: null};
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleKeyPress (e) {
    if (e.key == "Enter") {
      let userId = e.target.value;
      this.setState({userId: userId});
      loadUserReviews(userId).done((reviews) => this.setState({
        reviews: reviews
      }));
    }
  }

  render() {
    return (
      <div>
        <h1>Goodreads Visualizer</h1>
        <span> Enter a Goodreads user id and whack enter: <input type="text"  onKeyPress={this.handleKeyPress} /></span>
        <GoodreadsViz reviews={this.state.reviews} />
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
  });
}

function extractField(review, field) {
  return review.querySelector(field).textContent;
}

function dateFromField(review, field) {
  return new Date(extractField(review, field));
}

function getReviewDate(review) {
  return dateFromField(review, "read_at");
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
      over: null
    };
  }

  // derive data to plot from the review xmls in this.state
  plotData () {
    if (this.props.reviews) {
      return this.props.reviews
        .filter((r) => extractField(r, "read_at"))
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
    if (plotData.length > 0) {
      return plotData[plotData.length-1].y;
    } else {
      return 1000; // ¯\_(ツ)_/¯ as good a number as any
    }
  }

  render () {
    let data = this.plotData();
    let haveData = data.length > 0;
    let over = this.state.over;
    return (
      <XYPlot
         animation={{duration: 200}}
         width={600}
         height={300}
         margin={{left: 60, bottom: 60, right: 60, top: 60}}
         yDomain={[0, Math.floor(1.1 * this.pagesRead())]}>
        <XAxis
          xType="time"
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
  }
}
