import memoryService from "../services/memory-service";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {Quote} from "../model/quote";
import {Topic} from "../model/topic";

const useMemoryPassages = () => {
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const allTags: Topic[] = useSelector((appState: AppState) => appState.topicList);

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
            // if user is practicing by frequency, make it more challenging by randomizing
            // the passages within each frequency group
            if (practiceConfig.passageDisplayOrder === PassageUtils.BY_FREQ) {
                tempPassages = PassageUtils.sortWithinFrequencyGroups(tempPassages, PassageUtils.BY_LAST_PRACTICED);
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

    return {
        getMemPassages: getMemPassages,
        addMemoryPassage: addMemoryPassage,
        getTopicList: getTopicList,
        getPassagesForTopic: getPassagesForTopic,
        addQuoteTopics: addQuoteTopics,
        getQuoteList: getQuoteList,
        removeQuoteTopic: removeQuoteTopic
    };
};

export default useMemoryPassages;