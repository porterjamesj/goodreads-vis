import React, { Component } from 'react';
import isNil from 'lodash/isNil';
import Spinner from 'react-spinner';

export default class UserIdInput extends Component {

  constructor(props) {
    super(props);
    this.state = {userId: props.userId};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({userId: nextProps.userId});
  }

  render() {
    let spinnerStyle = !this.props.loading ? {visibility: "hidden"} : {};
    let value = !isNil(this.state.userId) ? this.state.userId : '';
    return (
      <div className="input-container">
        <span> Enter a Goodreads user id and whack enter:   </span>
        <input type="text" value={this.state.userId}
               onKeyPress={this.props.onKeyPress}
               onChange={(e) => this.setState({userId: e.target.value})}/>
          <span className="spinner-container">
            <Spinner style={spinnerStyle} className="spinner"/>
          </span>
      </div>
    );
  }
}
