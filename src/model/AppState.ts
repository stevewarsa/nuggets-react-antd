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
    chapterSelection: {book: string, chapter: number, translation: string};
    maxChaptersByBook: {bookName: string, maxChapter: number}[];
    verseSelectionRequest: VerseSelectionRequest;
    user: string;
    allUsers: MemUser[];
    startingQuote: number;
    filteredQuoteIds: number[];
    existingQuoteList: Quote[];
    currentSearchString: string;
    userPreferences: any[];
}