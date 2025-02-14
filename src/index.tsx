import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from "./store";

const { NODE_ENV } = process.env;

ReactDOM.render(
    <BrowserRouter basename={NODE_ENV && NODE_ENV === "development" ? "" : "/bible-app"}>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>,
    document.getElementById('root')
);
