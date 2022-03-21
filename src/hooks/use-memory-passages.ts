import memoryService from "../services/memory-service";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";

const useMemoryPassages = () => {
    const memTextOverrides = useSelector((state: AppState) => state.memTextOverrides);
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);

    const getMemPassages = async (user: string, sort: boolean) => {
        const locMemoryPassagesData: any = await memoryService.getMemoryPsgList(user);
        if (memTextOverrides && memTextOverrides.length > 0) {
            locMemoryPassagesData.data.forEach(psg => {
                const foundOverride = memTextOverrides.find(o => o.passageId === psg.passageId);
                if (foundOverride) {
                    psg.passageRefAppendLetter = foundOverride.passageRefAppendLetter;
                }
            });
        }
        if (sort) {
            let tempPassages: Passage[] = PassageUtils.sortAccordingToPracticeConfig(practiceConfig.passageDisplayOrder, locMemoryPassagesData.data);
            // if user is practicing by frequency, make it more challenging by randomizing
            // the passages within each frequency group
            if (practiceConfig.passageDisplayOrder === PassageUtils.BY_FREQ) {
                tempPassages = PassageUtils.sortWithinFrequencyGroups(tempPassages, PassageUtils.BY_LAST_PRACTICED);
            }
            return tempPassages;
        } else {
            return locMemoryPassagesData.data;
        }

    };

    return {
        getMemPassages: getMemPassages
    };
};

export default useMemoryPassages;