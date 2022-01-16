import {PracticeConfig} from "./PracticeConfig";
import {Passage} from "./passage";

export interface AppState {
    practiceConfig: PracticeConfig;
    memPassageList: Passage[];
    memTextOverrides: Passage[];
    selectedMenuKey: number;
    chapterSelection: {book: string, chapter: number, translation: string};
    maxChaptersByBook: {bookName: string, maxChapter: number}[];
}