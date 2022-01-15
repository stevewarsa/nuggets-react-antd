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
    ArrowRightOutlined,
    CheckSquareOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    MoreOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import {Constants} from "../model/constants";
import Swipe from "react-easy-swipe";
import copy from "copy-to-clipboard";
import {StringUtils} from "../helpers/string.utils";

const Practice = () => {
    const dispatch = useDispatch();
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const memTextOverrides = useSelector((state: AppState) => state.memTextOverrides);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [practiceState, setPracticeState] = useState({
        memPassageList: [],
        currentIndex: 0,
        showPsgRef: practiceConfig.practiceMode === PassageUtils.BY_REF,
        showingQuestion: true,
        infoVisible: false
    } as PracticeState);

    const updatePassageInList = (passage: Passage) => {
        setPracticeState((prev: PracticeState) => {
            const locPsg = {
                ...prev.memPassageList[practiceState.currentIndex],
                verses: passage.verses,
                passageRefAppendLetter: passage.passageRefAppendLetter
            };
            const locMemPassageList = [...prev.memPassageList];
            locMemPassageList[prev.currentIndex] = locPsg;
            return {...prev, memPassageList: locMemPassageList};
        });
    };

    const populateVerses = async (currPassage: Passage, copyToClipboard: boolean) => {
        const override = memTextOverrides.find(p => p.passageId === currPassage.passageId);
        if (override) {
            updatePassageInList(override);
        } else {
            setBusy({
                state: true,
                message: "Calling server to get passage " + (practiceState.currentIndex + 1) + " with passage id " +
                    currPassage.passageId + "..."
            });
            console.log("populateVerses - currPassage has no verses, so calling server to get verses");
            const locMemoryPassageData: any = await memoryService.getPassage(currPassage, Constants.USER);
            console.log("populateVerses - back from getting passage text.  Here is the data returned:");
            console.log(locMemoryPassageData.data);
            if (copyToClipboard) {
                const clipboardContent = PassageUtils.getPassageForClipboard(locMemoryPassageData.data);
                if (StringUtils.isEmpty(clipboardContent)) {
                    console.log("populateVerses - Unable to copy passage to clipboard...");
                } else {
                    copy(clipboardContent);
                    notification.info({message: "Current passage copied!", placement: "bottomRight"})
                }
            }
            updatePassageInList(locMemoryPassageData.data);
            setBusy({state: false, message: ""});
        }
    }

    const displayPassageOnScreen = async () => {
        console.log("displayPassageOnScreen - psgList:");
        console.log(practiceState.memPassageList);
        const currPassage = practiceState.memPassageList && practiceState.memPassageList.length > practiceState.currentIndex ? practiceState.memPassageList[practiceState.currentIndex] : null;
        console.log("displayPassageOnScreen - currPassage:");
        console.log(currPassage);
        if (!currPassage || isNaN(currPassage.passageId) || !currPassage.translationName || !memTextOverrides) {
            if (!memTextOverrides) {
                console.log("displayPassageOnScreen - currPassage (and memTextOverrides) not ready yet - returning");
            } else {
                console.log("displayPassageOnScreen - currPassage not ready yet - returning");
            }
            return;
        }

        if (practiceState.showPsgRef) {
            // if we are showing the passage ref, we don't need to retrieve the verses (unnecessary http call)
        } else {
            if (!currPassage.verses || currPassage.verses.length === 0) {
                await populateVerses(currPassage, false);
            }
        }
    };

    // grab the memory verses from the server based on the practice config...
    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Loading memory passages from DB..."});
            console.log("Inside call server - calling memoryService.getMemoryPsgList()...");
            const locMemoryPassagesData: any = await memoryService.getMemoryPsgList(Constants.USER);
            console.log("Inside call server - BACK FROM calling memoryService.getMemoryPsgList()...");
            // update the "append letter" if there is one
            if (memTextOverrides && memTextOverrides.length > 0) {
                locMemoryPassagesData.data.forEach(psg => {
                    const foundOverride = memTextOverrides.find(o => o.passageId === psg.passageId);
                    if (foundOverride) {
                        psg.passageRefAppendLetter = foundOverride.passageRefAppendLetter;
                    }
                });
            }
            let tempPassages: Passage[] = PassageUtils.sortAccordingToPracticeConfig(practiceConfig.passageDisplayOrder, locMemoryPassagesData.data);
            // if user is practicing by frequency, make it more challenging by randomizing
            // the passages within each frequency group
            if (practiceConfig.passageDisplayOrder === PassageUtils.BY_FREQ) {
                tempPassages = PassageUtils.sortWithinFrequencyGroups(tempPassages, PassageUtils.BY_LAST_PRACTICED);
            }
            console.log("Inside call server - setting memPassageList - there are " + tempPassages.length + " passages returned...");
            setPracticeState(prev => {
                return {...prev, memPassageList: tempPassages};
            });
            setBusy({state: false, message: ""});
        };
        callServer();
    }, [dispatch, practiceConfig]);

    useEffect(() => {
        console.log("useEffect - calling displayPassageOnScreen()...");
        displayPassageOnScreen();
    }, [practiceState.memPassageList[practiceState.currentIndex], practiceState.showingQuestion]);

    const handlePrev = () => {
        setPracticeState(prev => {
            const showingPsgRef = practiceConfig.practiceMode === PassageUtils.BY_REF;
            if (prev.currentIndex === 0) {
                return {...prev, currentIndex: prev.memPassageList.length - 1, showingQuestion: true, showPsgRef: showingPsgRef};
            } else {
                return {...prev, currentIndex: prev.currentIndex - 1, showingQuestion: true, showPsgRef: showingPsgRef};
            }
        });
    };
    const handleNext = () => {
        setPracticeState(prev => {
            const showingPsgRef = practiceConfig.practiceMode === PassageUtils.BY_REF;
            if (prev.currentIndex === (prev.memPassageList.length - 1)) {
                return {...prev, currentIndex: 0, showingQuestion: true, showPsgRef: showingPsgRef};
            } else {
                return {...prev, currentIndex: prev.currentIndex + 1, showingQuestion: true, showPsgRef: showingPsgRef};
            }
        });
    };

    const handleToggleAnswer = () => {
        setPracticeState(prev => {
            return {...prev, showingQuestion: !prev.showingQuestion, showPsgRef: !prev.showPsgRef};
        });
    };

    const handleInfo = () => {
        setPracticeState(prev => {
            return {...prev, infoVisible: true};
        });
    };

    const handleHideInfo = () => {
        setPracticeState(prev => {
            return {...prev, infoVisible: false};
        });
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
        if (key === "1") {
            // copy
            let currPassage = practiceState.memPassageList[practiceState.currentIndex];
            let clipboardContent = PassageUtils.getPassageForClipboard(currPassage);
            if (StringUtils.isEmpty(clipboardContent)) {
                console.log("calling populateVerses()...");
                await populateVerses(currPassage, true);
            } else {
                copy(clipboardContent);
                notification.info({message: "Current passage copied!", placement: "bottomRight"})
            }
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
                    <Col>{practiceState.currentIndex + 1} of {practiceState.memPassageList.length}</Col>
                    <Col style={{marginLeft: "5px"}}>
                        <Popover
                            content={
                                <>
                                    <ul>
                                        <li>Frequency: {getFrequency(practiceState.memPassageList[practiceState.currentIndex])}</li>
                                        <li>Last Practiced: {practiceState.memPassageList[practiceState.currentIndex]?.last_viewed_str}</li>
                                    </ul>
                                    <a onClick={handleHideInfo}>Close</a>
                                </>
                            }
                            title="Additional Info"
                            trigger="click"
                            visible={practiceState.infoVisible}
                        >
                            <Button icon={<InfoCircleOutlined />} onClick={handleInfo}/>
                        </Popover>
                    </Col>
                </Row>
                <Row justify="center">
                    <Space>
                        <Col span={6}><Button icon={practiceState.showingQuestion ? <QuestionCircleOutlined /> : <CheckSquareOutlined />} onClick={handleToggleAnswer}/></Col>
                        <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                        <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                        <Col span={6}>
                            <Dropdown placement="bottomRight" trigger={["click"]} overlay={
                                <Menu onClick={handleMenuClick}>
                                    <Menu.Item key="1" icon={<CopyOutlined/>}>
                                        Copy
                                    </Menu.Item>
                                    <Menu.Item key="2" icon={<EditOutlined />}>
                                        Edit
                                    </Menu.Item>
                                    <Menu.Item key="3" icon={<DeleteOutlined />}>
                                        Delete...
                                    </Menu.Item>
                                    <Menu.Item key="4" icon={<LinkOutlined />}>
                                        Interlinear View
                                    </Menu.Item>
                                </Menu>
                            }>
                                <MoreOutlined style={{borderStyle: "solid", borderWidth: "thin", borderColor: "gray", padding: "7px", backgroundColor: "white"}} />
                            </Dropdown>
                        </Col>
                    </Space>
                </Row>
                {practiceState.showPsgRef && practiceState.memPassageList && practiceState.memPassageList.length > practiceState.currentIndex && practiceState.memPassageList[practiceState.currentIndex] &&
                    <p className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(practiceState.memPassageList[practiceState.currentIndex], practiceState.currentIndex, practiceState.memPassageList.length, Constants.translationsShortNms.filter(t => t.code === practiceState.memPassageList[practiceState.currentIndex].translationName).map(t => t.translationName)[0], false, false, practiceState.memPassageList[practiceState.currentIndex].passageRefAppendLetter)}}/>
                }
                {!practiceState.showPsgRef && practiceState.memPassageList && practiceState.memPassageList.length > practiceState.currentIndex && practiceState.memPassageList[practiceState.currentIndex].verses && practiceState.memPassageList[practiceState.currentIndex].verses.length &&
                    <p style={{marginTop: "10px"}} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getFormattedPassageText(practiceState.memPassageList[practiceState.currentIndex], false)}}/>
                }
            </Swipe>
        </>
    );
};
interface PracticeState {
    currentIndex: number;
    memPassageList: Passage[];
    showPsgRef: boolean;
    showingQuestion: boolean;
    infoVisible: boolean;
}
export default Practice;