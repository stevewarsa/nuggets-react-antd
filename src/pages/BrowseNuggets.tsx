import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useCallback, useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import {PassageUtils} from "../helpers/passage-utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Dropdown, Menu, Modal, Row, Select, Space} from "antd";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined, CloseOutlined,
    CopyOutlined, FilterOutlined, LinkOutlined,
    MoreOutlined
} from "@ant-design/icons";
import {Constants} from "../model/constants";
import {stateActions} from "../store";
import {VerseSelectionRequest} from "../model/verse-selection-request";
import {useNavigate} from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const BrowseNuggets = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: AppState) => state.user);
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const incomingTopic: { id: number; name: string } = useSelector((state: AppState) => state.incomingTopic);
    const startingPassageId = useSelector((state: AppState) => state.startingPassageId);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [nuggetIdList, setNuggetIdList] = useState([]);
    const [originalNuggetIdList, setOriginalNuggetIdList] = useState([]);
    const [topicList, setTopicList] = useState<{id: number, name: string}[]>([]);
    const [filterVisible, setFilterVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPassage, setCurrentPassage] = useState(undefined);
    const [selectedTranslation, setSelectedTranslation] = useState("niv");
    const [selectedTopic, setSelectedTopic] = useState<number>(-1);
    const {Option} = Select;

    useEffect(() => {
        if (prefs) {
            setSelectedTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
        }
    }, [prefs]);

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving nugget list from server..."});
            const nuggetIdListResponse = await memoryService.getNuggetIdList(user);
            const nuggetIdList = nuggetIdListResponse.data;
            PassageUtils.shuffleArray(nuggetIdList);
            setNuggetIdList(nuggetIdList);
            setOriginalNuggetIdList(nuggetIdList);
            setBusy({state: true, message: "Retrieving topic list from server..."});
            const topicListResponse = await memoryService.getTopicList(user);
            setTopicList(topicListResponse.data);
            if (incomingTopic) {
                filterToSelectedTopic();
            }
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [user]);

    useEffect(() => {
        if (startingPassageId !== -1) {
            // console.log("useEffect [startingPassageId, nuggetIdList] - current nugget list:", nuggetIdList);
            const foundIndex = nuggetIdList.findIndex(nugget => nugget.nuggetId === startingPassageId);
            // console.log("useEffect [startingPassageId, nuggetIdList] - startingPassageId: " + startingPassageId + ", foundIndex: " + foundIndex);
            setCurrentIndex(foundIndex);
        } else {
            setCurrentIndex(0);
        }
    }, [startingPassageId, nuggetIdList]);

    useEffect(() => {
        if (incomingTopic && incomingTopic.id !== -1) {
            setSelectedTopic(incomingTopic.id);
        }
    }, [incomingTopic]);

    useEffect(() => {
        if (selectedTopic && selectedTopic !== -1) {
            filterToSelectedTopic();
        }
    }, [selectedTopic, originalNuggetIdList]);

    const retrievePassage = useCallback(async () => {
        if (!nuggetIdList || currentIndex > (nuggetIdList.length - 1) || currentIndex < 0) {
            return;
        }
        // console.log("Current Index: " + currentIndex);
        let passageId: number = parseInt(nuggetIdList[currentIndex].nuggetId);
        setBusy({state: true, message: "Retrieving passage text..."});
        const passageResponse = await memoryService.getPassageById(passageId, selectedTranslation, user);
        setCurrentPassage(passageResponse.data);
        setBusy({state: false, message: ""});
    }, [nuggetIdList, currentIndex, selectedTranslation, user]);

    const handleNext = () => {
        setCurrentIndex(PassageUtils.getNextIndex(currentIndex, nuggetIdList.length, true));
    };

    const handlePrev = () => {
        setCurrentIndex(PassageUtils.getNextIndex(currentIndex, nuggetIdList.length, false));
    };

    const handleMenuClick = ({key}) => {
        if (key === "1") {
            // console.log("handleMenuClick - Here are the verses for selection:");
            // console.log(formattedVersesAsArray);
            dispatcher(stateActions.setVerseSelectionRequest({passage: currentPassage, actionToPerform: "copy", backToPath: "/browseNuggets"} as VerseSelectionRequest));
            navigate("/selectVerses");
        } else if (key === "2") {
            // interlinear link
            PassageUtils.openInterlinearLink(currentPassage);
        } else if (key === "3") {
            // filter
            setFilterVisible(true);
        } else if (key === "4") {
            // clear filter
            setSelectedTopic(-1);
            setNuggetIdList(originalNuggetIdList);
            dispatcher(stateActions.setIncomingTopic(null));
        }
    };

    const handleTranslationChange = (value) => {
        setSelectedTranslation(value);
    };

    useEffect(() => {
        retrievePassage();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, [selectedTranslation, retrievePassage, currentIndex, nuggetIdList]);

    const filterToSelectedTopic = () => {
        if (selectedTopic === -1) {
            console.log("Selected topic id not set yet...  returning");
            return;
        }
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving passages for topic..."});
            const passagesByTopicResponse = await memoryService.getPassagesForTopic(selectedTopic, user);
            const passagesByTopic = passagesByTopicResponse.data;
            console.log("passages by topic:", passagesByTopic);
            console.log("nugget id list:", nuggetIdList);
            const filteredNuggetIdList = nuggetIdList.filter(nugget => passagesByTopic.find(tpcPsg => tpcPsg.passageId === nugget.nuggetId));
            console.log("filtered passage list is:", filteredNuggetIdList);
            setNuggetIdList(filteredNuggetIdList);
            setBusy({state: false, message: ""});
        };
        callServer();
    };

    const handleOk = (val) => {
        console.log("handleOk on filter dialog");
        setSelectedTopic(val);
        setFilterVisible(false);
        filterToSelectedTopic();
    };

    return (
        <>
            <Row justify="center">
                <h1>Browse Bible</h1>
            </Row>
            {busy.state &&
                <Row justify="center">
                    <SpinnerTimer message={busy.message}/>;
                </Row>
            }
            <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                {nuggetIdList && nuggetIdList.length > 0 &&
                    <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                        <Col>{currentIndex + 1} of {nuggetIdList.length}</Col>
                    </Row>
                }
                <Row justify="center" style={{marginBottom: "8px"}}>
                    <Space>
                        <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                        <Select style={{width: "100%"}} size="large" value={selectedTranslation} onChange={handleTranslationChange}>
                            <Option value="N/A">{"--Select Translation--"}</Option>
                            {Constants.translationsShortNms.map(trans => (
                                    <Option key={trans.code} value={trans.code}>{trans.translationName}</Option>
                                )
                            )}
                        </Select>
                        <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                        <Col span={6}>
                            <Dropdown placement="bottomRight" trigger={["click"]} overlay={
                                <Menu onClick={handleMenuClick}>
                                    <Menu.Item key="1" icon={<CopyOutlined/>}>
                                        Copy
                                    </Menu.Item>
                                    <Menu.Item key="2" icon={<LinkOutlined />}>
                                        Interlinear View
                                    </Menu.Item>
                                    <Menu.Item key="3" icon={<FilterOutlined />}>
                                        Filter...
                                    </Menu.Item>
                                    {selectedTopic && selectedTopic !== -1 &&
                                        <Menu.Item key="4" icon={<CloseOutlined/>}>
                                            Clear Filter
                                        </Menu.Item>
                                    }
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
                {selectedTopic && selectedTopic !== -1 && topicList.length > 0 &&
                    <Row>
                        <Col><span style={{fontWeight: "bold"}}>Filtered Topic:</span> {topicList.find(tpc => tpc.id === selectedTopic).name}</Col>
                    </Row>
                }
                {currentPassage && (
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currentPassage.passageId}
                        >
                            <>
                            <p key={"psg-ref-" + currentPassage.passageId} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(currentPassage, currentIndex + 1, nuggetIdList.length, Constants.translationsShortNms.filter(t => t.code === currentPassage.bookName).map(t => t.translationName)[0], true, false, null)}}/>
                            <p key={"psg-text-" + currentPassage.passageId} style={{marginTop: "10px"}} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getFormattedPassageText(currentPassage, true)}}/>
                            </>
                        </CSSTransition>
                    </SwitchTransition>
                )}
            </Swipe>
            <Modal footer={null} title="Filter Dialog" open={filterVisible}>
                <>
                <Row><Col>Filter By Topic:</Col></Row>
                <Row>
                    <Col span={24}>
                        <Select style={{width: "100%"}} size="large" value={selectedTopic} onChange={value => handleOk(value)}>
                            <Option value={-1}>--Select Topic--</Option>
                            {topicList.map(topic => (
                                    <Option key={topic.id} value={topic.id}>{topic.name}</Option>
                                )
                            )}
                        </Select>
                    </Col>
                </Row>
                </>
            </Modal>
        </>
    );
};

export default BrowseNuggets;