import React from 'react';
import UserInfo from './UserInfo';
import PagesVsTimePlot from './PagesVsTimePlot';
import StarDistributionPlot from './StarDistributionPlot';

export default function Plots (props) {
  return (
    <div>
      <UserInfo info={props.userInfo} />
      <h2>Rating Distribution</h2>
      <StarDistributionPlot reviews={props.reviews} />
      <h2>Pages Read vs. Time</h2>
      <PagesVsTimePlot reviews={props.reviews} />
    </div>
  );
}
