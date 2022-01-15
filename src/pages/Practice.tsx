import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {Button, Col, Row, Space} from "antd";
import {ArrowLeftOutlined, ArrowRightOutlined, CheckSquareOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {Constants} from "../model/constants";
import Swipe from "react-easy-swipe";

const Practice = () => {
    const dispatch = useDispatch();
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const memTextOverrides = useSelector((state: AppState) => state.memTextOverrides);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [practiceState, setPracticeState] = useState({
        memPassageList: [],
        currentIndex: 0,
        showPsgRef: practiceConfig.practiceMode === PassageUtils.BY_REF,
        showingQuestion: true
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
                const override = memTextOverrides.find(p => p.passageId === currPassage.passageId);
                if (override) {
                    updatePassageInList(override);
                } else {
                    setBusy({
                        state: true,
                        message: "Calling server to get passage " + (practiceState.currentIndex + 1) + " with passage id " +
                            currPassage.passageId + "..."
                    });
                    console.log("displayPassageOnScreen - currPassage has no verses, so calling server to get verses");
                    const locMemoryPassageData: any = await memoryService.getPassage(currPassage, Constants.USER);
                    console.log("displayPassageOnScreen - back from getting passage text.  Here is the data returned:");
                    console.log(locMemoryPassageData.data);
                    updatePassageInList(locMemoryPassageData.data);
                    setBusy({state: false, message: ""});
                }
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

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            <h3>Memory Verses</h3>
            <Swipe onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
            <Row>
                <Space>
                    <Col span={6}><Button icon={practiceState.showingQuestion ? <QuestionCircleOutlined /> : <CheckSquareOutlined />} onClick={handleToggleAnswer}/></Col>
                    <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                    <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                </Space>
            </Row>
            {practiceState.showPsgRef && practiceState.memPassageList && practiceState.memPassageList.length > practiceState.currentIndex && practiceState.memPassageList[practiceState.currentIndex] &&
                <p style={{textAlign: "center"}} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getPassageString(practiceState.memPassageList[practiceState.currentIndex], practiceState.currentIndex, practiceState.memPassageList.length, Constants.translationsShortNms.filter(t => t.code === practiceState.memPassageList[practiceState.currentIndex].translationName).map(t => t.translationName)[0], true, true, practiceState.memPassageList[practiceState.currentIndex].passageRefAppendLetter)}}/>
            }
            {!practiceState.showPsgRef && practiceState.memPassageList && practiceState.memPassageList.length > practiceState.currentIndex && practiceState.memPassageList[practiceState.currentIndex].verses && practiceState.memPassageList[practiceState.currentIndex].verses.length &&
                <p style={{textAlign: "center"}} className="nugget-view" dangerouslySetInnerHTML={{__html: PassageUtils.getFormattedPassageText(practiceState.memPassageList[practiceState.currentIndex], false)}}/>
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
}
export default Practice;