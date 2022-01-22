import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Dropdown, Input, Menu, notification, Popover, Row, Space} from "antd";
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
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";

const BrowseQuotes = () => {
    const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
    const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>(null);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchResults, setSearchResults] = useState<QuoteMatch[]>([]);
    const [searchString, setSearchString] = useState("");
    const user = useSelector((state: AppState) => state.user);
    const startingQuote = useSelector((state: AppState) => state.startingQuote);
    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving quotes from server..."});
            const quoteListResponse = await memoryService.getQuoteList(user);
            const quotes: Quote[] = quoteListResponse.data.filter(({objectionId, answer}, index, a) =>
                a.findIndex(e => objectionId === e.objectionId && answer === e.answer) === index)
                .filter(q => StringUtils.isEmpty(q.approved) || q.approved === "Y");
            PassageUtils.shuffleArray(quotes);
            setAllQuotes(quotes);
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [user]);

    useEffect(() => {
        if (startingQuote > 0) {
            setCurrentIndex(allQuotes.findIndex(qt => qt.objectionId === startingQuote));
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
            if (prev === quoteList.length -1) {
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
        setSearchVisible(true);
    };

    const handleSearchString = (evt) => {
        const locSearchStr = evt.target.value;
        if (!locSearchStr || locSearchStr === "") {
            return;
        }
        setSearchString(evt.target.value);
    };
    useEffect(() => {
        if (searchString.length > 2) {
            const results = doFuzzySearch(searchString, allQuotes);
            setSearchResults(results);
        }

    }, [searchString, allQuotes]);

    const handleCloseSearch = () => {
        setSearchVisible(false);
        setSearchResults([]);
        setSearchString("");
    };

    const goTo = (objectionId: number) => {
        setCurrentIndex(allQuotes.findIndex(q => q.objectionId === objectionId));
        handleCloseSearch();
    };

    const handleClear = () => {
        setSearchResults([]);
        setSearchString("");
    };

    const handleFilter = () => {
        setCurrentIndex(0);
        setFilteredQuotes(searchResults.map(r => r.originalQuote));
        handleCloseSearch();
    };

    const handleClearFilter = () => {
        setCurrentIndex(0);
        setFilteredQuotes(null);
    };

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            {!busy.state && <Row justify="center">
                <Col span={24}>
                <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                    <Row style={{marginBottom: "10px", textAlign: "center"}} justify="center" align="middle">
                        <Col span={24}>
                            <h1>Browse Quotes</h1>
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "10px", textAlign: "center"}} justify="center">
                        <Col span={12}>{currentIndex + 1} of {filteredQuotes ? filteredQuotes.length : allQuotes.length}</Col>
                        <Col span={12} style={{marginLeft: "5px"}}>
                            <Popover style={{width: "100%"}}
                                content={
                                    <>
                                        <Row>
                                            <Col><Input value={searchString} autoFocus onChange={handleSearchString} /></Col>
                                        </Row>
                                        <Row style={{marginTop: "5px", marginBottom: "10px"}}>
                                            <Col><Button style={{marginRight: "5px"}} type="default" onClick={handleCloseSearch}>Close</Button></Col>
                                            <Col><Button type="default" onClick={handleClear}>Clear</Button></Col>
                                            {!filteredQuotes && <Col><Button type="default" onClick={handleFilter}>Filter to These Results</Button></Col>}
                                        </Row>
                                        {searchResults.length > 0 && <Row><Col><p>{searchResults.length + " matches"}</p></Col></Row>}
                                        {searchResults.length > 0 && searchResults.map(q => (
                                            <div key={q.originalQuote.objectionId + "div"} style={{borderStyle: "solid", borderWidth: "1px", marginBottom: "5px"}}>
                                                <Row key={q.originalQuote.objectionId + "quoterow"} style={{marginBottom: "5px"}}>
                                                    <Col span={24} key={q.originalQuote.objectionId + "quote"} dangerouslySetInnerHTML={{__html: q.annotatedText}}/>
                                                </Row>
                                                <Row key={q.originalQuote.objectionId + "buttonrow"} >
                                                    <Col span={24} key={q.originalQuote.objectionId + "buttoncol"} >
                                                        <Button key={q.originalQuote.objectionId + "button"}  type="link" onClick={() => goTo(q.originalQuote.objectionId)}>Go To</Button>
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </>
                                }
                                title="Search Quotes"
                                trigger="click"
                                visible={searchVisible}
                            >
                                <Button icon={<SearchOutlined/>} onClick={handleSearch}/>
                            </Popover>
                        </Col>
                    </Row>
                    <Row justify="center">
                        <Space>
                            <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                            <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                            <Col span={6}><Button disabled={filteredQuotes === null} icon={<EyeInvisibleOutlined />} onClick={handleClearFilter}/></Col>
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
                                    }} />
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
                </Col>
            </Row>}
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