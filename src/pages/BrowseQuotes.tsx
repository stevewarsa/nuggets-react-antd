import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {
    Button,
    Col,
    Dropdown,
    Form,
    Input,
    Menu,
    Modal,
    notification,
    Row,
    Select,
    Space
} from "antd";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CopyOutlined, EditOutlined,
    EyeInvisibleOutlined, MailOutlined,
    MoreOutlined,
    SearchOutlined
} from "@ant-design/icons";
import {PassageUtils} from "../helpers/passage-utils";
import copy from "copy-to-clipboard";
import {QuoteMatch} from "../model/quote-match";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import {MemUser} from "../model/mem-user";
import { CSSTransition, SwitchTransition } from "react-transition-group";

type SizeType = Parameters<typeof Form>[0]['size'];

const BrowseQuotes = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>(null);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [modalBusy, setModalBusy] = useState({state: false, message: ""});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sendQuoteVisible, setSendQuoteVisible] = useState(false);
    const [editQuoteVisible, setEditQuoteVisible] = useState(false);
    const user = useSelector((state: AppState) => state.user);
    const allUsers = useSelector((appState: AppState) => appState.allUsers);
    const startingQuote = useSelector((state: AppState) => state.startingQuote);
    const filteredQuoteIds = useSelector((state: AppState) => state.filteredQuoteIds);
    const searchString = useSelector((state: AppState) => state.currentSearchString);
    const [componentSize, setComponentSize] = useState<SizeType | 'default'>('small');
    const [comments, setComments] = useState("");
    const [quoteForSend, setQuoteForSend] = useState("");
    const [quoteForEdit, setQuoteForEdit] = useState("");
    const [currentlyEditingQuoteObj, setCurrentlyEditingQuoteObj] = useState(undefined);
    const [emailSubject, setEmailSubject] = useState("");
    const [userToSendTo, setUserToSendTo] = useState("");
    const [usersWithEmail, setUsersWithEmail] = useState<{[user: string]: {user: MemUser, email: string}}>({});
    const [emailAddress, setEmailAddress] = useState("");
    const [modalErrorMessage, setModalErrorMessage] = useState(null);
    const { TextArea } = Input;

    const onFormLayoutChange = ({ size }: { size: SizeType }) => {
        setComponentSize(size);
    };

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving quotes from server..."});
            const quoteListResponse = await memoryService.getQuoteList(user);
            const quotes: Quote[] = quoteListResponse.data.filter(({objectionId, answer}, index, a) =>
                a.findIndex(e => objectionId === e.objectionId && answer === e.answer) === index)
                .filter(q => StringUtils.isEmpty(q.approved) || q.approved === "Y");
            const dedupedQuotes = PassageUtils.removeDups(quotes, "objectionId");
            PassageUtils.shuffleArray(dedupedQuotes);
            setAllQuotes(dedupedQuotes);
            if (filteredQuoteIds && filteredQuoteIds.length > 0) {
                setFilteredQuotes(dedupedQuotes.filter(qt => filteredQuoteIds.includes(qt.objectionId)));
                setCurrentIndex(0);
            }
            if (user) {
                setEmailSubject("Quote sent to you from " + user);
            }
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [user]);

    useEffect(() => {
        const callServer = async () => {
            const emailMappingsResponse = await memoryService.getEmailMappings({user: user});
            const mappings = emailMappingsResponse.data;
            if (mappings && mappings.length > 0) {
                const emailMappingsMap: { [user: string]: { user: MemUser, email: string } } = {};
                mappings.forEach(mp => emailMappingsMap[mp.userName] = {user: allUsers.find(usr => usr.userName === mp.userName), email: mp.emailAddress});
                setUsersWithEmail(emailMappingsMap);
            }
        }
        if (!StringUtils.isEmpty(user) && allUsers && allUsers.length > 0) {
            callServer();
        }
    }, [allUsers, user]);

    useEffect(() => {
        dispatcher(stateActions.setCurrentQuotesIndex(currentIndex));
    }, [currentIndex]);

    useEffect(() => {
        if (startingQuote > 0 && allQuotes.length > 0 && !(filteredQuoteIds && filteredQuoteIds.length > 0)) {
            const currIndex = allQuotes.findIndex(qt => qt.objectionId === startingQuote);
            if (currIndex >= 0) {
                setCurrentIndex(currIndex);
                dispatcher(stateActions.setStartingQuote(-1));
            }
        }
    }, [allQuotes, startingQuote]);

    const handleNext = () => {
        setCurrentIndex(prev => {
            const quoteList = filteredQuotes ? filteredQuotes : allQuotes;
            if (prev === quoteList.length - 1) {
                return 0;
            } else {
                return prev + 1;
            }
        });
    };

    const handlePrev = () => {
        setCurrentIndex(prev => {
            const quoteList = filteredQuotes ? filteredQuotes : allQuotes;
            if (prev === 0) {
                return quoteList.length - 1;
            } else {
                return prev - 1;
            }
        });
    };

    const handleMenuClick = ({key}) => {
        if (key === "1") {
            // copy
            let clipboardContent = filteredQuotes ? filteredQuotes[currentIndex].answer : allQuotes[currentIndex].answer;
            if (!StringUtils.isEmpty(clipboardContent)) {
                copy(clipboardContent);
                notification.info({message: "Quote copied!", placement: "bottomRight"});
            } else {
                notification.warning({message: "Quote is empty - not copied!", placement: "bottomRight"});
            }
        } else if (key === "2") {
            let quoteText = filteredQuotes && filteredQuotes.length > currentIndex ? filteredQuotes[currentIndex].answer : "";
            if (StringUtils.isEmpty(quoteText)) {
                quoteText = allQuotes && allQuotes.length > currentIndex ? allQuotes[currentIndex].answer : "";
            }
            setQuoteForSend(quoteText);
            setSendQuoteVisible(true);
        } else if (key === "3") {
            let quoteText = filteredQuotes && filteredQuotes.length > currentIndex ? filteredQuotes[currentIndex].answer : "";
            if (StringUtils.isEmpty(quoteText)) {
                quoteText = allQuotes && allQuotes.length > currentIndex ? allQuotes[currentIndex].answer : "";
                setCurrentlyEditingQuoteObj(allQuotes[currentIndex]);
            } else {
                setCurrentlyEditingQuoteObj(filteredQuotes[currentIndex]);
            }
            setQuoteForEdit(quoteText);
            setEditQuoteVisible(true);
        }
    };

    const handleSearch = () => {
        dispatcher(stateActions.setExistingQuoteList(allQuotes));
        navigate("/searchQuotes");
    };

    const handleClearFilter = () => {
        dispatcher(stateActions.setCurrentSearchString(null));
        dispatcher(stateActions.setFilteredQuoteIds([]));
        setCurrentIndex(0);
        setFilteredQuotes(null);
    };

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
            quote: allQuotes[currentIndex],
            emailTo: emailAddress,
            comment: comments
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

    const handleUpdateQuote = async () => {
        setBusy({state: true, message: "Updating quote..."});
        const locQuote = {...currentlyEditingQuoteObj, answer: quoteForEdit};
        console.log("Here is the updated quote:", locQuote);
        const updateQuoteResponse = await memoryService.updateQuote(locQuote, user);
        if (updateQuoteResponse.data === "success") {
            setAllQuotes(prevState => {
                const locAllQuotes = [...prevState];
                const editedQuote = locAllQuotes.find(qt => qt.objectionId === locQuote.objectionId);
                editedQuote.answer = locQuote.answer;
                return locAllQuotes;
            });
            if (filteredQuotes && filteredQuotes.length > 0) {
                setFilteredQuotes(prevState => {
                    const locFilteredQuotes = [...prevState];
                    const editedQuote = locFilteredQuotes.find(qt => qt.objectionId === locQuote.objectionId);
                    editedQuote.answer = locQuote.answer;
                    return locFilteredQuotes;
                });
            }
        } else {
            Modal.error({
                title: "Error",
                content: "Error updating quote!",
            });
        }
        setEditQuoteVisible(false);
        setCurrentlyEditingQuoteObj(undefined);
        setQuoteForEdit("");
        setBusy({state: false, message: ""});
    };

    const handleUpdateQuoteCancel = () => {
        setEditQuoteVisible(false);
        setCurrentlyEditingQuoteObj(undefined);
        setQuoteForEdit("");
    };

    const handleQuoteForEdit = (evt) => {
        setQuoteForEdit(evt.target.value);
    };

    const handleRemoveLineFeedsAndExtraSpaces = () => {
        setQuoteForEdit(prevState => prevState.replace(/(\r\n|\n|\r)/gm, "").replace(/\s{2,}/g, ' ').trim());
    };

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message}/>}
            <Row justify="center">
                <h1>Browse Quotes</h1>
            </Row>
            <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                    <Col>{currentIndex + 1} of {filteredQuotes ? filteredQuotes.length : allQuotes.length}</Col>
                    <Col style={{marginLeft: "5px"}}><Button icon={<SearchOutlined/>} onClick={handleSearch}/></Col>
                </Row>
                <Row justify="center">
                    <Space>
                        <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                        <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                        <Col span={6}><Button disabled={filteredQuotes === null} icon={<EyeInvisibleOutlined/>}
                                              onClick={handleClearFilter}/></Col>
                        <Col span={6}>
                            <Dropdown placement="bottomRight" trigger={["click"]} overlay={
                                <Menu onClick={handleMenuClick}>
                                    <Menu.Item key="1" icon={<CopyOutlined/>}>
                                        Copy
                                    </Menu.Item>
                                    <Menu.Item key="2" icon={<MailOutlined />}>
                                        Send Quote...
                                    </Menu.Item>
                                    <Menu.Item key="3" icon={<EditOutlined />}>
                                        Edit Quote...
                                    </Menu.Item>
                                </Menu>
                            }>
                                <MoreOutlined style={{
                                    borderStyle: "solid",
                                    borderWidth: "thin",
                                    borderColor: "gray",
                                    padding: "7px",
                                    backgroundColor: "white"
                                }}/>
                            </Dropdown>
                        </Col>
                    </Space>
                </Row>
                {!filteredQuotes && allQuotes && allQuotes.length > currentIndex && !StringUtils.isEmpty(allQuotes[currentIndex].answer) &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={"all-quotes-" + currentIndex}
                        >
                            <Row key={"all-quotes-" + currentIndex}>
                                <Col span={24}>
                                    <p
                                        style={{marginTop: "10px"}}
                                        className="nugget-view"
                                        dangerouslySetInnerHTML={{__html: PassageUtils.updateLineFeedsWithBr(allQuotes[currentIndex].answer)}}/>
                                </Col>
                            </Row>
                        </CSSTransition>
                    </SwitchTransition>
                }
                {filteredQuotes && filteredQuotes.length > currentIndex && !StringUtils.isEmpty(filteredQuotes[currentIndex].answer) &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={"filtered-quotes-" + currentIndex}
                        >
                            <Row key={"filtered-quotes-" + currentIndex}>
                                <Col span={24}>
                                    <p
                                        style={{marginTop: "10px", overflow: "hidden"}}
                                        className="nugget-view"
                                        dangerouslySetInnerHTML={{__html: PassageUtils.updateLineFeedsWithBr(StringUtils.isEmpty(searchString) ? filteredQuotes[currentIndex].answer : PassageUtils.updateAllMatches(searchString, filteredQuotes[currentIndex].answer))}}/>
                                </Col>
                            </Row>
                        </CSSTransition>
                    </SwitchTransition>
                }
            </Swipe>
            <Modal title="Edit Quote" open={editQuoteVisible} onOk={handleUpdateQuote} onCancel={handleUpdateQuoteCancel}>
                <Row style={{marginBottom: "5px"}}>
                    <Col style={{width: "100%"}}>
                        <TextArea
                            style={{marginLeft: "5px", marginRight: "5px"}}
                            autoSize
                            value={quoteForEdit}
                            onChange={handleQuoteForEdit}/>
                    </Col>
                </Row>
                <Row>
                    <Col style={{width: "100%", marginLeft: "5px", marginRight: "5px"}}>
                        <Button type="primary" onClick={handleRemoveLineFeedsAndExtraSpaces}>Remove Line Feeds</Button>
                    </Col>
                </Row>
            </Modal>
            <Modal title="Send Quote" open={sendQuoteVisible} onOk={handleOk} onCancel={handleCancel}>
                {modalBusy.state && <Row justify="center"><SpinnerTimer message={modalBusy.message}/></Row>}
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    initialValues={{ size: componentSize }}
                    onValuesChange={onFormLayoutChange}
                    size={componentSize as SizeType}
                >
                    {modalErrorMessage &&
                        <Form.Item label="Error" colon={true}>
                            <span style={{color: "red", fontWeight: "bold"}}>{modalErrorMessage}</span>
                        </Form.Item>
                    }
                    {allUsers && allUsers.length > 0 &&
                        <Form.Item label="To" colon={true}>
                            <Select onChange={handleSelectUser}>
                                <Select.Option key="n/a" value={userToSendTo}>--Select User--</Select.Option>
                                {allUsers.filter(usr => !["Guest", user].includes(usr.userName)).map(usr =>
                                    <Select.Option key={usr.userName} value={usr.userName}>{usr.userName}</Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                    }
                    <Form.Item label="Email Address" colon={true}>
                        <Input autoComplete="off" value={emailAddress} autoFocus onChange={(evt) => setEmailAddress(evt.target.value)} />
                    </Form.Item>
                    <Form.Item label="Email Subject" colon={true}>
                        <Input autoComplete="off" value={emailSubject} autoFocus onChange={(evt) => setEmailSubject(evt.target.value)} />
                    </Form.Item>
                    <Form.Item label="Comments" colon={true}>
                        <TextArea
                            style={{marginLeft: "5px", marginRight: "5px"}}
                            autoSize
                            placeholder="Enter comments to send with quote"
                            value={comments}
                            onChange={handleComments}/>
                    </Form.Item>
                    <Form.Item label="Quote Text" colon={true}>
                        {quoteForSend}
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export const doFuzzySearch = (searchCriteria: string, quotes: Quote[]): QuoteMatch[] => {
    const words = searchCriteria.split(" ").map(word => word.toUpperCase().trim());
    return quotes.map(qt => {
        let quoteMatch: QuoteMatch = {annotatedText: null, originalQuote: qt} as QuoteMatch;
        const quoteText = qt.answer.toUpperCase();
        if (quoteText.includes(searchCriteria.toUpperCase().trim())) {
            quoteMatch.annotatedText = PassageUtils.updateAllMatches(searchCriteria, qt.answer);
        } else {
            const quoteWords = quoteText.split(" ").map(word => word.trim());
            let foundWords: string[] = [];
            let allWordsMatch = true;
            for (let word of words) {
                let currWordFound = false;
                for (let quoteWord of quoteWords) {
                    // not exact match, but must include current word in a quote word (e.g. steve is included in steven)
                    if (quoteWord.includes(word)) {
                        currWordFound = true;
                        break;
                    }
                }
                if (!currWordFound) {
                    allWordsMatch = false;
                    break;
                } else {
                    foundWords.push(word);
                }
            }
            if (foundWords.length > 0 && allWordsMatch) {
                quoteMatch.annotatedText = qt.answer;
                for (let foundWord of foundWords) {
                    quoteMatch.annotatedText = PassageUtils.updateAllMatches(foundWord, quoteMatch.annotatedText);
                }
            }
        }

        return quoteMatch;
    }).filter(qt => qt.annotatedText !== null);
}

export default BrowseQuotes;