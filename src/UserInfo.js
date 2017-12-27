import React, { Component } from 'react';

import { extractField } from './utils';


export default class UserInfo extends Component {

  render() {
  let userName, imageUrl;
  if (this.props.info) {
      userName = extractField(this.props.info, "user name");
      imageUrl = extractField(this.props.info, "user small_image_url");
    } else {
      userName = "N/A";
      imageUrl = "";
    }
    return (
      <div className="user-info">
        <img className="user-image" src={imageUrl} alt="user profile"></img>
        <span className="user-text">{userName}</span>
      </div>
    );
  }

}
