import {configureStore, createSlice} from "@reduxjs/toolkit";
import {AppState} from "../model/AppState";

const initialState: AppState = {
    practiceConfig: {},
    memPassageList: []
} as AppState;

const state = createSlice({
    name: "state",
    initialState: initialState,
    reducers: {
        setPracticeConfig(state, action) {
            console.log("setPracticeConfig (reducer).  Incoming action is:");
            console.log(action);
            state.practiceConfig = action.payload;
        },
        setMemPassageList(state, action) {
            console.log("setMemPassageList (reducer). Incoming action is:");
            console.log(action);
            state.memPassageList = action.payload;
        }
    }
});

const store = configureStore({
    reducer: state.reducer
});
export const stateActions = state.actions;
export default store;