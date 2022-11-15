import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import React, {useCallback, useEffect, useRef, useState} from "react";
import memoryService from "../services/memory-service";
import {PassageUtils} from "../helpers/passage-utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, Collapse, Dropdown, Menu, MenuProps, Modal, notification, Row, Select, Space, Tag} from "antd";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined, CloseOutlined,
    CopyOutlined, FilterOutlined, LinkOutlined,
    MoreOutlined, UnorderedListOutlined,
} from "@ant-design/icons";
import {Constants} from "../model/constants";
import {stateActions} from "../store";
import {VerseSelectionRequest} from "../model/verse-selection-request";
import {useNavigate} from "react-router-dom";
import {CSSTransition, SwitchTransition} from "react-transition-group";
import {Passage} from "../model/passage";
import {Topic} from "../model/topic";
import TopicSelection from "../components/TopicSelection";
const {Panel} = Collapse;
const {Option} = Select;

const menuItemsNoFilter: MenuProps["items"] = [
    {label: "Copy", key: "copy", icon: <CopyOutlined/>},
    {label: "Interlinear View...", key: "interlinear", icon: <LinkOutlined />},
    {label: "Clear Filter...", key: "clear", icon: <CloseOutlined />},
    {label: "Topics...", key: "topics", icon: <UnorderedListOutlined />}
];

const menuItemsNoClear: MenuProps["items"] = [
    {label: "Copy", key: "copy", icon: <CopyOutlined/>},
    {label: "Interlinear View...", key: "interlinear", icon: <LinkOutlined />},
    {label: "Filter...", key: "filter", icon: <FilterOutlined />},
    {label: "Topics...", key: "topics", icon: <UnorderedListOutlined />}
];

const BrowseNuggets = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: AppState) => state.user);
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const incomingTopic: Topic = useSelector((state: AppState) => state.incomingTopic);
    const startingPassageId = useSelector((state: AppState) => state.startingPassageId);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [nuggetIdList, setNuggetIdList] = useState([]);
    const [originalNuggetIdList, setOriginalNuggetIdList] = useState([]);
    const [topicList, setTopicList] = useState<Topic[]>([]);
    const [filterVisible, setFilterVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPassage, setCurrentPassage] = useState<Passage>(undefined);
    const [selectedTranslation, setSelectedTranslation] = useState("niv");
    const [selectedTopic, setSelectedTopic] = useState<number>(-1);
    const [topicFiltered, setTopicFiltered] = useState<boolean>(false);
    const [associatedTopicsOpen, setAssociatedTopicsOpen] = useState(false);
    const [topicSelectionOpen, setTopicSelectionOpen] = useState(false);
    const topicSelectionComp = useRef();

    useEffect(() => {
        if (prefs) {
            setSelectedTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
        }
    }, [prefs]);

    useEffect(() => {
        (async () => {
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
        })();
    }, [user]);

    useEffect(() => {
        if (startingPassageId !== -1) {
            const foundIndex = nuggetIdList.findIndex(nugget => nugget.nuggetId === startingPassageId);
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
        if (key === "copy") {
            if (currentPassage.verses.length === 1) {
                // just immediately copy it to the clipboard
                const psgRef = PassageUtils.getPassageStringNoIndex(currentPassage, true, true);
                PassageUtils.copyPassageToClipboard(currentPassage, true);
                notification.info({message: psgRef + " copied!", placement: "bottomRight"});
            } else {
                // otherwise, route the user to the select verses screen so they can select start/end verse
                dispatcher(stateActions.setVerseSelectionRequest({
                    passage: currentPassage,
                    actionToPerform: "copy",
                    backToPath: "/browseNuggets"
                } as VerseSelectionRequest));
                navigate("/selectVerses");
            }
        } else if (key === "interlinear") {
            // interlinear link
            PassageUtils.openInterlinearLink(currentPassage);
        } else if (key === "filter") {
            // filter
            setFilterVisible(true);
        } else if (key === "clear") {
            // clear filter
            setSelectedTopic(-1);
            setNuggetIdList(originalNuggetIdList);
            setTopicFiltered(false);
            dispatcher(stateActions.setIncomingTopic(null));
        } else if (key === "topics") {
            setTopicSelectionOpen(true);
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
        (async () => {
            setBusy({state: true, message: "Retrieving passages for topic..."});
            const passagesByTopicResponse = await memoryService.getPassagesForTopic(selectedTopic, user);
            const passagesByTopic = passagesByTopicResponse.data;
            const filteredNuggetIdList = nuggetIdList.filter(nugget => passagesByTopic.find(tpcPsg => tpcPsg.passageId === nugget.nuggetId));
            setNuggetIdList(filteredNuggetIdList);
            setTopicFiltered(true);
            setBusy({state: false, message: ""});
        })();
    };

    const handleOk = (val) => {
        console.log("handleOk on filter dialog");
        setSelectedTopic(val);
        setFilterVisible(false);
        filterToSelectedTopic();
    };
    const handleRemoveTopic = (topic: { id: number, name: string }) => {
        setBusy({state: true, message: "Removing topic from passage..."});
        console.log("Remove topic: ", topic);
        memoryService.removePassageTopic(topic, currentPassage.passageId, user)
            .then((removePassageTopicResponse) => {
                console.log(removePassageTopicResponse.data);
                setBusy({state: false, message: ""});
                if (removePassageTopicResponse.data.message === "success") {
                    notification.success({message: "Removed topic '" + topic.name + "' from current passage!", placement: "bottomRight"});
                    const updatedPassage = {...currentPassage, topics: currentPassage.topics.filter(tpc => tpc.id !== topic.id)};
                    setCurrentPassage(updatedPassage);
                    setAssociatedTopicsOpen(false);
                } else {
                    notification.warning({message: "Unable to remove topic '" + topic.name + "' from current passage.", placement: "topLeft"});
                }
            });
    };

    function finishAddTopics(topics: Topic[]) {
        const updatedTopics = [...currentPassage.topics];
        for (const topic of topics) {
            updatedTopics.push(topic);
        }
        const updatedPassage = {...currentPassage, topics: updatedTopics};
        setCurrentPassage(updatedPassage);
        setAssociatedTopicsOpen(false);
    }

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
                            <Dropdown key="dd" placement="bottomRight" trigger={["click"]} overlay={
                                <Menu key="menu" onClick={handleMenuClick} items={topicFiltered ? menuItemsNoFilter : menuItemsNoClear}/>
                            }>
                                <MoreOutlined key="more" style={{
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
                {topicFiltered && selectedTopic !== -1 && topicList.length > 0 &&
                    <Row justify="center">
                        <Col>(<span style={{fontWeight: "bold"}}>Filtered Topic:</span> {topicList.find(tpc => tpc.id === selectedTopic).name})</Col>
                    </Row>
                }
                {currentPassage && currentPassage.topics && currentPassage.topics.length > 0 &&
                    <Row key="tags-row" justify="center">
                        <Col>
                            <Collapse activeKey={associatedTopicsOpen ? "1" : null} ghost
                                      onChange={(activeKeyString: string[]) => setAssociatedTopicsOpen(activeKeyString.length > 0)}>
                                <Panel
                                    header={"Associated Topics (" + currentPassage.topics.length + ")"}
                                    key="1" style={{fontWeight: "bolder", fontSize: "18px"}}>
                                    {currentPassage.topics.map(topic => (
                                        <Tag closable
                                             onClose={e => {
                                                 e.preventDefault();
                                                 handleRemoveTopic(topic);
                                             }}
                                             key={topic.id}
                                             className="topic">
                                            {topic.name}
                                        </Tag>
                                    ))}
                                </Panel>
                            </Collapse>
                        </Col>
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
            {currentPassage &&
                <Modal footer={null}
                       onCancel={() => {
                           // @ts-ignore
                           topicSelectionComp.current.cleanup();
                           setTopicSelectionOpen(false);
                       }}
                       open={topicSelectionOpen}
                       title={"Topics for " + PassageUtils.getPassageStringNoIndex(currentPassage, true, true)}>
                    <TopicSelection ref={topicSelectionComp} props={{
                        associatedTopics: currentPassage.topics,
                        addTopicFunction: (topics: Topic[]) => {
                            console.log("BrowseNuggets.TopicSelection modal - Adding topics: ", topics);
                            setBusy({state: true, message: "Adding topic(s) to passage..."});
                            memoryService.addPassageTopics(topics.map(tpc => tpc.id), currentPassage.passageId, user).then(response => {
                                setBusy({state: false, message: ""});
                                if (response.data === "success") {
                                    notification.success({message: "Added topics to current passage!", placement: "bottomRight"});
                                    finishAddTopics(topics);
                                } else {
                                    notification.warning({message: "Unable to add topics to current passage.", placement: "topLeft"});
                                }
                            });
                            setTopicSelectionOpen(false);
                        },
                        newTopicFunction: (newTopicValue: string) => {
                            setBusy({state: true, message: "Adding new topic '" + newTopicValue + "' to passage..."});
                            memoryService.addNewPassageTopic({id: -1, name: newTopicValue.trim()}, currentPassage.passageId, user).then(response => {
                                setBusy({state: false, message: ""});
                                if (response.data.message === "success") {
                                    notification.success({message: "Added topic to current passage!", placement: "bottomRight"});
                                    finishAddTopics([response.data.topic]);
                                } else {
                                    notification.warning({message: "Unable to add topic to current passage.", placement: "topLeft"});
                                }
                            });
                            setTopicSelectionOpen(false);
                        }
                    }}/>
                </Modal>
            }
        </>
    );
};

export default BrowseNuggets;