import {VerseNumAndText} from "./versenum-and-text";
import {Passage} from "./passage";

export class VerseSelectionRequest {
    passage: Passage;
    backToPath: string;
    actionToPerform: string;
}