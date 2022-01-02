import {Verse} from "./verse";

export class Passage {
    passageId: number;
    bookId: number;
    bookName: string;
    translationId: string;
    translationName: string;
    chapter: number;
    startVerse: number;
    endVerse: number;
    verseText: string;
    frequencyDays: number;
    last_viewed_str: string;
    last_viewed_num: number;
    passageRefAppendLetter: string;
    verses: Verse[];
}