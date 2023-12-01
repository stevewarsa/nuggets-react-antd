import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {notification, Button, Col, Dropdown, Menu, Popover, Row, Space, Modal, MenuProps, Avatar} from "antd";
import {
    ArrowDownOutlined,
    ArrowLeftOutlined,
    ArrowRightOutlined,
    ArrowUpOutlined, BorderOutlined,
    CheckSquareOutlined,
    CopyOutlined,
    EditOutlined,
    FileSearchOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    MoreOutlined,
    QuestionCircleOutlined, StopOutlined,
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
import {useNavigate} from "react-router-dom";
import {UpdatePassageParam} from "../model/update-passage-param";

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

const getBox = (psg: Passage) => {
    if (!psg) {
        return "N/A";
    } else {
        return psg.frequencyDays.toString();
    }
};
let MORE_MENU_ITEMS: MenuProps["items"] = [
    {
        label: "Copy",
        key: "1",
        icon: <CopyOutlined/>,
    },
    {
        label: "Interlinear View...",
        key: "2",
        icon: <LinkOutlined />,
    },
    {
        label: "Edit...",
        key: "3",
        icon: <EditOutlined />,
    },
    {
        label: "View Chapter...",
        key: "4",
        icon: <FileSearchOutlined />,
    }
];
const moveUp = {
    label: "Move Up...",
    key: "5",
    icon: <ArrowUpOutlined />,
};
const moveDown = {
    label: "Move Down...",
    key: "6",
    icon: <ArrowDownOutlined />,
};

const Practice = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const {getMemPassages} = useMemoryPassages();

    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const user = useSelector((state: AppState) => state.user);

    const [busy, setBusy] = useState({state: false, message: ""});
    const [memPsgList, setMemPsgList] = useState<Passage[]>([]);
    const [versesByPsgId, setVersesByPsgId] = useState<{[psgId: number]: Verse[]}>();
    const [overrides, setOverrides] = useState<Passage[]>([]);
    const [currIdx, setCurrIdx] = useState(-1);
    const [currPsgRef, setCurrPsgRef] = useState<string>("");
    const [currPsgTxt, setCurrPsgTxt] = useState<string>("");
    const [currPassage, setCurrPassage] = useState<Passage>(null);
    const [showingQuestion, setShowingQuestion] = useState(true);
    const [showPsgRef, setShowPsgRef] = useState(practiceConfig.practiceMode === PassageUtils.BY_REF);
    const [infoVisible, setInfoVisible] = useState(false);
    const [editing, setEditing] = useState(false);
    const [isMemPassageListGetFromServer, setIsMemPassageListGetFromServer] = useState(false);
    const [startAtPassage, setStartAtPassage] = useState(practiceConfig.startAtPassageId);
    const [moreMenuItems, setMoreMenuItems] = useState(MORE_MENU_ITEMS)

    // grab the memory verses from the server based on the practice config...
    useEffect(() => {
        setBusy({state: true, message: "Loading memory passages from DB..."});
        getMemPassages(user, true).then(resp => {
            const memPsgList: Passage[] = resp.passages;
            setIsMemPassageListGetFromServer(true);
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
        if (memPsgList && memPsgList.length > 0 && isMemPassageListGetFromServer) {
            const foundPassageIndex = memPsgList.findIndex(psg => psg.passageId === startAtPassage);
            if (foundPassageIndex >= 0) {
                doNavigate(true, foundPassageIndex);
                setStartAtPassage(-1);
            } else {
                doNavigate(true, -1);
            }

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

    useEffect(() => {
        const hasMoveUp = moreMenuItems.find(menu => menu.key === "5");
        const hasMoveDown = moreMenuItems.find(menu => menu.key === "6");
        let updatedArray = false;
        let locMoreMenuItems = [...moreMenuItems];
        if (currPassage?.frequencyDays > 1 && hasMoveUp === undefined) {
            locMoreMenuItems.push(moveUp);
            updatedArray = true;
        }
        if (currPassage?.frequencyDays < 5 && hasMoveDown === undefined) {
            locMoreMenuItems.push(moveDown);
            updatedArray = true;
        }
        if (hasMoveUp !== undefined && currPassage?.frequencyDays === 1) {
            locMoreMenuItems = locMoreMenuItems.filter(menu => menu.key !== "5");
            updatedArray = true;
        }
        if (hasMoveDown !== undefined && currPassage?.frequencyDays === 5) {
            locMoreMenuItems = locMoreMenuItems.filter(menu => menu.key !== "6");
            updatedArray = true;
        }
        if (updatedArray) {
            setMoreMenuItems(locMoreMenuItems);
        }
    }, [currPassage]);

    const successfulUpdateFinished = (index: number) => {
        console.log("Practice.successfulUpdateFinished - clearing versesByPsgId...");
        setVersesByPsgId({});
        console.log("Practice.successfulUpdateFinished - versesByPsgId cleared.");
        setEditing(false);
        setBusy({state: true, message: "Loading memory passages from DB..."});
        console.log("Practice.successfulUpdateFinished - Loading memory passages from DB...");
        getMemPassages(user, true).then(resp => {
            if (resp.passages) {
                console.log("Practice.successfulUpdateFinished - finished successfully loading memory passages from DB. Here are the overrides:", resp.overrides);
                setMemPsgList(resp.passages);
                setOverrides(resp.overrides);
                setCurrIdx(index);
            } else {
                console.log("Practice.successfulUpdateFinished - Unable to reload memory passages!");
                notification.error({message: "Unable to reload memory passages!", placement: "bottomRight"});
            }
            setBusy({state: false, message: ""});
        });
    };

    // the purpose of this method is to reinitialize some flags and other values for the UI, then to set the current index
    const doNavigate = (next: boolean, toIndex: number) => {
        // set defaults for navigating to previous passage
        setShowingQuestion(true);
        // if user pressed the answer button, show passage ref has been changed to what it was originally,
        // so set it back to whatever was in practiceConfig
        setShowPsgRef(practiceConfig.practiceMode === PassageUtils.BY_REF);
        setEditing(false);
        setCurrPsgTxt("");
        setCurrPsgRef("");
        if (toIndex !== -1) {
            setCurrIdx(toIndex);
        } else {
            let navigateToIndex;
            if (next) {
                navigateToIndex = currIdx === (memPsgList.length - 1) ? 0 : currIdx + 1;
            } else {
                navigateToIndex = currIdx === 0 ? memPsgList.length - 1 : currIdx - 1;
            }
            setCurrIdx(navigateToIndex);
        }
    };

    // purpose of this method is to populate the currPsgRef and currPsgTxt
    const populateVerses = async (copyToClipboard: boolean) => {
        const currPsg: Passage = {...memPsgList[currIdx]};
        if (versesByPsgId && versesByPsgId[currPsg.passageId]?.length > 0) {
            // we've already looked up the verses for this passage, just populate them
            currPsg.verses = versesByPsgId[currPsg.passageId];
            convertPassageToString(currPsg);
            setCurrPassage(currPsg);
        } else {
            const override = overrides.find(p => p.passageId === currPsg.passageId);
            if (override) {
                // this is an override, so we don't need to call the server, just update the verses from the override
                currPsg.verses = override.verses;
                convertPassageToString(currPsg);
                setCurrPassage(currPsg);
            } else {
                // this is not an override, so call server to get verses
                setBusy({state: true, message: "Getting psg " + (currIdx + 1) + " (psg id " + currPsg.passageId + ")..."});
                const resp = await memoryService.getPassage(currPsg, user);
                currPsg.verses = resp.data.verses;
                setVersesByPsgId(prev => {
                    const locVbyPsgId = {...prev};
                    locVbyPsgId[currPsg.passageId] = currPsg.verses;
                    return locVbyPsgId;
                });
                convertPassageToString(currPsg);
                setCurrPassage(currPsg);
                setBusy({state: false, message: ""});
            }
        }
        if (copyToClipboard) {
            handleClipboard(currPsg);
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
        setCurrPassage(psg);
    };

    const handleToggleAnswer = () => {
        // if we're currently showing passage ref, call populateVerses, else call convertPsgRefToString
        if (showPsgRef) {
            populateVerses(false)
                .then(() => console.log("Practice.handleToggleAnswer - populate verses finished"));
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
            populateVerses(false).then(() => {
                setBusy({state: false, message: ""});
                setEditing(true);
            });
        } else if (key === "4") {
            // View Chapter
            handleGoToPassage();
        } else if (key === "5") {
            // Move up
            handleMoveUp();
        } else if (key === "6") {
            // Move up
            handleMoveDown();
        }
    };

    const handleMoveUp = () => {
        const targetBox = currPassage.frequencyDays - 1;
        if (currPassage.frequencyDays === 2) {
            updateBox(targetBox)
        } else {
            Modal.confirm({
                title: "Select Target Box",
                content: "Would you like to move this to Box 1 or move up one to " + targetBox + "?",
                okText: "Box 1",
                cancelText: "Box " + targetBox,
                closable: true,
                onOk() {
                    updateBox(1);
                },
                onCancel() {
                    updateBox(targetBox);
                },
            });
        }
    };

    const handleMoveDown = () => {
        updateBox(currPassage.frequencyDays + 1);
    };

    const updateBox = (newBox: number) => {
        const updateParam: UpdatePassageParam = new UpdatePassageParam();
        updateParam.passageRefAppendLetter = currPassage.passageRefAppendLetter;
        updateParam.user = user;
        updateParam.newText = null;
        updateParam.passage = {...currPassage,
            frequencyDays: newBox
        };
        setBusy({state: true, message: "Updating box..."});
        memoryService.updatePassage(updateParam).then(resp => {
            if (resp.data === "success") {
                notification.success({message: "Box has been updated!", placement: "bottomRight"});
                const updatedMemPsgList = [...memPsgList];
                const index = updatedMemPsgList.findIndex(item => item.passageId === updateParam.passage.passageId);
                if (index !== -1) {
                    updatedMemPsgList[index].frequencyDays = updateParam.passage.frequencyDays;
                    setIsMemPassageListGetFromServer(false);
                    setMemPsgList(updatedMemPsgList);
                }
            } else {
                notification.error({message: "Error updating passage: " + resp.data, placement: "top"});
            }
            setBusy({state: false, message: ""});
        });

    };

    const handleGoToPassage = () => {
        dispatcher(stateActions.setChapterSelection({
            book: currPassage.bookName,
            chapter: currPassage.chapter,
            verse: currPassage.startVerse,
            translation: StringUtils.isEmpty(currPassage.translationName) ? "niv" : currPassage.translationName
        }));
        navigate("/readChapter");
    };


    return (
        <>
            <Row justify="center">
                <h1>Memory Verses</h1>
            </Row>
            <Swipe tolerance={60} onSwipeLeft={() => doNavigate(true, -1)} onSwipeRight={() => doNavigate(false, -1)}>
                <Row style={{marginBottom: "10px"}} justify="center" align="middle">
                    <Col>{currIdx + 1} of {memPsgList.length}</Col>
                    <Col style={{marginLeft: "5px"}}>
                        <Popover
                            content={
                                <>
                                    <ul>
                                        <li>Box: {getBox(memPsgList[currIdx])}</li>
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
                <Row justify="center" style={{marginBottom: "3px"}}>
                    <Space>
                        <Col span={6}><Button onClick={handleToggleAnswer} className="button" icon={showingQuestion ? <QuestionCircleOutlined className="icon" /> : <CheckSquareOutlined className="icon" />}/></Col>
                        <Col span={6}><Button className="button" icon={<ArrowLeftOutlined className="icon"/>} onClick={() => doNavigate(false, -1)}/></Col>
                        <Col span={6}><Button className="button" icon={<ArrowRightOutlined className="icon"/>} onClick={() => doNavigate(true, -1)}/></Col>
                        <Col span={6}>
                            <Dropdown className="button" placement="bottomRight" trigger={["click"]} overlay={
                                <Menu onClick={handleMenuClick} items={moreMenuItems}>
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
                <Row justify="center" style={{marginBottom: "10px"}}>
                    <Col>{memPsgList[currIdx]?.frequencyDays === 1 ? <Button style={{color: "red"}} disabled={true} className="button" icon={<StopOutlined className="icon" />}/> : <Button onClick={handleMoveUp} className="button" icon={<ArrowUpOutlined className="icon" />}/>}</Col>
                    <Col style={{marginLeft: "3px", marginRight: "3px"}}>
                        <div style={{ textAlign: 'center'}}>
                            <Avatar icon={<BorderOutlined style={{color: "red"}} />}/>
                            <div style={{textAlign: 'center'}}><h1 style={{color: "red", fontWeight: "bolder"}}>{memPsgList[currIdx]?.frequencyDays}</h1></div>
                        </div>
                    </Col>
                    <Col>{memPsgList[currIdx]?.frequencyDays === 5 ? <Button style={{color: "red"}} disabled={true} className="button" icon={<StopOutlined className="icon" />}/> : <Button onClick={handleMoveDown} className="button" icon={<ArrowDownOutlined className="icon" />}/>}</Col>
                </Row>
                {busy.state && <Row justify="center"><SpinnerTimer message={busy.message} /></Row>}
                {showPsgRef && currPassage && !StringUtils.isEmpty(currPsgRef) &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currPassage.passageId}
                        >
                            <p
                                key={currIdx + "-psg-ref"} className="nugget-view" dangerouslySetInnerHTML={{__html: currPsgRef}}/>
                        </CSSTransition>
                    </SwitchTransition>
                }
                {!showPsgRef && currPassage && !StringUtils.isEmpty(currPsgTxt) &&
                    <SwitchTransition mode="out-in">
                        <CSSTransition
                            classNames="fade"
                            addEndListener={(node, done) => {
                                node.addEventListener("transitionend", done, false);
                            }}
                            key={currPassage.passageId}
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
            {currPassage?.passageId > 0 && currPassage?.verses.length > 0 &&
                <EditPassage props={{passage: currPassage, visible: editing, setVisibleFunction: (closedNoChange: boolean) => closedNoChange ? setEditing(false) : successfulUpdateFinished(0)}} />}
        </>
    );
};

export default Practice;