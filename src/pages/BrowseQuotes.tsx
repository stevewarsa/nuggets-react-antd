import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Constants} from "../model/constants";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Dropdown, Input, Menu, notification, Popover, Row, Space} from "antd";
import Swipe from "react-easy-swipe";
import {ArrowLeftOutlined, ArrowRightOutlined, CopyOutlined, MoreOutlined, SearchOutlined} from "@ant-design/icons";
import {PassageUtils} from "../helpers/passage-utils";
import copy from "copy-to-clipboard";

const BrowseQuotes = () => {
    const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchResults, setSearchResults] = useState<Quote[]>([]);
    const [searchString, setSearchString] = useState("");

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving quotes from server..."});
            const quoteListResponse = await memoryService.getQuoteList(Constants.USER);
            const quotes: Quote[] = quoteListResponse.data.filter(({objectionId, answer}, index, a) =>
                a.findIndex(e => objectionId === e.objectionId && answer === e.answer) === index)
                .filter(q => StringUtils.isEmpty(q.approved) || q.approved === "Y");
            PassageUtils.shuffleArray(quotes);
            setAllQuotes(quotes);
            setBusy({state: false, message: ""});
        };
        callServer();
    }, []);

    const handleNext = () => {
        setCurrentIndex(prev => {
            if (prev === allQuotes.length -1) {
                return 0;
            } else {
                return prev + 1;
            }
        });
    };

    const handlePrev = () => {
        setCurrentIndex(prev => {
            if (prev === 0) {
                return allQuotes.length - 1;
            } else {
                return prev - 1;
            }
        });
    };

    const handleMenuClick = ({key}) => {
        if (key === "1") {
            // copy
            let clipboardContent = allQuotes[currentIndex].answer;
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
        setSearchString(evt.target.value);
        if (searchString.length > 2) {
            const results = allQuotes.filter(q => q.answer.toUpperCase().includes(searchString.toUpperCase()));
            setSearchResults(results);
        }
    };

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

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            {!busy.state && <Row justify="center">
                <h1>Browse Quotes</h1>
                <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                    <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                        <Col>{currentIndex + 1} of {allQuotes.length}</Col>
                        <Col style={{marginLeft: "5px"}}>
                            <Popover style={{width: "100%"}}
                                content={
                                    <>
                                        <Row>
                                            <Col><Input value={searchString} autoFocus onChange={handleSearchString} /></Col>
                                        </Row>
                                        <Row style={{marginTop: "5px", marginBottom: "10px"}}>
                                            <Col><Button style={{marginRight: "5px"}} type="default" onClick={handleCloseSearch}>Close</Button></Col>
                                            <Col><Button type="default" onClick={handleClear}>Clear</Button></Col>
                                        </Row>
                                        {searchResults.length > 0 && <Row><Col><p>{searchResults.length + " matches"}</p></Col></Row>}
                                        {searchResults.length > 0 && searchResults.map(q => (
                                            <div key={q.objectionId + "div"} style={{borderStyle: "solid", borderWidth: "1px", marginBottom: "5px"}}>
                                                <Row key={q.objectionId + "quoterow"} style={{marginBottom: "5px"}}>
                                                    <Col span={24} key={q.objectionId + "quote"}>{q.answer}</Col>
                                                </Row>
                                                <Row key={q.objectionId + "buttonrow"} >
                                                    <Col span={24} key={q.objectionId + "buttoncol"} >
                                                        <Button key={q.objectionId + "button"}  type="link" onClick={() => goTo(q.objectionId)}>Go To</Button>
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
                            <Col span={8}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                            <Col span={8}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                            <Col span={8}>
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
                    {allQuotes && allQuotes.length > currentIndex && !StringUtils.isEmpty(allQuotes[currentIndex].answer) &&
                        <p style={{marginTop: "10px"}} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.updateLineFeedsWithBr(allQuotes[currentIndex].answer)}}/>
                    }
                </Swipe>
            </Row>}
        </>
    );
};

export default BrowseQuotes;