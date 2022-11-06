import {ChangeEvent, useEffect, useState} from "react";
import {Quote} from "../model/quote";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import useMemoryPassages from "./use-memory-passages";
import {stateActions} from "../store";
import {Modal, notification} from "antd";
import useRemoveTopic from "./use-remove-topic";
import {StringUtils} from "../helpers/string.utils";
import {Topic} from "../model/topic";

const useQuoteTopics = (quote: Quote, visible: boolean) => {
    const dispatcher = useDispatch();
    const allTopics: Topic[] = useSelector((appState: AppState) => appState.topicList);
    const user = useSelector((state: AppState) => state.user);
    const {addQuoteTopic} = useMemoryPassages();
    const {handleRemoveTopic} = useRemoveTopic();
    const [topicInputVisible, setTopicInputVisible] = useState(false);
    const [topicInputValue, setTopicInputValue] = useState("");
    const [quoteTopicsVisible, setQuoteTopicsVisible] = useState(false);
    const [filter, setFilter] = useState(undefined);
    const [busy, setBusy] = useState({state: false, message: ""});

    useEffect(() => {
        setQuoteTopicsVisible(visible);
    }, [visible]);

    const addExistingTopicToQuote = (tg: Topic) => {
        setBusy({state: true, message: "Adding topic '" + tg.name + "' to quote..."});
        addQuoteTopic(tg, quote.quoteId, user).then(response => {
            if (response.message === "success") {
                const updatedQuote = {...quote, tags: [...quote.tags, tg], tagIds: [...quote.tagIds, tg.id]};
                dispatcher(stateActions.updateQuoteInList(updatedQuote));
                dispatcher(stateActions.addRecentTopicUsed(tg));
                console.log("useQuoteTags.addExistingTagToQuote setting quote tags visible to false, current value of visible is " + visible);
                setQuoteTopicsVisible(false);
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

    const handleTopicInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTopicInputValue(e.target.value);
    };

    const handleTopicInputConfirm = () => {
        const locTopicInputVal = topicInputValue && !StringUtils.isEmpty(topicInputValue) ? topicInputValue.trim() : null;
        if (!locTopicInputVal) {
            notification.warning({message: "No topic text entered", placement: "bottomRight"});
            return;
        }
        if (quote.tags.find(tg => tg.name === locTopicInputVal)) {
            notification.warning({message: "Topic with text '" + locTopicInputVal + "' already associated with the current quote", placement: "bottomRight"});
            return;
        }
        // Call the backend here to add the topic to the quote (note - it may be a new or existing topic)
        const foundTopic = allTopics.find(tg => tg.name === locTopicInputVal);
        if (foundTopic) {
            // this topic exists, so just associate it with the current quote
            addQuoteTopic(foundTopic, quote.quoteId, user).then(response => {
                if (response.message === "success") {
                    const updatedQuote = {...quote, tags: [...quote.tags, foundTopic], tagIds: [...quote.tagIds, foundTopic.id]};
                    dispatcher(stateActions.updateQuoteInList(updatedQuote));
                    dispatcher(stateActions.addRecentTopicUsed(foundTopic));
                    setQuoteTopicsVisible(false);
                } else {
                    console.log("Error adding typed topic matching existing topic to quote! Here's the response:", response);
                    Modal.error({
                        title: "Error",
                        content: "Error adding typed topic which matches existing topic to quote!",
                    });
                }
            });
        } else {
            const newTopic: Topic = {id: -1, name: locTopicInputVal};
            addQuoteTopic(newTopic, quote.quoteId, user).then(response => {
                if (response.message === "success" && response.topic) {
                    dispatcher(stateActions.addNewTopic(response.topic));
                    const updatedQuote = {...quote, tags: [...quote.tags, response.topic], tagIds: [...quote.tagIds, response.topic.id]};
                    dispatcher(stateActions.updateQuoteInList(updatedQuote));
                    dispatcher(stateActions.addRecentTopicUsed(response.topic));
                    setQuoteTopicsVisible(false);
                } else {
                    console.log("Error adding new topic to quote! Here's the response:", response);
                    Modal.error({
                        title: "Error",
                        content: "Error adding new topic to quote!",
                    });
                }
            });
        }
        setTopicInputVisible(false);
        setTopicInputValue("");
    };

    const showTopicInput = () => {
        setTopicInputVisible(true);
    };

    const handleTopicOk = () => {
        setQuoteTopicsVisible(false);
        setFilter(undefined);
    };

    const handleTopicCancel = () => {
        setQuoteTopicsVisible(false);
        setFilter(undefined);
    };

    const handleTopicFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const filterValue = e.target.value.trim();
        setFilter(filterValue);
    };

    return {
        topicInputVisible: topicInputVisible,
        setTopicInputVisible: setTopicInputVisible,
        topicInputValue: topicInputValue,
        setTopicInputValue: setTopicInputValue,
        quoteTopicsVisible: quoteTopicsVisible,
        setQuoteTopicsVisible: setQuoteTopicsVisible,
        filter: filter,
        busy: busy,
        addExistingTopicToQuote: addExistingTopicToQuote,
        handleTopicInputChange: handleTopicInputChange,
        handleTopicInputConfirm: handleTopicInputConfirm,
        handleTopicOk: handleTopicOk,
        handleTopicCancel: handleTopicCancel,
        showTopicInput: showTopicInput,
        handleRemoveTopic: handleRemoveTopic,
        handleTopicFilterChange: handleTopicFilterChange,
        quote: quote
    };
};

export default useQuoteTopics;