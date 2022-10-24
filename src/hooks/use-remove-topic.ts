import {Quote} from "../model/quote";
import {stateActions} from "../store";
import {Modal} from "antd";
import useMemoryPassages from "./use-memory-passages";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";

const useRemoveTopic = () => {
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const {removeQuoteTopic} = useMemoryPassages();

    const handleClose = async (removedTag: {id: number; name: string}, quote: Quote) => {
        const newTags = quote.tags.filter(tag => tag.id !== removedTag.id);
        const newTagIds = quote.tagIds.filter(tagId => tagId !== removedTag.id);
        console.log("Removed tag from this quote:", removedTag);
        console.log("Remaining tags for this quote:", newTags);
        const updatedQuote = {...quote, tags: newTags, tagIds: newTagIds};
        removeQuoteTopic(removedTag, quote.quoteId, user).then(response => {
            if (response.message === "success") {
                dispatcher(stateActions.updateQuoteInList(updatedQuote));
            } else {
                Modal.error({
                    title: "Error",
                    content: "Error removing tag from quote!",
                });
            }
        });
    };

    return {
        handleRemoveTopic: handleClose
    };
};

export default useRemoveTopic;