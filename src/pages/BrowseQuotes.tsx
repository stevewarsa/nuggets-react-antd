import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Dropdown, Menu, notification, Row, Space} from "antd";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CopyOutlined,
    EyeInvisibleOutlined,
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

const BrowseQuotes = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>(null);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [currentIndex, setCurrentIndex] = useState(0);
    const user = useSelector((state: AppState) => state.user);
    const startingQuote = useSelector((state: AppState) => state.startingQuote);
    const filteredQuoteIds = useSelector((state: AppState) => state.filteredQuoteIds);
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
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [user]);

    useEffect(() => {
        if (startingQuote > 0 && allQuotes.length > 0 && !(filteredQuoteIds && filteredQuoteIds.length > 0)) {
            const currIndex = allQuotes.findIndex(qt => qt.objectionId === startingQuote);
            if (currIndex >= 0) {
                setCurrentIndex(currIndex);
            }
        }
    }, [allQuotes, startingQuote]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [currentIndex]);

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
        }
    };

    const handleSearch = () => {
        dispatcher(stateActions.setExistingQuoteList(allQuotes));
        navigate("/searchQuotes");
    };

    const handleClearFilter = () => {
        dispatcher(stateActions.setFilteredQuoteIds([]));
        setCurrentIndex(0);
        setFilteredQuotes(null);
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
                    <Row>
                        <Col span={24}>
                            <p
                                style={{marginTop: "10px"}}
                                className="nugget-view"
                                dangerouslySetInnerHTML={{__html: PassageUtils.updateLineFeedsWithBr(allQuotes[currentIndex].answer)}}/>
                        </Col>
                    </Row>
                }
                {filteredQuotes && filteredQuotes.length > currentIndex && !StringUtils.isEmpty(filteredQuotes[currentIndex].answer) &&
                    <Row>
                        <Col span={24}>
                            <p
                                style={{marginTop: "10px"}}
                                className="nugget-view"
                                dangerouslySetInnerHTML={{__html: PassageUtils.updateLineFeedsWithBr(filteredQuotes[currentIndex].answer)}}/>
                        </Col>
                    </Row>
                }
            </Swipe>
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