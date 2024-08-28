import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import {PassageUtils} from "../helpers/passage-utils";
import {stateActions} from "../store";
import useMemoryPassages from "./use-memory-passages";
import {Topic} from "../model/topic";
import memoryService from "../services/memory-service";
import {useEffect} from "react";

const useLoadQuotes = () => {
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const allQuotes = useSelector((appState: AppState) => appState.allQuotes);
    const allTags: Topic[] = useSelector((appState: AppState) => appState.topicList);
    const queryParamMap = useSelector((appState: AppState) => appState.queryParams);
    const {getQuoteList, getQuoteText} = useMemoryPassages();

    useEffect( () => {
        console.log("useLoadQuotes.useEffect[queryParamMap, allQuotes] - entering... here's allQuotes:", allQuotes);
        if (allQuotes && allQuotes.length > 0 && !allTags || allTags.length === 0) {
            (async () => {
                const topicListResponse = await memoryService.getTopicList(user);
                const topics: Topic[] = topicListResponse.data;
                console.log("useLoadQuotes.useEffect[queryParamMap, allQuotes] - attempting to filter category - here's the query map: ", queryParamMap);
                handleFilterCategory(topics, allQuotes);
            })();
        }
    }, [queryParamMap, allQuotes]);

    const doQuotesLoad = (includeQuoteText: boolean) => {
        if (!allQuotes || allQuotes.length === 0) {
            (async () => {
                const quoteListResponse = await getQuoteList(user, includeQuoteText);
                const quotes: Quote[] = quoteListResponse.filter(({quoteId, quoteTx}, index, a) =>
                    a.findIndex(e => quoteId === e.quoteId && quoteTx === e.quoteTx) === index)
                    .filter(q => StringUtils.isEmpty(q.approved) || q.approved === "Y");
                const dedupedQuotes = PassageUtils.removeDups(quotes, "quoteId");
                PassageUtils.shuffleArray(dedupedQuotes);
                dispatcher(stateActions.setAllQuotes(dedupedQuotes));
            })();
        }
    };

    const doGetQuoteText = async (quoteId: number) => {
        return await getQuoteText(user, quoteId);
    };

    const handleFilterCategory = (topics: Topic[], dedupedQuotes: Quote[]) => {
        if (queryParamMap && queryParamMap["cat"] && !StringUtils.isEmpty(queryParamMap["cat"])) {
            // there was a category passed in so, filter by it
            console.log("useLoadQuotes.handleFilterCategory - param 'cat' exists:", queryParamMap["cat"]);
            console.log("useLoadQuotes.handleFilterCategory - finding topic matching '" + queryParamMap["cat"] + "', here are the topics:", topics);
            const filterTopic = topics.find(tpc => tpc.name === queryParamMap["cat"]);
            if (filterTopic) {
                console.log("useLoadQuotes.handleFilterCategory - found filter topic:", filterTopic);
                const quotesFilteredToTopic: Quote[] = dedupedQuotes.filter((qt: Quote) => qt.tagIds.includes(filterTopic.id));
                if (quotesFilteredToTopic.length > 0) {
                    dispatcher(stateActions.setFilteredQuotes(quotesFilteredToTopic));
                }
            } else {
                console.log("useLoadQuotes.handleFilterCategory - unable to find filter topic:", queryParamMap["cat"]);
            }
        }
    }

    return {
        doQuotesLoad: doQuotesLoad,
        doGetQuoteText: doGetQuoteText
    };
};

export default useLoadQuotes;