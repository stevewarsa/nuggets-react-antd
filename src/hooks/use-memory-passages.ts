import memoryService from "../services/memory-service";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {Quote} from "../model/quote";

const useMemoryPassages = () => {
    const memTextOverrides = useSelector((state: AppState) => state.memTextOverrides);
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const allTags: {id: number, name: string}[] = useSelector((appState: AppState) => appState.topicList);

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

    const addQuoteTopic = async (topic: {id: number, name: string}, quoteId: number, user: string) => {
        const addQuoteTopicResponse = await memoryService.addQuoteTopic(topic, quoteId, user);
        return addQuoteTopicResponse.data;
    };

    const removeQuoteTopic = async (topic: {id: number, name: string}, quoteId: number, user: string) => {
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
        const topicsById: {id: number, name: string}[] = topicListResponse.data;
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
        addQuoteTopic: addQuoteTopic,
        getQuoteList: getQuoteList,
        removeQuoteTopic: removeQuoteTopic
    };
};

export default useMemoryPassages;