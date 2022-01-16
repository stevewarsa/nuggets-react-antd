import {PracticeConfig} from "./PracticeConfig";
import {Passage} from "./passage";
import {VerseSelectionRequest} from "./verse-selection-request";

export interface AppState {
    practiceConfig: PracticeConfig;
    memPassageList: Passage[];
    memTextOverrides: Passage[];
    selectedMenuKey: number;
    chapterSelection: {book: string, chapter: number, translation: string};
    maxChaptersByBook: {bookName: string, maxChapter: number}[];
    verseSelectionRequest: VerseSelectionRequest;
}