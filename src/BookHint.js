import React from 'react';
import { Hint } from 'react-vis';

export default function BookHint (props) {
  return (
    <Hint {...props}>
      <div className="rv-hint__content">
        <img src={props.value.imageUrl} className="book-image" alt="book cover" />
        <div>{props.value.bookTitle}</div>
      </div>
    </Hint>
  );
}
