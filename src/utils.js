import Q from 'q';

export function extractField(review, field) {
  return review.querySelector(field).textContent;
}

export function dateFromField(review, field) {
  return new Date(extractField(review, field));
}

export function getReviewDate(review) {
  return dateFromField(review, "read_at");
}


export function queryStringSerialize(args) {
  return "?" + Object.keys(args).map(
    (k) => `${k}=${args[k]}`
  ).join("&");
}

export function pageRequester(url, pageSize) {
  return function (page) {
    let queryString = queryStringSerialize({
        v: "2",
        per_page: pageSize,
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
