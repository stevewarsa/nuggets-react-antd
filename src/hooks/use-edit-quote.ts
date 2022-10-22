import {useEffect, useState} from "react";
import {Quote} from "../model/quote";
import memoryService from "../services/memory-service";
import {stateActions} from "../store";
import {Modal} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";

const useEditQuote = (currentQuote: Quote, visible: boolean) => {
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const [quoteForEdit, setQuoteForEdit] = useState("");
    const [busy, setBusy] = useState({state: false, message: ""});
    const [currentlyEditingQuoteObj, setCurrentlyEditingQuoteObj] = useState(undefined);
    const [editQuoteVisible, setEditQuoteVisible] = useState(false);

    useEffect(() => {
        updateQuoteForEdit();
    }, [currentQuote]);

    useEffect(() => {
        setEditQuoteVisible(visible);
        if (visible) {
            updateQuoteForEdit();
        }
    }, [visible]);

    const updateQuoteForEdit = () => {
        if (currentQuote && !StringUtils.isEmpty(currentQuote.quoteTx)) {
            setQuoteForEdit(currentQuote.quoteTx);
            setCurrentlyEditingQuoteObj(currentQuote);
        }
    };

    const handleUpdateQuote = async () => {
        setBusy({state: true, message: "Updating quote..."});
        const locQuote = {...currentlyEditingQuoteObj, quoteTx: quoteForEdit} as Quote;
        console.log("Here is the updated quote:", locQuote);
        const updateQuoteResponse = await memoryService.updateQuote(locQuote, user);
        if (updateQuoteResponse.data === "success") {
            dispatcher(stateActions.updateQuoteInList(locQuote));
            setEditQuoteVisible(false);
        } else {
            Modal.error({
                title: "Error",
                content: "Error updating quote!",
            });
        }
        setCurrentlyEditingQuoteObj(undefined);
        setQuoteForEdit("");
        setBusy({state: false, message: ""});
    };

    const handleUpdateQuoteCancel = () => {
        setCurrentlyEditingQuoteObj(undefined);
        setQuoteForEdit("");
        setEditQuoteVisible(false);
    };

    const handleQuoteForEdit = (evt) => {
        setQuoteForEdit(evt.target.value);
    };

    const handleRemoveLineFeedsAndExtraSpaces = () => {
        setQuoteForEdit(prevState => prevState.replace(/(\r\n|\n|\r)/gm, "").replace(/\s{2,}/g, ' ').trim());
    };

    return {
        quoteForEdit: quoteForEdit,
        busy: busy,
        editQuoteVisible: editQuoteVisible,
        handleUpdateQuote: handleUpdateQuote,
        handleUpdateQuoteCancel: handleUpdateQuoteCancel,
        handleQuoteForEdit: handleQuoteForEdit,
        handleRemoveLineFeedsAndExtraSpaces: handleRemoveLineFeedsAndExtraSpaces
    };
};

export default useEditQuote;