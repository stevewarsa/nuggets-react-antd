import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from "./store";

console.log("index.tsx - Here are the environment variables: ");
console.log(process.env);
const { NODE_ENV } = process.env;
console.log("index.tsx - Here is the public URL: " + NODE_ENV);
ReactDOM.render(
    <BrowserRouter basename={NODE_ENV && NODE_ENV === "development" ? "" : "/bible-app"}>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>,
    document.getElementById('root')
);
