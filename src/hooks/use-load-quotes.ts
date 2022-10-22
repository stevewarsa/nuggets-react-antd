import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import {PassageUtils} from "../helpers/passage-utils";
import {stateActions} from "../store";
import useMemoryPassages from "./use-memory-passages";

const useLoadQuotes = () => {
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const allQuotes = useSelector((appState: AppState) => appState.allQuotes);
    const {getQuoteList} = useMemoryPassages();

    const doQuotesLoad = () => {
        if (!allQuotes || allQuotes.length === 0) {
            (async () => {
                const quoteListResponse = await getQuoteList(user);
                const quotes: Quote[] = quoteListResponse.filter(({quoteId, quoteTx}, index, a) =>
                    a.findIndex(e => quoteId === e.quoteId && quoteTx === e.quoteTx) === index)
                    .filter(q => StringUtils.isEmpty(q.approved) || q.approved === "Y");
                const dedupedQuotes = PassageUtils.removeDups(quotes, "quoteId");
                PassageUtils.shuffleArray(dedupedQuotes);
                dispatcher(stateActions.setAllQuotes(dedupedQuotes));
            })();
        }
    };

    return {
        doQuotesLoad: doQuotesLoad
    };
};

export default useLoadQuotes;