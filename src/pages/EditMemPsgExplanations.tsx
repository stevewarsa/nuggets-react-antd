import useMemoryPassages from "../hooks/use-memory-passages";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import React, {useEffect, useState} from "react";
import {Passage} from "../model/passage";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Col, notification, Radio, Row, Select, Space} from "antd";
import {PassageUtils} from "../helpers/passage-utils";
import {StringUtils} from "../helpers/string.utils";
import {Constants} from "../model/constants";
import TextArea from "antd/es/input/TextArea";
import {UpdatePassageParam} from "../model/update-passage-param";
import memoryService from "../services/memory-service";

const HAS_EXPLANATION = "EXPL";
const NO_EXPLANATION = "NEXPL";
const ALL = "ALL";
const {Option} = Select;
const EditMemPsgExplanations = () => {
    const {getMemPassages} = useMemoryPassages();
    const user = useSelector((state: AppState) => state.user);
    const [memPassageList, setMemPassageList] = useState<Passage[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [filterMode, setFilterMode] = useState<string>(HAS_EXPLANATION);
    const [selectedPassage, setSelectedPassage] = useState<Passage>(undefined);
    const [newExplanation, setNewExplanation] = useState<string>("");

    useEffect(() => {
        setBusy({state: true, message: "Loading memory passages from server..."});
        getMemPassages(user, true).then(resp => {
            const sortedPassages = resp.passages.sort((a, b) => {
                if (a.bookId === b.bookId) {
                    // books are same, sort by chapter
                    if (a.chapter === b.chapter) {
                        // chapters are the same, sort by start verse
                        return a.startVerse - b.startVerse;
                    } else {
                        return a.chapter - b.chapter;
                    }
                } else {
                    return a.bookId - b.bookId;
                }
            });
            console.log("Sorted passages:", sortedPassages);
            setMemPassageList(sortedPassages);
            setBusy({state: false, message: ""});
        });
    }, [user]);

    const handleExplanationInput = (evt) => {
        setNewExplanation(evt.target.value);
    };

    const updateExplanation = () => {
        const locPsg: Passage = {...selectedPassage};
        locPsg.explanation = newExplanation;
        const updateParam: UpdatePassageParam = new UpdatePassageParam();
        updateParam.passageRefAppendLetter = locPsg.passageRefAppendLetter;
        updateParam.user = user;
        updateParam.newText = null;
        updateParam.passage = locPsg;
        setBusy({state: true, message: "Updating explanation..."});
        memoryService.updatePassage(updateParam).then(resp => {
            if (resp.data === "success") {
                const updatedMemPsgList = [...memPassageList];
                const index = updatedMemPsgList.findIndex(item => item.passageId === updateParam.passage.passageId);
                if (index !== -1) {
                    updatedMemPsgList[index].explanation = updateParam.passage.explanation;
                    setMemPassageList(updatedMemPsgList);
                    setSelectedPassage(updatedMemPsgList[index]);
                }
                notification.success({message: "Explanation has been updated!", placement: "bottomRight"});
            } else {
                notification.error({message: "Error updating explanation: " + resp.data, placement: "top"});
            }
            setBusy({state: false, message: ""});
        });
    };

    return (
        <>
        {busy.state && <SpinnerTimer message={busy.message} />}
        <Row justify="center">
            <h1>Edit Explanations for Memory Passages</h1>
        </Row>
            {memPassageList && memPassageList.length > 0 && (
                <>
                <Row key="filter-settings" justify="start" align="middle">
                    <Col>
                        <Radio.Group onChange={(e: any) => setFilterMode(e.target.value)} value={filterMode}>
                            <Space direction="horizontal">
                                <Radio checked={filterMode === HAS_EXPLANATION} value={HAS_EXPLANATION}>Has Expl</Radio>
                                <Radio checked={filterMode === NO_EXPLANATION} value={NO_EXPLANATION}>No Expl</Radio>
                                <Radio checked={filterMode === ALL} value={ALL}>All</Radio>
                            </Space>
                        </Radio.Group>
                    </Col>
                </Row>
                <Row key="select" justify="start" align="middle">
                    <Col>
                        <Select style={{ width: 200, marginBottom: "5px" }} value={selectedPassage ? selectedPassage.passageId : undefined}
                                onChange={(value) => {
                                    const passage = memPassageList.find(p => p.passageId === value);
                                    setSelectedPassage(passage);
                                    setNewExplanation(passage.explanation);
                                }}>
                            {memPassageList.filter(psg => {
                                switch (filterMode) {
                                    case ALL:
                                        return true;
                                    case HAS_EXPLANATION:
                                        return !StringUtils.isEmpty(psg.explanation);
                                    case NO_EXPLANATION:
                                        return StringUtils.isEmpty(psg.explanation);
                                    default:
                                        return true;
                                }
                            }).map(psg => (
                                <Option key={psg.passageId} value={psg.passageId}>
                                    {PassageUtils.getPassageStringNoIndex(psg, null, true) + (StringUtils.isEmpty(psg.explanation) ? " (N)" : " (Y)")}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                    {selectedPassage &&
                    <>
                    <Row style={{marginBottom: "10px"}}>
                        <Col>
                            <TextArea
                                disabled={user === Constants.GUEST_USER}
                                autoSize={{ minRows: 5, maxRows: 10 }}
                                style={{width: "100%", fontSize: "1.71rem", fontWeight: "bolder"}}
                                autoFocus
                                value={newExplanation}
                                onChange={handleExplanationInput}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button disabled={!selectedPassage || StringUtils.isEmpty(newExplanation) || selectedPassage.explanation === newExplanation.trim()}
                                    type={"primary"}
                                    onClick={updateExplanation}>Update</Button>
                        </Col>
                    </Row>
                    </>
                    }
                </>
            )
            }
            {(!memPassageList || memPassageList.length === 0) && <Row justify="center" align="middle"><Col>No memory passages configured</Col></Row>}
        </>
    );
}

export default EditMemPsgExplanations;