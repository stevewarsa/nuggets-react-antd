import {configureStore, createSlice} from "@reduxjs/toolkit";

const initialState = {};

const state = createSlice({
    name: "state",
    initialState: initialState,
    reducers: {
        doSomething(state, action) {
        }
    }
});

const store = configureStore({
    reducer: state.reducer
});
export const stateActions = state.actions;
export default store;