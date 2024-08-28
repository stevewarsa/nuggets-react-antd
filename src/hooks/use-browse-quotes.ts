import {useEffect, useState} from "react";
import {StringUtils} from "../helpers/string.utils";
import {stateActions} from "../store";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {AppState} from "../model/AppState";
import copy from "copy-to-clipboard";
import {Modal, notification} from "antd";
import useLoadQuotes from "./use-load-quotes";
import memoryService from "../services/memory-service";
import {Quote} from "../model/quote";

const useBrowseQuotes = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const {doQuotesLoad, doGetQuoteText} = useLoadQuotes();

    const user = useSelector((state: AppState) => state.user);
    const allUsers = useSelector((appState: AppState) => appState.allUsers);
    const searchString = useSelector((state: AppState) => state.currentSearchString);
    const allQuotes = useSelector((appState: AppState) => appState.allQuotes);
    const filteredQuotes = useSelector((appState: AppState) => appState.filteredQuotes);
    const startingQuote = useSelector((state: AppState) => state.startingQuote);
    const currentQuotesIndex = useSelector((state: AppState) => state.currentQuotesIndex);
    const currentQuoteTagsFiltered = useSelector((state: AppState) => state.currentQuoteTagsFiltered);

    const [busy, setBusy] = useState({state: false, message: ""});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectTagsVisible, setSelectTagsVisible] = useState(false);
    const [editingQuote, setEditingQuote] = useState(false);
    const [sendQuoteVisible, setSendQuoteVisible] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);

    useEffect(() => {
        setBusy({state: true, message: "Retrieving quotes from server..."});
        doQuotesLoad(false);
        setBusy({state: false, message: ""});
    }, [user]);

    useEffect(() => {
        // if the local index changes and it is not equal to the store index, then dispatch that change to the store
        if (currentIndex !== currentQuotesIndex) {
            dispatcher(stateActions.setCurrentQuotesIndex(currentIndex));
        }
        console.log("useBrowseQuotes.useEffect[currentIndex] - calling handleGetQuoteText(" + currentIndex + ")");
        handleGetQuoteText(currentIndex);
    }, [currentIndex]);

    useEffect(() => {
        console.log("useBrowseQuotes.useEffect[filteredQuotes, allQuotes] - entering...");
        if (filteredQuotes && allQuotes) {
            console.log("useBrowseQuotes.useEffect[filteredQuotes, allQuotes] - quotes exist, filteredQuotes.length=" + filteredQuotes.length);
            setIsFiltered(filteredQuotes.length < allQuotes.length);
            if (filteredQuotes.length > 0) {
                console.log("useBrowseQuotes.useEffect[filteredQuotes, allQuotes] - calling handleGetQuoteText(0)");
                handleGetQuoteText(0);
            }
        }
        if (filteredQuotes && currentIndex >= filteredQuotes.length) {
            setCurrentIndex(0);
        }
    }, [filteredQuotes, allQuotes]);


    useEffect(() => {
        if (startingQuote > 0 && filteredQuotes && filteredQuotes.length > 0) {
            const currIndex = filteredQuotes.findIndex(qt => qt.quoteId === startingQuote);
            if (currIndex >= 0) {
                setCurrentIndex(currIndex);
                dispatcher(stateActions.setStartingQuote(-1));
            }
        }
    }, [filteredQuotes, startingQuote]);

    const handleGetQuoteText = (index: number) => {
        console.log("handleGetQuoteText - index=" + index);
        if (filteredQuotes && filteredQuotes.length > 0 && StringUtils.isEmpty(filteredQuotes[index].quoteTx)) {
            console.log("handleGetQuoteText - index=" + index + ", getting quote text...");
            setBusy({state: true, message: "Retrieving quote text from server..."});
            // since the index changed and the current quote's text is null, grab the quote text from the server
            doGetQuoteText(filteredQuotes[index].quoteId)
                .then(quoteText => {
                    console.log("handleGetQuoteText - index=" + index + ", got quote text - updating quote...");
                    const locQuote = {...filteredQuotes[index], quoteTx: quoteText} as Quote;
                    console.log("handleGetQuoteText - index=" + index + ", Here is the updated quote:", locQuote);
                    dispatcher(stateActions.updateQuoteInList(locQuote));
                    setBusy({state: false, message: ""});
                });
        }
    };

    const handleNext = () => {
        setCurrentIndex(prev => {
            if (prev === filteredQuotes.length - 1) {
                return 0;
            } else {
                return prev + 1;
            }
        });
    };

    const handlePrev = () => {
        setCurrentIndex(prev => {
            if (prev === 0) {
                return filteredQuotes.length - 1;
            } else {
                return prev - 1;
            }
        });
    };

    const handleCopyQuote = () => {
        // copy
        let clipboardContent = getQuoteText();
        if (!StringUtils.isEmpty(clipboardContent)) {
            copy(clipboardContent);
            notification.info({message: "Quote copied!", placement: "bottomRight"});
        } else {
            notification.warning({message: "Quote is empty - not copied!", placement: "bottomRight"});
        }
    };

    const handDeleteQuote = async () => {
        Modal.confirm({
            title: 'Do you want to delete this quote?',
            content: 'Please confirm that you would like to permanently delete this quote from the database',
            okText: "Delete Quote",
            cancelText: "Keep Quote",
            closable: true,
            async onOk() {
                let quoteId = filteredQuotes && filteredQuotes.length > currentIndex ? filteredQuotes[currentIndex].quoteId : -1;
                if (quoteId !== -1) {
                    const removeQuoteResponse = await memoryService.removeQuote(quoteId, user);
                    const response = removeQuoteResponse.data;
                    if (response.message === "success") {
                        dispatcher(stateActions.removeQuote(quoteId));
                        notification.info({message: "Quote removed!", placement: "bottomRight"});
                    } else {
                        notification.warning({message: "Unable to remove quote", placement: "bottomRight"});
                    }
                } else {
                    notification.warning({
                        message: "Unable to remove quote - no current quote loaded",
                        placement: "bottomRight"
                    });
                }
            },
            onCancel() {
            },
        });
    };

    const handleMenuClick = ({key}) => {
        if (key === "copy") {
            handleCopyQuote();
        } else if (key === "send") {
            setSendQuoteVisible(true);
        } else if (key === "edit") {
            setEditingQuote(true);
        } else if (key === "topics") {
            setSelectTagsVisible(true);
        } else if (key === "delete") {
            handDeleteQuote().then(r => console.log("Quote is deleted...  Here is the response: ", r));
        }
    };

    const getQuoteText = () => {
        return filteredQuotes && filteredQuotes.length > currentIndex ? filteredQuotes[currentIndex].quoteTx : "";
    };

    const handleSearch = () => {
        navigate("/searchQuotes");
    };

    const handleClearFilter = () => {
        dispatcher(stateActions.setCurrentSearchString(null));
        setCurrentIndex(0);
        dispatcher(stateActions.setFilteredQuotes(allQuotes));
    };
    return {
        filteredQuotes: filteredQuotes,
        allUsers: allUsers,
        busy: busy,
        sendQuoteVisible: sendQuoteVisible,
        setSendQuoteVisible: setSendQuoteVisible,
        editingQuote: editingQuote,
        setEditingQuote: setEditingQuote,
        selectTagsVisible: selectTagsVisible,
        setSelectTagsVisible: setSelectTagsVisible,
        searchString: searchString,
        currentIndex: currentIndex,
        user: user,
        isFiltered: isFiltered,
        currentQuoteTagsFiltered: currentQuoteTagsFiltered,
        handleNext: handleNext,
        handlePrev: handlePrev,
        handleClearFilter: handleClearFilter,
        handleMenuClick: handleMenuClick,
        handleSearch: handleSearch,
        setCurrentIndex: setCurrentIndex,
    };
};

export default useBrowseQuotes;