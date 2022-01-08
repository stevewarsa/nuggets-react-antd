import {PracticeConfig} from "./PracticeConfig";
import {Passage} from "./passage";

export interface AppState {
    practiceConfig: PracticeConfig;
    memPassageList: Passage[];
    selectedMenuKey: number;
}