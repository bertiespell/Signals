import ReactDOM from "react-dom/client";
import {
    BrowserRouter,
    Routes,
    Route,
  } from "react-router-dom";
import App from './App';
import '../assets/main.css';
import About from './routes/about';
import "flowbite";


const root = ReactDOM.createRoot(
    document.getElementById("root")
  );
root.render(
    <App />
);