import React from 'react';
import UserInfo from './UserInfo';
import PagesVsTimePlot from './PagesVsTimePlot';

export default function Plots (props) {
  return (
    <div>
      <UserInfo info={props.userInfo} />
      <h2>Pages Read vs. Time</h2>
      <PagesVsTimePlot reviews={props.reviews} />
    </div>
  );
}
