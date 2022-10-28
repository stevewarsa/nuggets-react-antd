import {useEffect, useState} from "react";
import {StringUtils} from "../helpers/string.utils";
import memoryService from "../services/memory-service";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {Quote} from "../model/quote";
import {MemUser} from "../model/mem-user";
import {useIsMounted} from "./is-mounted";

const useSendQuote = (currentQuote: Quote, visible: boolean) => {
    const user = useSelector((state: AppState) => state.user);
    const allUsers = useSelector((appState: AppState) => appState.allUsers);
    const isMounted = useIsMounted();
    const [modalBusy, setModalBusy] = useState({state: false, message: ""});
    const [sendQuoteVisible, setSendQuoteVisible] = useState(false);
    const [modalErrorMessage, setModalErrorMessage] = useState(null);
    const [userToSendTo, setUserToSendTo] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [comments, setComments] = useState("");
    const [usersWithEmail, setUsersWithEmail] = useState<{[user: string]: {user: MemUser, email: string}}>({});
    const [quoteForSend, setQuoteForSend] = useState("");

    useEffect(() => {
        setSendQuoteVisible(visible);
    }, [visible]);

    useEffect(() => {
        if (currentQuote && !StringUtils.isEmpty(currentQuote.quoteTx)) {
            setQuoteForSend(currentQuote.quoteTx);
        }
    }, [currentQuote]);

    useEffect(() => {
        if (user) {
            setEmailSubject("Quote sent to you from " + user);
        }
    }, [user]);

    useEffect(() => {
        const emailMappingsEmpty = !usersWithEmail || Object.keys(usersWithEmail).length === 0;
        if (emailMappingsEmpty && !StringUtils.isEmpty(user) && allUsers && allUsers.length > 0) {
            (async () => {
                const emailMappingsResponse = await memoryService.getEmailMappings({user: user});
                const mappings = emailMappingsResponse.data;
                if (mappings && mappings.length > 0) {
                    const emailMappingsMap: { [user: string]: { user: MemUser, email: string } } = {};
                    mappings.forEach(mp => emailMappingsMap[mp.userName] = {user: allUsers.find(usr => usr.userName === mp.userName), email: mp.emailAddress});
                    if (isMounted.current) {
                        setUsersWithEmail(emailMappingsMap);
                    }
                }
            })();
        }
    }, [allUsers, user, usersWithEmail]);

    const handleOk = async () => {
        if (StringUtils.isEmpty(userToSendTo)) {
            setModalErrorMessage("Select user to send to");
            return;
        }
        if (StringUtils.isEmpty(emailAddress)) {
            setModalErrorMessage("Enter email address to send to");
            return;
        }
        if (StringUtils.isEmpty(emailSubject)) {
            setModalErrorMessage("Enter email subject");
            return;
        }
        setModalBusy({state: true, message: "Sending quote to selected user..."});
        console.log("Here is the chosen user: " + userToSendTo + " emailAddress: " + emailAddress + ", emailSubject: " + emailSubject + ", comments: " + comments + ", quoteForSend: " + quoteForSend);
        let param: any = {
            user: userToSendTo,
            fromUser: user,
            quote: currentQuote,
            emailTo: emailAddress,
            comments: comments
        };
        const sendQuoteResponse = await memoryService.sendQuoteToUser(param);
        if (sendQuoteResponse.data === "error") {
            console.log('Unable to send quote to ' + user + '...');
            setModalBusy({state: false, message: ""});
        } else {
            console.log('Here is the quote sent to ' + user + ':');
            console.log(sendQuoteResponse.data);
            setModalBusy({state: false, message: ""});
            setSendQuoteVisible(false);
        }
    };

    const handleCancel = () => {
        setSendQuoteVisible(false);
    };

    const handleComments = (evt) => {
        setComments(evt.target.value);
    };

    const handleSelectUser = (value) => {
        setUserToSendTo(value);
        if (usersWithEmail[value] && !StringUtils.isEmpty(usersWithEmail[value].email)) {
            setEmailAddress(usersWithEmail[value].email)
        } else {
            setEmailAddress("");
        }
    };

    return {
        modalBusy: modalBusy,
        sendQuoteVisible: sendQuoteVisible,
        modalErrorMessage: modalErrorMessage,
        userToSendTo: userToSendTo,
        emailAddress: emailAddress,
        setEmailAddress: setEmailAddress,
        emailSubject: emailSubject,
        setEmailSubject: setEmailSubject,
        comments: comments,
        quoteForSend: quoteForSend,
        handleOk: handleOk,
        handleCancel: handleCancel,
        handleComments: handleComments,
        handleSelectUser: handleSelectUser
    };
};

export default useSendQuote;