import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import AlertContainer from 'react-alert';
import range from 'lodash/range';
import isNil from 'lodash/isNil';
import flatten from 'lodash/flatten';
import Q from 'q';

import PagesVsTimePlot from './PagesVsTimePlot';
import UserInfo from './UserInfo';
import UserIdInput from './UserIdInput';
import { reviewPageRequester, requestUserInfo } from './utils';


const PAGE_SIZE = 20;


export default class Plots extends Component {

  constructor () {
    super();
    this.state = {loading: false};
    this.alertOptions = {
      offset: 14,
      position: 'top right',
      theme: 'light',
      time: 3000,
      transition: 'scale'
    };
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  // return a promise for all of the users's reviews from goodreads
  requestReviews(userId) {
    let url = `http://goodreads-api.jamesporter.me/review/list/${userId}.xml`;
    let requestPage = reviewPageRequester(url, PAGE_SIZE);
    return requestPage(1).then(function(data) {
      let totalReviews = parseInt(data.querySelector("reviews").attributes.total.value, 10);
      let totalPages = Math.ceil(totalReviews/PAGE_SIZE);
      return Q.all(range(totalPages).map((i) => i+1).map((i) => requestPage(i)));
    }).then(function (datas) {
      return flatten(datas.map((d) => Array.prototype.slice.call(d.querySelectorAll("review"))));
    });
  }

  // make a request for the users reviews while manipulating the
  // loading spinner, &c.
  loadUserData(userId) {
    if (!isNil(userId)) {
      this.setState({
        loading: true
      });
      let reviewsPromise = this.requestReviews(userId);
      let userInfoPromise = requestUserInfo(userId);
      Q.all([userInfoPromise, reviewsPromise]).spread(
        // it worked!
        (userInfo, reviews) => this.setState({
          reviews: reviews,
          userInfo: userInfo
        }),
        // it didn't :(
        (err) => this.msg.error(err.message)
      ).finally((reviews) => this.setState({
        loading: false
      })).done();
    } else {
      this.setState({reviews: null, userInfo: null});
    }
  }

  componentWillMount() {
    this.loadUserData(this.props.params.userId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.userId !== prevProps.params.userId) {
      this.loadUserData(this.props.params.userId);
    }
  }

  handleKeyPress (e) {
    if (!this.state.loading && e.key == "Enter") {
      // navigate to the page for this user
      let userId = e.target.value;
      hashHistory.push(`/${userId}`);
    }
  }

  render() {
    let alertOptions = this.alertOptions;
    return (
      <div>
        <UserIdInput
           loading={this.state.loading}
           userId={this.props.params.userId}
           onKeyPress={this.handleKeyPress}
           />
        <UserInfo info={this.state.userInfo} />
        <h2>Pages Read vs. Time</h2>
        <PagesVsTimePlot reviews={this.state.reviews} />
        <AlertContainer ref={(ac) => this.msg = ac} {...alertOptions} />
      </div>
    );
  }
}
