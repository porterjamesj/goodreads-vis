import React, { Component } from 'react';
import { hashHistory, Router, Route, IndexRoute } from 'react-router';
import AlertContainer from 'react-alert';
import { Hint, LineMarkSeries, XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, GridLines } from 'react-vis';
import Q from 'q';
import Prolyfill from 'prolyfill';
Prolyfill(Q);
import 'whatwg-fetch';
import {range, flatten} from 'lodash';
import Spinner from 'react-spinner';


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

export function App(props) {
  return (
      <div className="big-container">
        <h1>Goodreads Visualizer!</h1>
        {props.children}
      </div>
  );
}

export class Plots extends Component {

  constructor () {
    super();
    this.state = {loading: false};
    this.alertOptions = {
      offset: 14,
      position: 'bottom right',
      theme: 'light',
      time: 3000,
      transition: 'scale'
    };
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  // return a promise for all of the users's reviews from goodreads
  requestReviews(userId) {
    let url = `http://goodreads-api.jamesporter.me/review/list/${userId}.xml`;
    let requestPage = pageRequester(url);
    return requestPage(1).then(function(data) {
      let totalReviews = parseInt(data.querySelector("reviews").attributes.total.value, 10);
      let totalPages = Math.ceil(totalReviews/PAGE_SIZE);
      return Q.all(range(totalPages).map((i) => i+1).map((i) => requestPage(i)));
    }).then(function (datas) {
      return flatten(datas.map((d) => Array.prototype.slice.call(d.querySelectorAll("review"))));
    });
  }

  loadUserReviews(userId) {
      this.setState({
        loading: true
      });
      this.requestReviews(userId).finally((reviews) => this.setState({
        loading: false
      })).then(
        // it worked!
        (reviews) => this.setState({reviews: reviews}),
        // it didn't :(
        // TODO figure out if this is still going to work
        (err) => this.msg.error(err.message)
      );
    }

  componentWillMount() {
    if (this.props.params.userId) {
      this.loadUserReviews(this.props.params.userId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.userId !== prevProps.params.userId) {
      this.loadUserReviews(this.props.params.userId);
    }
  }

  handleKeyPress (e) {
    if (e.key == "Enter") {
      // navigate to the page for this user
      let userId = e.target.value;
      hashHistory.push(`/${userId}/`);
    }
  }

  render() {
    let spinnerStyle = !this.state.loading ? {visibility: "hidden"} : {};
    let alertOptions = this.alertOptions;
    return (
      <div>
        <div className="input-container">
          <span> Enter a Goodreads user id and whack enter: </span>
          <input type="text" defaultValue={this.props.params.userId} onKeyPress={this.handleKeyPress}/>
          <Spinner style={spinnerStyle} className="my-react-spinner"/>
        </div>
        <h2>Pages Read vs. Time</h2>
        <PagesVsTimePlot reviews={this.state.reviews} />
        <AlertContainer ref={(ac) => this.msg = ac} {...alertOptions} />
      </div>
    );
  }
}


const PAGE_SIZE = 20;

function queryStringSerialize(args) {
  return "?" + Object.keys(args).map(
    (k) => `${k}=${args[k]}`
  ).join("&");
}

function pageRequester(url) {
  return function (page) {
    let queryString = queryStringSerialize({
        v: "2",
        per_page: PAGE_SIZE,
        page: page,
        sort: "date_read",
        order: "a"
      });
    return Q(fetch(url+queryString)).then(function(resp) {
      // handle errors
      if (!resp.ok) {
        throw new Error(`Request failed with status ${resp.status}`);
      } else {
        return resp.text();
      }
    }).then(function (text) {
      let parser = new window.DOMParser();
      return parser.parseFromString(text, "text/xml");
   });
  };
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
        <img src={props.value.imageUrl} className="book-image" />
        <div>{props.value.bookTitle}</div>
      </div>
    </Hint>
  );
}


class PagesVsTimePlot extends Component {
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
    return plotData[plotData.length-1].y;
  }

  render () {
    let data = this.plotData();
    let over = this.state.over;
    if (data.length > 0) {
      return (
        <XYPlot
           animation={{duration: 200}}
           width={1000}
           height={500}
           margin={{left: 60, bottom: 60, right: 60, top: 0}}
           yDomain={[0, Math.floor(1.1 * this.pagesRead())]}>
          <XAxis xType="time" title="Date" />
          <YAxis title="Pages" />
          <VerticalGridLines />
          <HorizontalGridLines />
          <LineMarkSeries
             data={data}
             onValueMouseOver={(v) => this.setState({over: v})}
            onValueMouseOut={(v) => this.setState({over: null})}
            />
            {over ? <BookHint value={over}/> : null}
        </XYPlot>
      );
    } else {
      return <div className="plot-placeholder">No data</div>;
    }
  }
}
