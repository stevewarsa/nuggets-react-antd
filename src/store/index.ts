import {configureStore, createSlice} from "@reduxjs/toolkit";
import {PracticeConfig} from "../model/PracticeConfig";
import {AppState} from "../model/AppState";

const initialState: AppState = {practiceConfig: {} as PracticeConfig} as AppState;

const state = createSlice({
    name: "state",
    initialState: initialState,
    reducers: {
        setPracticeConfig(state, action) {
            console.log("setPracticeConfig (reducer).  Incoming action is:");
            console.log(action);
            state.practiceConfig = action.payload;
        }
    }
});

const store = configureStore({
    reducer: state.reducer
});
export const stateActions = state.actions;
export default store;