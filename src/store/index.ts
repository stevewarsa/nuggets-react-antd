import {configureStore, createSlice} from "@reduxjs/toolkit";
import {AppState} from "../model/AppState";
import {Verse} from "../model/verse";
import {Constants} from "../model/constants";
import {PassageUtils} from "../helpers/passage-utils";
import {StringUtils} from "../helpers/string.utils";
import {Quote} from "../model/quote";
import {notification} from "antd";

const initialState: AppState = {
    practiceConfig: {},
    memPassageList: [],
    memTextOverrides: [],
    selectedMenuKey: 1,
    chapterSelection: null,
    verseSelectionRequest: null,
    maxChaptersByBook: [],
    user: null,
    allUsers: [],
    startingQuote: -1,
    startingPassageId: -1,
    currentSearchString: null,
    userPreferences: null,
    maxVerseByBookChapter: {},
    currentQuotesIndex: 0,
    editPassageActive: false,
    topicList: [],
    allQuotes: [],
    filteredQuotes: null,
    currentQuoteTagsFiltered: [],
    recentTopicsUsed: []
} as AppState;

const state = createSlice({
    name: "state",
    initialState: initialState,
    reducers: {
        setMaxChaptersByBook(state, action) {
            state.maxChaptersByBook = action.payload;
        },
        setMaxVerseByBookChapter(state, action) {
            console.log("reducer.setMaxVerseByBookChapter - action:", action);
            state.maxVerseByBookChapter[action.payload.translation] = action.payload.maxVerseByBookChapter;
        },
        setPracticeConfig(state, action) {
            state.practiceConfig = action.payload;
        },
        setMemPassageList(state, action) {
            state.memPassageList = action.payload;
        },
        setVersesForMemoryPassage(state, action) {
            const updateVersesActionPayload: {index: number, verses: Verse[]} = action.payload;
            state.memPassageList[updateVersesActionPayload.index].verses = updateVersesActionPayload.verses;
        },
        setSelectedMenuToPracticeSetup(state) {
            state.selectedMenuKey = 2;
        },
        setSelectedMenuItem(state, action) {
            state.selectedMenuKey = action.payload;
        },
        setMemoryTextOverrides(state, action) {
            state.memTextOverrides = action.payload;
        },
        setChapterSelection(state, action) {
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
                    state.chapterSelection.chapter = state.maxChaptersByBook.find(m => m.bookName === state.chapterSelection.book).maxChapter;
                } else {
                    state.chapterSelection.chapter--;
                }
            }
        },
        setVerseSelectionRequest(state, action) {
            state.verseSelectionRequest = action.payload;
        },
        setUser(state, action) {
            state.user = action.payload;
        },
        setAllUsers(state, action) {
            state.allUsers = action.payload;
        },
        setStartingQuote(state, action) {
            state.startingQuote = action.payload;
        },
        setStartingPassageId(state, action) {
            state.startingPassageId = parseInt(action.payload);
        },
        setIncomingTopic(state, action) {
            state.incomingTopic = action.payload;
        },
        setCurrentSearchString(state, action) {
            state.currentSearchString = action.payload;
        },
        setUserPrefs(state, action) {
            state.userPreferences = action.payload;
        },
        setCurrentQuotesIndex(state, action) {
            state.currentQuotesIndex = action.payload;
        },
        setEditPassageActive(state, action) {
            state.editPassageActive = action.payload;
        },
        setTopicList(state, action) {
            state.topicList = action.payload;
        },
        setAllQuotes(state, action) {
            state.allQuotes = action.payload;
            state.filteredQuotes = action.payload;
        },
        addNewQuote(state, action) {
            const quoteToAdd: Quote = action.payload;
            if (!quoteToAdd.hasOwnProperty("tags")) {
                quoteToAdd.tags = [];
                quoteToAdd.tagIds = [];
            }
            console.log("store.addNewQuote - here is the quote being added:", quoteToAdd);
            state.allQuotes = [...state.allQuotes, quoteToAdd];
            state.filteredQuotes = state.allQuotes;
            state.startingQuote = quoteToAdd.quoteId;
        },
        removeQuote(state, action) {
            const quoteId: number = action.payload;
            state.allQuotes = [...state.allQuotes].filter(qt => qt.quoteId !== quoteId);
            state.filteredQuotes = state.allQuotes;
        },
        setFilteredQuotes(state, action) {
            state.filteredQuotes = action.payload;
            if (action.payload.length === state.allQuotes.length) {
                state.currentQuoteTagsFiltered = [];
            }
        },
        filterByTags(state, action) {
            const filteredTagIds: number[] = action.payload.map(tg => parseInt(tg));
            const locFilterQuotes = state.filteredQuotes.filter(qt => {
                const matchingTags = qt.tagIds.filter(tg => filteredTagIds.includes(tg));
                // all tags have to match for this to be considered a match...
                return (matchingTags.length === filteredTagIds.length);
            });
            if (locFilterQuotes.length > 0) {
                state.filteredQuotes = locFilterQuotes;
                state.currentQuoteTagsFiltered = state.topicList.filter(topic => filteredTagIds.includes(topic.id)).map(topic => topic.name);
            } else {
                notification.warning({message: "No quotes exist with selected topics", placement: "topRight"});
            }
        },
        filterToQuotesWhereNoTags(state) {
            const locFilterQuotes = state.filteredQuotes.filter(qt => qt.tags.length === 0 && qt.tagIds.length === 0);
            if (locFilterQuotes.length > 0) {
                state.filteredQuotes = locFilterQuotes;
                state.currentQuoteTagsFiltered = [];
            } else {
                notification.warning({message: "No quotes exist without associated topics", placement: "topRight"});
            }
        },
        updateQuoteInList(state, action) {
            const locQuote: Quote = action.payload;
            const editedQuote: Quote = state.allQuotes.find(qt => qt.quoteId === locQuote.quoteId);
            if (editedQuote) {
                editedQuote.quoteTx = locQuote.quoteTx;
                editedQuote.tags = locQuote.tags;
                editedQuote.tagIds = locQuote.tagIds;
            }
            if (state.filteredQuotes && state.filteredQuotes.length > 0) {
                const editedFilteredQuote: Quote = state.filteredQuotes.find(qt => qt.quoteId === locQuote.quoteId);
                if (editedFilteredQuote) {
                    editedFilteredQuote.quoteTx = locQuote.quoteTx;
                    editedFilteredQuote.tags = locQuote.tags;
                    editedFilteredQuote.tagIds = locQuote.tagIds;
                }
            }
        },
        addNewTopics(state, action) {
            const tmpTopicList = [...state.topicList, ...action.payload];
            state.topicList = tmpTopicList.sort((a, b) => a.name.localeCompare(b.name));
        },
        addRecentTopicsUsed(state, action) {
            let locRecentTopics = [...state.recentTopicsUsed];
            for (const topic of action.payload) {
                locRecentTopics = locRecentTopics.filter(tg => tg.id !== topic.id)
                // add as the first element of the array
                locRecentTopics.unshift(topic);
            }
            state.recentTopicsUsed = locRecentTopics;
        },
        updatePreference(state, action) {
            const pref = action.payload;
            let found: boolean = false;
            for (let prefObj of state.userPreferences) {
                if (prefObj.key === pref.key) {
                    prefObj.value = pref.value;
                    found = true;
                    break;
                }
            }
            if (!found) {
                state.userPreferences.push({key: pref.key, value: pref.value});
            }
        }
    }
});

const store = configureStore({
    reducer: state.reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
});
export const stateActions = state.actions;
export default store;