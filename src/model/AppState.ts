import {PracticeConfig} from "./PracticeConfig";
import {Passage} from "./passage";
import {VerseSelectionRequest} from "./verse-selection-request";
import {MemUser} from "./mem-user";
import {Quote} from "./quote";
import {Topic} from "./topic";

export interface AppState {
    practiceConfig: PracticeConfig;
    memPassageList: Passage[];
    selectedMenuKey: number;
    chapterSelection: {book: string, chapter: number, translation: string, verse?: number};
    maxChaptersByBook: {bookName: string, maxChapter: number}[];
    verseSelectionRequest: VerseSelectionRequest;
    user: string;
    allUsers: MemUser[];
    startingQuote: number;
    startingPassageId: number;
    incomingTopic: Topic;
    topicList: Topic[];
    allQuotes: Quote[];
    filteredQuotes: Quote[];
    currentSearchString: string;
    userPreferences: any[];
    maxVerseByBookChapter: {[translation: string]: []};
    currentQuotesIndex: number;
    currentQuoteTagsFiltered: string[];
    recentTopicsUsed: Topic[];
    queryParams: {[key: string]: string};
}