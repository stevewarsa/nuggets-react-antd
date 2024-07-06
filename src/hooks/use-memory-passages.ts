import memoryService from "../services/memory-service";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {Quote} from "../model/quote";
import {Topic} from "../model/topic";
import {stateActions} from "../store";
import {notification} from "antd";
import assert from "node:assert";

const useMemoryPassages = () => {
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const allTags: Topic[] = useSelector((appState: AppState) => appState.topicList);
    const dispatcher = useDispatch();

    const getMemPassages = async (user: string, sort: boolean): Promise<{ passages: Passage[], overrides: Passage[] }> => {
        const locMemoryPassagesResponse: any = await memoryService.getMemoryPsgList(user);
        const locMemoryTextOverridesResponse: any = await memoryService.getMemoryPassageTextOverrides(user);
        if (locMemoryTextOverridesResponse.data && locMemoryTextOverridesResponse.data.length > 0) {
            locMemoryPassagesResponse.data.forEach(psg => {
                const foundOverride = locMemoryTextOverridesResponse.data.find(o => o.passageId === psg.passageId);
                if (foundOverride) {
                    psg.passageRefAppendLetter = foundOverride.passageRefAppendLetter;
                }
            });
        }
        if (sort) {
            let tempPassages: Passage[] = PassageUtils.sortAccordingToPracticeConfig(practiceConfig.passageDisplayOrder, locMemoryPassagesResponse.data);
            if (practiceConfig.passageDisplayOrder === PassageUtils.BY_FREQ) {
                // if user is practicing by frequency, make it more challenging by randomizing
                // the passages within each frequency group
                tempPassages = PassageUtils.sortWithinFrequencyGroups(tempPassages, PassageUtils.BY_LAST_PRACTICED);
            } else if (practiceConfig.passageDisplayOrder === PassageUtils.INTERLEAVE) {
                // in this case, we want to take passages from boxes 1-4 and mix them into box 5 passages
                const frequencyGroups: {[freq: number]: Passage[]} = PassageUtils.getFrequencyGroups(tempPassages);
                if (frequencyGroups["5"].length >= 20) {
                    console.log("frequencyGroups: ", frequencyGroups);
                    const box5 = PassageUtils.sortWithinFrequencyGroups([...frequencyGroups["5"]], PassageUtils.BY_LAST_PRACTICED);
                    const box4 = PassageUtils.sortWithinFrequencyGroups([...frequencyGroups["4"]], PassageUtils.BY_LAST_PRACTICED);
                    const box3 = PassageUtils.sortWithinFrequencyGroups([...frequencyGroups["3"]], PassageUtils.BY_LAST_PRACTICED);
                    const box2 = PassageUtils.sortWithinFrequencyGroups([...frequencyGroups["2"]], PassageUtils.BY_LAST_PRACTICED);
                    const box1 = PassageUtils.sortWithinFrequencyGroups([...frequencyGroups["1"]], PassageUtils.BY_LAST_PRACTICED);
                    const boxes1Thru4 = [box1, box2, box3, box4];
                    // interleave the boxes 1-4 into this box
                    for (let i = 0; i < box5.length; i++) {
                        // first interleave box 1 passages in until exhausted, then box 2 until exhausted, then 3, etc
                        // we want to add the lower box elements either as the first element or  every 2 elements thereafter
                        if (i === 0 || i % 3 === 0) {
                            // go through boxes 1-4 and try to get (and remove) the first element of that box and add
                            // it to box 5 at the current index.  If successful, then break out of the inner loop
                            for (let box of boxes1Thru4) {
                                // shift() returns and removes the first element of an array if the contained anything.
                                // otherwise, it returns undefined
                                let lowerBoxElement = box.shift();
                                // if we returned the first element, add it into box 5 at the current index, then
                                // increment the index counter so we advance past the newly added element
                                if (lowerBoxElement) {
                                    box5.splice(i, 0, lowerBoxElement);
                                    i++;
                                    break;
                                }
                            }
                        }
                    }
                    // at this point, all the lower box elements should've been interleaved into box 5 and box5's length
                    // should be equal to the size of the whole list of passages
                    if (box5.length > frequencyGroups["5"].length) {
                        // changes were made because box 5 length is greater than it was originally
                        console.log("Since box 5 has " + box5.length + " passages, which is greater than its original size (" + frequencyGroups["5"].length + "), tempPassages, which has " + tempPassages.length + ", is being replaced with box 5");
                        tempPassages = box5;
                        console.log("Here are the new frequencies: ", tempPassages.map(el => el.frequencyDays < 5 ? `**${el.frequencyDays}**` : el.frequencyDays).join('\n'));
                    } else {
                        console.log("No changes were made to box 5 - it still has " + box5.length + " passages.");
                    }
                } else {
                    tempPassages = PassageUtils.sortWithinFrequencyGroups(tempPassages, PassageUtils.BY_LAST_PRACTICED);
                }
            }
            return {passages: tempPassages, overrides: locMemoryTextOverridesResponse.data};
        } else {
            return {passages: locMemoryPassagesResponse.data, overrides: locMemoryTextOverridesResponse.data};
        }
    };

    const addMemoryPassage = async (passage: Passage, user: string) => {
        const addMemPsgResponse: any = await memoryService.addMemoryPassage(passage, user);
        const passageId: number = addMemPsgResponse.data as number;
        if (passageId === -1) {
            // it errored out...
        } else {
            // it was successful
            passage.passageId = passageId;
        }
        return passageId;
    };

    const addQuoteTopics = async (topics: Topic[], quoteId: number, user: string) => {
        const addQuoteTopicResponse = await memoryService.addQuoteTopics(topics, quoteId, user);
        return addQuoteTopicResponse.data;
    };

    const removeQuoteTopic = async (topic: Topic, quoteId: number, user: string) => {
        const removeQuoteTopicResponse = await memoryService.removeQuoteTopic(topic, quoteId, user);
        return removeQuoteTopicResponse.data;
    };

    const getQuoteList = async (user: string) => {
        const quoteListResponse = await memoryService.getQuoteList(user);
        const quoteList: Quote[] = quoteListResponse.data;
        for (let quote of quoteList) {
            if (!quote.tags) {
                quote.tags = [];
            }
            if (!quote.tagIds || quote.tagIds.length === 0) {
                continue;
            }
            for (let tagId of quote.tagIds) {
                const foundTag = allTags.find(tg => tg.id === tagId);
                if (!foundTag) {
                    continue;
                }
                quote.tags.push(foundTag);
            }
        }
        return quoteList;
    };

    const getTopicList = async (user: string) => {
        const topicListResponse = await memoryService.getTopicList(user);
        const topicsById: Topic[] = topicListResponse.data;
        return topicsById;
    };

    const getPassagesForTopic = async (topicId: number, user: string) => {
        const passagesForTopicResponse = await memoryService.getPassagesForTopic(topicId, user);
        const passagesForTopic: Passage[] = passagesForTopicResponse.data;
        return passagesForTopic;
    };

    const updatePreference = async (user: string, prefNm: string, prefVal: string) => {
        // update the preferred translation in prefs
        memoryService.updatePreference(user, prefNm, prefVal).then(resp => {
            if (resp.data === "success") {
                // the preference was successfully updated, so update it in the preferences in the store
                dispatcher(stateActions.updatePreference({key: prefNm, value: prefVal}));
            } else {
                // the response was error
                notification.warning({message: "Unable to update '" + prefVal + "' to '" + prefVal + "'!", placement: "topLeft"});
            }
        });
    };

    return {
        getMemPassages: getMemPassages,
        addMemoryPassage: addMemoryPassage,
        getTopicList: getTopicList,
        getPassagesForTopic: getPassagesForTopic,
        addQuoteTopics: addQuoteTopics,
        getQuoteList: getQuoteList,
        removeQuoteTopic: removeQuoteTopic,
        updatePreference: updatePreference
    };
};

export default useMemoryPassages;