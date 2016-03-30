import React from 'react';
import ReactDOM from 'react-dom';
import { Routes } from './App';

require("../node_modules/react-vis/main.css");
require("../node_modules/react-spinner/react-spinner.css");
require("./style.css");

ReactDOM.render(<Routes />, document.getElementById('root'));
