import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {Button, Col, Row, Space} from "antd";
import {ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";
import {Constants} from "../model/constants";

const Practice = () => {
    const dispatch = useDispatch();
    const practiceConfig = useSelector((state: AppState) => state.practiceConfig);
    const memTextOverrides = useSelector((state: AppState) => state.memTextOverrides);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [practiceState, setPracticeState] = useState({
        memPassageList: [],
        currentIndex: 0
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
    };

    // grab the memory verses from the server based on the practice config...
    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Loading memory passages from DB..."});
            console.log("Inside call server - calling memoryService.getMemoryPsgList()...");
            const locMemoryPassagesData: any = await memoryService.getMemoryPsgList(Constants.USER);
            console.log("Inside call server - BACK FROM calling memoryService.getMemoryPsgList()...");
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
    }, [practiceState.memPassageList[practiceState.currentIndex]]);

    const handlePrev = () => {
        setPracticeState(prev => {
            if (prev.currentIndex === 0) {
                return {...prev, currentIndex: prev.memPassageList.length - 1};
            } else {
                return {...prev, currentIndex: prev.currentIndex - 1};
            }
        });
    };
    const handleNext = () => {
        setPracticeState(prev => {
            if (prev.currentIndex === (prev.memPassageList.length - 1)) {
                return {...prev, currentIndex: 0};
            } else {
                return {...prev, currentIndex: prev.currentIndex + 1};
            }
        });
    };

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            <h3>Memory Verses</h3>
            <Row>
                <Col span={24}>{practiceState.currentIndex + 1} of {practiceState.memPassageList.length}</Col>
            </Row>
            <Row>
                <Space>
                <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                </Space>
            </Row>
            {practiceState.memPassageList && practiceState.memPassageList.length > practiceState.currentIndex && practiceState.memPassageList[practiceState.currentIndex].verses && practiceState.memPassageList[practiceState.currentIndex].verses.length ?
                <p dangerouslySetInnerHTML={{__html: PassageUtils.getFormattedPassageText(practiceState.memPassageList[practiceState.currentIndex], false)}}/>
                :
                <p>No passage text loaded</p>
            }
        </>
    );
};
interface PracticeState {
    currentIndex: number;
    memPassageList: Passage[];
}
export default Practice;