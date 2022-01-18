import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {Constants} from "../model/constants";
import {Quote} from "../model/quote";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Dropdown, Menu, notification, Row, Space} from "antd";
import Swipe from "react-easy-swipe";
import {ArrowLeftOutlined, ArrowRightOutlined, CopyOutlined, MoreOutlined} from "@ant-design/icons";
import {PassageUtils} from "../helpers/passage-utils";
import copy from "copy-to-clipboard";

const BrowseQuotes = () => {
    const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving quotes from server..."});
            const quoteListResponse = await memoryService.getQuoteList(Constants.USER);
            setAllQuotes((quoteListResponse.data as Quote[]).filter(q => StringUtils.isEmpty(q.approved) || q.approved === "Y"));
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

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            {!busy.state && <Row justify="center">
                <h1>Browse Quotes</h1>
                <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                    <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                        <Col>{currentIndex + 1} of {allQuotes.length}</Col>
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