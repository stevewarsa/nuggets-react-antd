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

const useBrowseQuotes = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const {doQuotesLoad} = useLoadQuotes();

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
        doQuotesLoad();
        setBusy({state: false, message: ""});
    }, [user]);

    useEffect(() => {
        // if the local index changes and it is not equal to the store index, then dispatch that change to the store
        if (currentIndex !== currentQuotesIndex) {
            dispatcher(stateActions.setCurrentQuotesIndex(currentIndex));
        }
    }, [currentIndex]);

    useEffect(() => {
        if (filteredQuotes && allQuotes) {
            setIsFiltered(filteredQuotes.length < allQuotes.length);
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

    const handleMenuClick = ({key}) => {
        if (key === "copy") {
            // copy
            let clipboardContent = getQuoteText();
            if (!StringUtils.isEmpty(clipboardContent)) {
                copy(clipboardContent);
                notification.info({message: "Quote copied!", placement: "bottomRight"});
            } else {
                notification.warning({message: "Quote is empty - not copied!", placement: "bottomRight"});
            }
        } else if (key === "send") {
            setSendQuoteVisible(true);
        } else if (key === "edit") {
            setEditingQuote(true);
        } else if (key === "topics") {
            setSelectTagsVisible(true);
        } else if (key === "delete") {
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
                        notification.warning({message: "Unable to remove quote - no current quote loaded", placement: "bottomRight"});
                    }
                },
                onCancel() {},
            });
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