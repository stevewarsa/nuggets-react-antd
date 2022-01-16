import {configureStore, createSlice} from "@reduxjs/toolkit";
import {AppState} from "../model/AppState";
import {Verse} from "../model/verse";
import {Constants} from "../model/constants";
import {PassageUtils} from "../helpers/passage-utils";
import {StringUtils} from "../helpers/string.utils";

const initialState: AppState = {
    practiceConfig: {},
    memPassageList: [],
    memTextOverrides: [],
    selectedMenuKey: 1,
    chapterSelection: null
} as AppState;

const state = createSlice({
    name: "state",
    initialState: initialState,
    reducers: {
        setMaxChaptersByBook(state, action) {
            state.maxChaptersByBook = action.payload;
        },
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
        },
        setChapterSelection(state, action) {
            console.log("setChapterSelection (reducer) - action payload is:");
            console.log(action.payload);
            state.chapterSelection = action.payload;
        },
        nextChapter(state) {
            if (state.chapterSelection && !StringUtils.isEmpty(state.chapterSelection.book)) {
                const maxChapterForBook = state.maxChaptersByBook.find(m => m.bookName === state.chapterSelection.book).maxChapter;
                if ((state.chapterSelection.chapter + 1) > maxChapterForBook) {
                    let bookId = PassageUtils.getBookId(state.chapterSelection.book);
                    if (bookId === 66) {
                        state.chapterSelection.book = Constants.booksByNum[1];
                    } else {
                        state.chapterSelection.book = Constants.booksByNum[bookId + 1];
                    }
                    state.chapterSelection.chapter = 1;
                } else {
                    state.chapterSelection.chapter++;
                }
            }
        },
        prevChapter(state) {
            if (state.chapterSelection) {
                if ((state.chapterSelection.chapter - 1) === 0) {
                    let bookId = PassageUtils.getBookId(state.chapterSelection.book);
                    if (bookId === 1) {
                        state.chapterSelection.book = Constants.booksByNum[66];
                    } else {
                        state.chapterSelection.book = Constants.booksByNum[bookId - 1];
                    }
                    const maxChapterForBook = state.maxChaptersByBook.find(m => m.bookName === state.chapterSelection.book).maxChapter;
                    state.chapterSelection.chapter = maxChapterForBook;
                } else {
                    state.chapterSelection.chapter--;
                }
            }
        }
    }
});

const store = configureStore({
    reducer: state.reducer
});
export const stateActions = state.actions;
export default store;