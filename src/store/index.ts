import {configureStore, createSlice} from "@reduxjs/toolkit";
import {AppState} from "../model/AppState";
import {Verse} from "../model/verse";

const initialState: AppState = {
    practiceConfig: {},
    memPassageList: [],
    memTextOverrides: [],
    selectedMenuKey: 1
} as AppState;

const state = createSlice({
    name: "state",
    initialState: initialState,
    reducers: {
        setPracticeConfig(state, action) {
            // console.log("setPracticeConfig (reducer).  Incoming action is:");
            // console.log(action);
            state.practiceConfig = action.payload;
        },
        setMemPassageList(state, action) {
            // console.log("setMemPassageList (reducer). Incoming action is:");
            // console.log(action);
            state.memPassageList = action.payload;
        },
        setVersesForMemoryPassage(state, action) {
            // console.log("setVersesForMemoryPassage (reducer). Incoming action is:");
            // console.log(action);
            const updateVersesActionPayload: {index: number, verses: Verse[]} = action.payload;
            state.memPassageList[updateVersesActionPayload.index].verses = updateVersesActionPayload.verses;
        },
        setSelectedMenuToPracticeSetup(state) {
            // console.log("setSelectedMenuToPracticeSetup (reducer)");
            state.selectedMenuKey = 2;
        },
        setSelectedMenuItem(state, action) {
            // console.log("setSelectedMenuItem (reducer) - action is:");
            // console.log(action);
            state.selectedMenuKey = action.payload;
        },
        setMemoryTextOverrides(state, action) {
            state.memTextOverrides = action.payload;
        }
    }
});

const store = configureStore({
    reducer: state.reducer
});
export const stateActions = state.actions;
export default store;