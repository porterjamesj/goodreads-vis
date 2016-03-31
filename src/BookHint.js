export default function BookHint (props) {
  return (
    <Hint {...props}>
      <div className="rv-hint__content">
        <img src={props.value.imageUrl} className="book-image" />
        <div>{props.value.bookTitle}</div>
      </div>
    </Hint>
  );
}
