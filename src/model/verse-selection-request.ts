import {VerseNumAndText} from "./versenum-and-text";

export class VerseSelectionRequest {
    versesForSelection: VerseNumAndText[];
    backToPath: string;
    actionToPerform: string;
}