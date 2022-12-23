import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
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
import {CSSTransition, SwitchTransition} from "react-transition-group";
import useMemoryPassages from "../hooks/use-memory-passages";
import EditPassage from "../components/EditPassage";
import {Verse} from "../model/verse";

const handleClipboard = (psg: Passage) => {
    const clipboardContent = PassageUtils.getPassageForClipboard(psg, true);
    if (StringUtils.isEmpty(clipboardContent)) {
        console.log("populateVerses - Unable to copy passage to clipboard...");
    } else {
        notification.info({
            message: PassageUtils.copyPassageToClipboard(psg, true) + " copied!",
            placement: "bottomRight"
        })
    }
}

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

const Practice = () => {
    const dispatcher = useDispatch();
    const {getMemPassages} = useMemoryPassages();

    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const user = useSelector((state: AppState) => state.user);

    const [busy, setBusy] = useState({state: false, message: ""});
    const [memPsgList, setMemPsgList] = useState<Passage[]>([]);
    const [versesByPsgId, setVersesByPsgId] = useState<{[psgId: number]: Verse[]}>()
    const [overrides, setOverrides] = useState<Passage[]>([]);
    const [currIdx, setCurrIdx] = useState(-1);
    const [currPsgRef, setCurrPsgRef] = useState<string>("");
    const [currPsgTxt, setCurrPsgTxt] = useState<string>("");
    const [showingQuestion, setShowingQuestion] = useState(true);
    const [showPsgRef, setShowPsgRef] = useState(practiceConfig.practiceMode === PassageUtils.BY_REF);
    const [infoVisible, setInfoVisible] = useState(false);
    const [editing, setEditing] = useState(false);

    // grab the memory verses from the server based on the practice config...
    useEffect(() => {
        setBusy({state: true, message: "Loading memory passages from DB..."});
        console.log("Practice.useEffect[practiceConfig] - invoking getMemPassages... practiceConfig: ", practiceConfig);
        getMemPassages(user, true).then(resp => {
            const memPsgList: Passage[] = resp.passages;
            setMemPsgList(memPsgList);
            const memPsgTxtOverrideList: Passage[] = resp.overrides;
            if (memPsgTxtOverrideList) {
                setOverrides(memPsgTxtOverrideList);
            }
            setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
            setBusy({state: false, message: ""});
        });
    }, [practiceConfig]);

    // once the memory passages are loaded, navigate to the first passage
    useEffect(() => {
        if (memPsgList && memPsgList.length > 0) {
            navigate(true);
        }
    }, [memPsgList]);

    // this effect responds to the current index being changed:
    // 1. it populates verses or psg ref (based on display mode)
    // 2. updates chapter selection in store
    // 3. updates last viewed time
    useEffect(() => {
        if (currIdx === -1) {
            return;
        }
        console.log("Practice.navigate - memPassageList[" + currIdx + "] (currPsg): ", memPsgList[currIdx]);
        if (practiceConfig.practiceMode !== PassageUtils.BY_REF) {
            // we are showing the passage text, so need to load it if it is not already loaded
            populateVerses(false);
        } else {
            convertPsgRefToString(memPsgList[currIdx]);
        }
        dispatcher(stateActions.setChapterSelection({chapter: memPsgList[currIdx].chapter, book: memPsgList[currIdx].bookName, translation: memPsgList[currIdx].translationName}));
        if (user !== Constants.GUEST_USER) {
            const dt = new Date();
            let dtNum = dt.getTime();
            const formattedDateTime = DateUtils.formatDateTime(dt, "MM-dd-yy KK:mm:ss");
            // fire and forget - don't need to wait for the result
            memoryService.updateLastViewed(user, memPsgList[currIdx].passageId, dtNum, formattedDateTime);
        }
    }, [currIdx]);

    // the purpose of this method is to reinitialize some flags and other values for the UI, then to set the current index
    const navigate = (next: boolean) => {
        // set defaults for navigating to previous passage
        setShowingQuestion(true);
        // if user pressed the answer button, show passage ref has been changed to what it was originally,
        // so set it back to whatever was in practiceConfig
        setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
        setEditing(false);
        setCurrPsgTxt("");
        setCurrPsgRef("");
        let navigateToIndex;
        if (next) {
            navigateToIndex = currIdx === (memPsgList.length - 1) ? 0 : currIdx + 1;
        } else {
            navigateToIndex = currIdx === 0 ? memPsgList.length - 1 : currIdx - 1;
        }
        setCurrIdx(navigateToIndex);
    };

    // purpose of this method is to populate the currPsgRef and currPsgTxt
    const populateVerses = (copyToClipboard: boolean) => {
        const currPsg: Passage = {...memPsgList[currIdx]};
        if (versesByPsgId && versesByPsgId[currPsg.passageId] && versesByPsgId[currPsg.passageId].length > 0) {
            // we've already looked up the verses for this passage, just populate them
            currPsg.verses = versesByPsgId[currPsg.passageId];
            convertPassageToString(currPsg);
        } else {
            const override = overrides.find(p => p.passageId === currPsg.passageId);
            if (override) {
                // this is an override, so we don't need to call the server, just update the verses from the override
                currPsg.verses = override.verses;
                convertPassageToString(currPsg);
            } else {
                // this is not an override, so call server to get verses
                setBusy({
                    state: true,
                    message: "Getting psg " + (currIdx + 1) + " (psg id " +
                        currPsg.passageId + ")..."
                });
                memoryService.getPassage(currPsg, user).then(resp => {
                    const psg: Passage = resp.data;
                    setVersesByPsgId(prev => {
                        const locVbyPsgId = {...prev};
                        locVbyPsgId[currPsg.passageId] = psg.verses;
                        return locVbyPsgId;
                    });
                    convertPassageToString(psg);
                    if (copyToClipboard) {
                        handleClipboard(psg);
                    }
                    setBusy({state: false, message: ""});
                });
            }
        }
    };

    const convertPassageToString = (psg: Passage) => {
        convertPsgRefToString(psg);
        const locPsgTxt = PassageUtils.getFormattedPassageText(psg, false);
        setCurrPsgTxt(locPsgTxt);
    };

    const convertPsgRefToString = (psg: Passage) => {
        const locPsgRef = PassageUtils.getPassageString(
            psg,
            currIdx,
            memPsgList.length,
            Constants.translationsShortNms.filter(t => t.code === psg.translationName).map(t => t.translationName)[0],
            false,
            false,
            psg.passageRefAppendLetter);
        setCurrPsgRef(locPsgRef);
    };

    const handleToggleAnswer = () => {
        // if we're currently showing passage ref, call populateVerses, else call convertPsgRefToString
        if (showPsgRef) {
            populateVerses(false);
        } else {
            convertPsgRefToString(memPsgList[currIdx]);
        }
        // now update flags for UI
        setShowingQuestion(prev => !prev);
        setShowPsgRef(prev => !prev);
    };

    const handleMenuClick = async ({key}) => {
        let currPassage = memPsgList[currIdx];
        if (key === "1") {
            // copy
            let clipboardContent = PassageUtils.getPassageForClipboard(currPassage, true);
            if (StringUtils.isEmpty(clipboardContent)) {
                populateVerses(true);
            } else {
                notification.info({message: PassageUtils.copyPassageToClipboard(currPassage, true) + " copied!", placement: "bottomRight"});
            }
        } else if (key === "2") {
            // interlinear link
            PassageUtils.openInterlinearLink(currPassage);
        } else if (key === "3") {
            // Edit
            populateVerses(false);
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
                    <EditPassage passage={memPsgList[currIdx]} />
                    <Row justify="center">
                        <Col>
                            <Button icon={<ArrowUpOutlined />} onClick={() => setEditing(false)}/>
                        </Col>
                    </Row>
                </>
            }
            <Swipe tolerance={60} onSwipeLeft={() => navigate(true)} onSwipeRight={() => navigate(false)}>
                <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                    <Col>{currIdx + 1} of {memPsgList.length}</Col>
                    <Col style={{marginLeft: "5px"}}>
                        <Popover
                            content={
                                <>
                                    <ul>
                                        <li>Frequency: {getFrequency(memPsgList[currIdx])}</li>
                                        <li>Last Practiced: {memPsgList[currIdx]?.last_viewed_str}</li>
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
                        <Col span={6}><Button onClick={handleToggleAnswer} className="button" icon={showingQuestion ? <QuestionCircleOutlined className="icon" /> : <CheckSquareOutlined className="icon" />}/></Col>
                        <Col span={6}><Button className="button" icon={<ArrowLeftOutlined className="icon"/>} onClick={() => navigate(false)}/></Col>
                        <Col span={6}><Button className="button" icon={<ArrowRightOutlined className="icon"/>} onClick={() => navigate(true)}/></Col>
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
                {showPsgRef && !StringUtils.isEmpty(currPsgRef) &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currIdx + "-psg-ref"}
                        >
                            <p
                                key={currIdx + "-psg-ref"} className="nugget-view" dangerouslySetInnerHTML={{__html: currPsgRef}}/>
                        </CSSTransition>
                    </SwitchTransition>
                }
                {!showPsgRef && !StringUtils.isEmpty(currPsgTxt) &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currIdx + "-psg-text"}
                        >
                            <p
                                key={currIdx + "-psg-text"}
                                style={{marginTop: "10px"}}
                                className="nugget-view"
                                dangerouslySetInnerHTML={{__html: currPsgTxt}}/>
                        </CSSTransition>
                    </SwitchTransition>
                }
            </Swipe>
        </>
    );
};

export default Practice;