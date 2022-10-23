import {PracticeConfig} from "./PracticeConfig";
import {Passage} from "./passage";
import {VerseSelectionRequest} from "./verse-selection-request";
import {MemUser} from "./mem-user";
import {Quote} from "./quote";

export interface AppState {
    practiceConfig: PracticeConfig;
    memPassageList: Passage[];
    memTextOverrides: Passage[];
    selectedMenuKey: number;
    chapterSelection: {book: string, chapter: number, translation: string, verse?: number};
    maxChaptersByBook: {bookName: string, maxChapter: number}[];
    verseSelectionRequest: VerseSelectionRequest;
    user: string;
    allUsers: MemUser[];
    startingQuote: number;
    startingPassageId: number;
    incomingTopic: { id: number; name: string };
    topicList: { id: number; name: string }[];
    allQuotes: Quote[];
    filteredQuotes: Quote[];
    currentSearchString: string;
    userPreferences: any[];
    maxVerseByBookChapter: {[translation: string]: []};
    currentQuotesIndex: number;
    editPassageActive: boolean;
    currentQuoteTagsFiltered: string[];
    recentTopicsUsed: { id: number; name: string }[];
}