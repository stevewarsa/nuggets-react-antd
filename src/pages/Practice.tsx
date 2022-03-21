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
    ArrowRightOutlined,
    CheckSquareOutlined,
    CopyOutlined,
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

const Practice = () => {
    const dispatcher = useDispatch();
    const {getMemPassages} = useMemoryPassages();
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const memTextOverrides = useSelector((state: AppState) => state.memTextOverrides);
    const user = useSelector((state: AppState) => state.user);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [memPassageList, setMemPassageList] = useState<Passage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showingQuestion, setShowingQuestion] = useState(true);
    const [showPsgRef, setShowPsgRef] = useState(practiceConfig.practiceMode === PassageUtils.BY_REF);
    const [infoVisible, setInfoVisible] = useState(false);

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
            // console.log("populateVerses - currPassage has no verses, so calling server to get verses");
            const locMemoryPassageData: any = await memoryService.getPassage(currPassage, user);
            // console.log("populateVerses - back from getting passage text.  Here is the data returned:");
            // console.log(locMemoryPassageData.data);
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
        // console.log("displayPassageOnScreen - psgList:");
        // console.log(memPassageList);
        const currPassage = memPassageList && memPassageList.length > currentIndex ?
            memPassageList[currentIndex] :
            null;
        // console.log("displayPassageOnScreen - currPassage:");
        // console.log(currPassage);
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
            // console.log("Inside anonymous async function - calling memoryService.getMemoryPsgList()...");
            // console.log("Inside call server - setting memPassageList - there are " + tempPassages.length + " passages returned...");
            setMemPassageList(await getMemPassages(user, true));
            setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
            handleNext();
            setBusy({state: false, message: ""});
        })();
    }, [practiceConfig, memTextOverrides, user]);

    const handlePrev = () => {
        setShowingQuestion(true);
        setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
        setCurrentIndex(prev => prev === 0 ? memPassageList.length - 1 : prev - 1);
    };
    const handleNext = () => {
        // console.log("handleNext - incrementing current index (currently " + currentIndex + ")");
        setShowingQuestion(true);
        setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
        setCurrentIndex(prev => prev === (memPassageList.length - 1) ? 0 : prev + 1);
    };

    const handleToggleAnswer = () => {
        setShowingQuestion(prev => !prev);
        setShowPsgRef(prev => !prev);
    };

    useEffect(() => {
        // console.log("useEffect [showPsgRef] - calling displayPassageOnScreen (current showPsgRef = " + showPsgRef + ")");
        displayPassageOnScreen();
    }, [showPsgRef]);

    useEffect(() => {
        // console.log("useEffect [currentIndex] (currentIndex = " + currentIndex + ")");
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

    const handleInfo = () => {
        setInfoVisible(true);
    };

    const handleHideInfo = () => {
        setInfoVisible(false);
    };

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
                // console.log("calling populateVerses()...");
                await populateVerses(currPassage, true);
            } else {
                notification.info({message: PassageUtils.copyPassageToClipboard(currPassage, true) + " copied!", placement: "bottomRight"});
            }
        } else if (key === "2") {
            // interlinear link
            PassageUtils.openInterlinearLink(currPassage);
        }
    };

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            <Row justify="center">
                <h1>Memory Verses</h1>
            </Row>
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
                                    <Button type="link" onClick={handleHideInfo}>Close</Button>
                                </>
                            }
                            title="Additional Info"
                            trigger="click"
                            visible={infoVisible}
                        >
                            <Button icon={<InfoCircleOutlined />} onClick={handleInfo}/>
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
                {showPsgRef && memPassageList && memPassageList.length > currentIndex && memPassageList[currentIndex] &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currentIndex + "-psg-ref"}
                        >
                            <p key={currentIndex + "-psg-ref"} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(memPassageList[currentIndex], currentIndex, memPassageList.length, Constants.translationsShortNms.filter(t => t.code === memPassageList[currentIndex].translationName).map(t => t.translationName)[0], false, false, memPassageList[currentIndex].passageRefAppendLetter)}}/>
                        </CSSTransition>
                    </SwitchTransition>
                }
                {!showPsgRef && memPassageList && memPassageList.length > currentIndex && memPassageList[currentIndex] && memPassageList[currentIndex].verses && memPassageList[currentIndex].verses.length &&
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