# Goodreads Visualizer

Draw graphs (or rather graph) of goodreads activity. See it running
live [here](http://jamesporter.me/misc/goodreads-vis/).

## Development

Clone it, then:

```
npm install
npm start
open http://localhost:3000
```

## Production Build

Just do:

```
npm run build
```

(This just runs webpack with `webpack.config.prod.js`). There'll be
`bundle.js` and `index.html` in `dist/`.
