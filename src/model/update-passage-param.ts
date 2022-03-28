import {Passage} from "./passage";

export class UpdatePassageParam {
    user: string;
    passage: Passage;
    newText: string = null;
    passageRefAppendLetter: string;
}