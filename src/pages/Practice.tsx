import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useCallback, useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {notification, Button, Col, Dropdown, Menu, Popover, Row, Space} from "antd";
import {
    ArrowLeftOutlined,
    ArrowRightOutlined, ArrowUpOutlined,
    CheckSquareOutlined,
    CopyOutlined, EditOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    MoreOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import {Constants} from "../model/constants";
import Swipe from "react-easy-swipe";
import {StringUtils} from "../helpers/string.utils";
import {stateActions} from "../store";
import {DateUtils} from "../helpers/date.utils";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import useMemoryPassages from "../hooks/use-memory-passages";
import EditPassage from "../components/EditPassage";

const Practice = () => {
    const dispatcher = useDispatch();
    const {getMemPassages} = useMemoryPassages();
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const memTextOverrides = useSelector((state: AppState) => state.memTextOverrides);
    const user = useSelector((state: AppState) => state.user);
    const editPassageActive = useSelector((state: AppState) => state.editPassageActive);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [memPassageList, setMemPassageList] = useState<Passage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showingQuestion, setShowingQuestion] = useState(true);
    const [showPsgRef, setShowPsgRef] = useState(practiceConfig.practiceMode === PassageUtils.BY_REF);
    const [infoVisible, setInfoVisible] = useState(false);
    const [editing, setEditing] = useState(false);

    const updatePassageInList = useCallback((passage: Passage) => {
        setMemPassageList(prev => {
            const locPsgList: Passage[] = [...prev];
            locPsgList[currentIndex].verses = passage.verses;
            locPsgList[currentIndex].passageRefAppendLetter = passage.passageRefAppendLetter;
            return locPsgList;
        });
    }, [currentIndex]);

    const populateVerses = useCallback(async (currPassage: Passage, copyToClipboard: boolean) => {
        const override = memTextOverrides.find(p => p.passageId === currPassage.passageId);
        if (override) {
            updatePassageInList(override);
        } else {
            setBusy({
                state: true,
                message: "Calling server to get passage " + (currentIndex + 1) + " with passage id " +
                    currPassage.passageId + "..."
            });
            const locMemoryPassageData: any = await memoryService.getPassage(currPassage, user);
            if (copyToClipboard) {
                const clipboardContent = PassageUtils.getPassageForClipboard(locMemoryPassageData.data, true);
                if (StringUtils.isEmpty(clipboardContent)) {
                    console.log("populateVerses - Unable to copy passage to clipboard...");
                } else {
                    notification.info({message: PassageUtils.copyPassageToClipboard(locMemoryPassageData.data, true) + " copied!", placement: "bottomRight"})
                }
            }
            updatePassageInList(locMemoryPassageData.data);
            setBusy({state: false, message: ""});
        }
    }, [memTextOverrides, currentIndex, updatePassageInList, user]);

    const displayPassageOnScreen = useCallback(async () => {
        const currPassage = memPassageList && memPassageList.length > currentIndex ?
            memPassageList[currentIndex] :
            null;
        if (!currPassage || isNaN(currPassage.passageId) || !currPassage.translationName || !memTextOverrides) {
            if (!memTextOverrides) {
                console.log("displayPassageOnScreen - currPassage (and memTextOverrides) not ready yet - returning");
            } else {
                console.log("displayPassageOnScreen - currPassage not ready yet - returning");
            }
            return;
        }

        dispatcher(stateActions.setChapterSelection({chapter: currPassage.chapter, book: currPassage.bookName, translation: currPassage.translationName}));
        if (showPsgRef) {
            // if we are showing the passage ref, we don't need to retrieve the verses (unnecessary http call)
        } else {
            if (!currPassage.verses || currPassage.verses.length === 0) {
                await populateVerses(currPassage, false);
                // if we're populating verses, this will cause dependencies to change for the useEffect that triggered
                // this, so we should return so that we don't run the memoryService.updateLastViewed twice
            }
        }
    }, [dispatcher, memTextOverrides, populateVerses, currentIndex, memPassageList, showPsgRef]);

    // grab the memory verses from the server based on the practice config...
    useEffect(() => {
        (async () => {
            setBusy({state: true, message: "Loading memory passages from DB..."});
            setMemPassageList(await getMemPassages(user, true));
            setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
            handleNext();
            setBusy({state: false, message: ""});
        })();
    }, [practiceConfig]);

    useEffect(() => {
        console.log("The memTextOverrides has been updated and now has " + memTextOverrides.length + " total passages");
    }, [memTextOverrides]);

    useEffect(() => {
        console.log("Edit passage active changed");
        if (!editPassageActive) {
            setEditing(editPassageActive);
            // this means that the EditPassage component was signaling that it should be closed, therefore
            // it would be wise to update the memory passages list, but keep the index the same
            (async () => {
                setBusy({state: true, message: "Loading memory passages from DB..."});
                setMemPassageList(await getMemPassages(user, true));
                // and go back to the first verse...
                setCurrentIndex(0);
                setBusy({state: false, message: ""});
            })();
        }
    }, [editPassageActive]);

    const handlePrev = () => {
        setShowingQuestion(true);
        setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
        setCurrentIndex(prev => prev === 0 ? memPassageList.length - 1 : prev - 1);
        setEditing(false);
    };
    const handleNext = () => {
        setShowingQuestion(true);
        setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
        setCurrentIndex(prev => prev === (memPassageList.length - 1) ? 0 : prev + 1);
        setEditing(false);
    };

    const handleToggleAnswer = () => {
        setShowingQuestion(prev => !prev);
        setShowPsgRef(prev => !prev);
    };

    useEffect(() => {
        displayPassageOnScreen();
    }, [showPsgRef]);

    useEffect(() => {
        const currPassage = memPassageList && memPassageList.length > currentIndex ?
            memPassageList[currentIndex] :
            null;
        if (currPassage) {
            displayPassageOnScreen();
            if (user !== Constants.GUEST_USER) {
                const dt = new Date();
                let dtNum = dt.getTime();
                const formattedDateTime = DateUtils.formatDateTime(dt, "MM-dd-yy KK:mm:ss");
                // fire and forget - don't need to wait for the result
                memoryService.updateLastViewed(user, currPassage.passageId, dtNum, formattedDateTime);
            }
        }
        setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
    }, [currentIndex]);

    const getFrequency = (psg: Passage) => {
        if (!psg) {
            return "N/A";
        } else {
            if (psg.frequencyDays === -1) {
                return "Every Time";
            } else {
                return psg.frequencyDays.toString();
            }
        }
    };

    const handleMenuClick = async ({key}) => {
        let currPassage = memPassageList[currentIndex];
        if (key === "1") {
            // copy
            let clipboardContent = PassageUtils.getPassageForClipboard(currPassage, true);
            if (StringUtils.isEmpty(clipboardContent)) {
                await populateVerses(currPassage, true);
            } else {
                notification.info({message: PassageUtils.copyPassageToClipboard(currPassage, true) + " copied!", placement: "bottomRight"});
            }
        } else if (key === "2") {
            // interlinear link
            PassageUtils.openInterlinearLink(currPassage);
        } else if (key === "3") {
            // Edit
            setBusy({state: true, message: "Populating passage text..."});
            await populateVerses(currPassage, false);
            setBusy({state: false, message: ""});
            setEditing(true);
            dispatcher(stateActions.setEditPassageActive(true));
        }
    };

    return (
        <>

            <Row justify="center">
                <h1>Memory Verses</h1>
            </Row>
            {editing &&
                <>
                <EditPassage passage={memPassageList[currentIndex]} />
                    <Row justify="center">
                        <Col>
                            <Button icon={<ArrowUpOutlined />} onClick={() => setEditing(false)}/>
                        </Col>
                    </Row>
                </>
            }
            <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                    <Col>{currentIndex + 1} of {memPassageList.length}</Col>
                    <Col style={{marginLeft: "5px"}}>
                        <Popover
                            content={
                                <>
                                    <ul>
                                        <li>Frequency: {getFrequency(memPassageList[currentIndex])}</li>
                                        <li>Last Practiced: {memPassageList[currentIndex]?.last_viewed_str}</li>
                                    </ul>
                                    <Button type="link" onClick={() => setInfoVisible(false)}>Close</Button>
                                </>
                            }
                            title="Additional Info"
                            trigger="click"
                            open={infoVisible}
                        >
                            <Button icon={<InfoCircleOutlined />} onClick={() => setInfoVisible(true)}/>
                        </Popover>
                    </Col>
                </Row>
                <Row justify="center" style={{marginBottom: "10px"}}>
                    <Space>
                        <Col span={6}><Button className="button" icon={showingQuestion ? <QuestionCircleOutlined className="icon" /> : <CheckSquareOutlined className="icon" />} onClick={handleToggleAnswer}/></Col>
                        <Col span={6}><Button className="button" icon={<ArrowLeftOutlined className="icon"/>} onClick={handlePrev}/></Col>
                        <Col span={6}><Button className="button" icon={<ArrowRightOutlined className="icon"/>} onClick={handleNext}/></Col>
                        <Col span={6}>
                            <Dropdown className="button" placement="bottomRight" trigger={["click"]} overlay={
                                <Menu onClick={handleMenuClick}>
                                    <Menu.Item key="1" icon={<CopyOutlined/>}>
                                        Copy
                                    </Menu.Item>
                                    <Menu.Item key="2" icon={<LinkOutlined />}>
                                        Interlinear View
                                    </Menu.Item>
                                    <Menu.Item key="3" icon={<EditOutlined />}>
                                        Edit...
                                    </Menu.Item>
                                </Menu>
                            }>
                                <MoreOutlined className="icon-dropdown" style={{
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
                {busy.state && <Row justify="center"><SpinnerTimer message={busy.message} /></Row>}
                {showPsgRef && memPassageList && memPassageList.length > currentIndex && memPassageList[currentIndex] &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currentIndex + "-psg-ref"}
                        >
                            <p
                                key={currentIndex + "-psg-ref"} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(memPassageList[currentIndex], currentIndex, memPassageList.length, Constants.translationsShortNms.filter(t => t.code === memPassageList[currentIndex].translationName).map(t => t.translationName)[0], false, false, memPassageList[currentIndex].passageRefAppendLetter)}}/>
                        </CSSTransition>
                    </SwitchTransition>
                }
                {!showPsgRef && memPassageList && memPassageList.length > currentIndex && memPassageList[currentIndex] && memPassageList[currentIndex].verses && memPassageList[currentIndex].verses.length > 0 &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currentIndex + "-psg-text"}
                        >
                            <p
                                key={currentIndex + "-psg-text"}
                                style={{marginTop: "10px"}}
                                className="nugget-view"
                                dangerouslySetInnerHTML={{__html: PassageUtils.getFormattedPassageText(memPassageList[currentIndex], false)}}/>
                        </CSSTransition>
                    </SwitchTransition>
                }
            </Swipe>
        </>
    );
};

export default Practice;