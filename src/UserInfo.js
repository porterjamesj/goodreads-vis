import React, { Component } from 'react';

import { extractField } from './utils';


export default class UserInfo extends Component {

  render() {
    console.log(this.props.info);
    if (this.props.info) {
      var userName = extractField(this.props.info, "user name");
      var imageUrl = extractField(this.props.info, "user small_image_url");
    } else {
      var userName = "N/A";
      var imageUrl = "";
    }
    return (
      <div className="user-info">
        <img className="user-image" src={imageUrl}></img>
        <span className="user-text">{userName}</span>
      </div>
    );
  }

}
