import {Passage} from "./passage";

export class VerseSelectionRequest {
    passage: Passage;
    backToPath: string;
    actionToPerform: string;
    selectVerses: boolean;
    startIndexToSelect: number;
    endIndexToSelect: number;
}