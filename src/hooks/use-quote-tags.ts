import {ChangeEvent, useEffect, useState} from "react";
import {Quote} from "../model/quote";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import useMemoryPassages from "./use-memory-passages";
import {stateActions} from "../store";
import {Modal} from "antd";
import useRemoveTopic from "./use-remove-topic";

const useQuoteTags = (quote: Quote, visible: boolean) => {
    const dispatcher = useDispatch();
    const allTags: {id: number, name: string}[] = useSelector((appState: AppState) => appState.topicList);
    const user = useSelector((state: AppState) => state.user);
    const {addQuoteTopic} = useMemoryPassages();
    const {handleRemoveTopic} = useRemoveTopic();
    const [tagInputVisible, setTagInputVisible] = useState(false);
    const [tagInputValue, setTagInputValue] = useState("");
    const [quoteTagsVisible, setQuoteTagsVisible] = useState(false);
    const [filter, setFilter] = useState(undefined);
    const [busy, setBusy] = useState({state: false, message: ""});

    useEffect(() => {
        setQuoteTagsVisible(visible);
    }, [visible]);

    const addExistingTagToQuote = (tg: { id: number; name: string }) => {
        setBusy({state: true, message: "Adding topic '" + tg.name + "' to quote..."});
        addQuoteTopic(tg, quote.quoteId, user).then(response => {
            if (response.message === "success") {
                const updatedQuote = {...quote, tags: [...quote.tags, tg], tagIds: [...quote.tagIds, tg.id]};
                dispatcher(stateActions.updateQuoteInList(updatedQuote));
                dispatcher(stateActions.addRecentTopicUsed(tg));
                console.log("useQuoteTags.addExistingTagToQuote setting quote tags visible to false, current value of visible is " + visible);
                setQuoteTagsVisible(false);
            } else {
                console.log("Error adding existing tag to quote! Here's the response:", response);
                Modal.error({
                    title: "Error",
                    content: "Error adding existing tag to quote!",
                });
            }
            setFilter(undefined);
            setBusy({state: false, message: ""});
        });
    };

    const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTagInputValue(e.target.value.trim());
    };

    const handleTagInputConfirm = () => {
        if (tagInputValue && !quote.tags.find(tg => tg.name === tagInputValue)) {
            // Call the backend here to add the tag to the quote (note - it may be a new or existing tag)
            const foundTag = allTags.find(tg => tg.name === tagInputValue);
            if (foundTag) {
                addQuoteTopic(foundTag, quote.quoteId, user).then(response => {
                    if (response.message === "success") {
                        const updatedQuote = {...quote, tags: [...quote.tags, foundTag], tagIds: [...quote.tagIds, foundTag.id]};
                        dispatcher(stateActions.updateQuoteInList(updatedQuote));
                        dispatcher(stateActions.addRecentTopicUsed(foundTag));
                        setQuoteTagsVisible(false);
                    } else {
                        console.log("Error adding typed tag matching existing tag to quote! Here's the response:", response);
                        Modal.error({
                            title: "Error",
                            content: "Error adding typed tag matching existing tag to quote!",
                        });
                    }
                });
            } else {
                addQuoteTopic({id: -1, name: tagInputValue}, quote.quoteId, user).then(response => {
                    if (response.message === "success" && response.topic) {
                        dispatcher(stateActions.addNewTopic(response.topic));
                        const updatedQuote = {...quote, tags: [...quote.tags, response.topic], tagIds: [...quote.tagIds, response.topic.id]};
                        dispatcher(stateActions.updateQuoteInList(updatedQuote));
                        dispatcher(stateActions.addRecentTopicUsed(response.topic));
                        setQuoteTagsVisible(false);
                    } else {
                        console.log("Error adding new tag to quote! Here's the response:", response);
                        Modal.error({
                            title: "Error",
                            content: "Error adding new tag to quote!",
                        });
                    }
                });
            }
        }
        setTagInputVisible(false);
        setTagInputValue('');
    };

    const showTagInput = () => {
        setTagInputVisible(true);
    };

    const handleTagOk = () => {
        setQuoteTagsVisible(false);
        setFilter(undefined);
    };

    const handleTagCancel = () => {
        setQuoteTagsVisible(false);
        setFilter(undefined);
    };

    const handleTagFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const filterValue = e.target.value.trim();
        setFilter(filterValue);
    };

    return {
        tagInputVisible: tagInputVisible,
        setTagInputVisible: setTagInputVisible,
        tagInputValue: tagInputValue,
        setTagInputValue: setTagInputValue,
        quoteTagsVisible: quoteTagsVisible,
        setQuoteTagsVisible: setQuoteTagsVisible,
        filter: filter,
        busy: busy,
        addExistingTagToQuote: addExistingTagToQuote,
        handleTagInputChange: handleTagInputChange,
        handleTagInputConfirm: handleTagInputConfirm,
        handleTagOk: handleTagOk,
        handleTagCancel: handleTagCancel,
        showTagInput: showTagInput,
        handleClose: handleRemoveTopic,
        handleTagFilterChange: handleTagFilterChange,
        quote: quote
    };
};

export default useQuoteTags;