// global store
// https://redux.js.org/introduction/why-rtk-is-redux-today
import { configureStore } from "@reduxjs/toolkit";
import AppReducer from "./reducer";

export const store = configureStore({
    reducer: {
        app: AppReducer
    }
});
