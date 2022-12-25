import {notification, Button, Card, Col, Row, Select, Modal} from "antd";
import {Constants} from "../model/constants";
import React, {useEffect, useState} from "react";
import {Passage} from "../model/passage";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {PassageUtils} from "../helpers/passage-utils";
import TextArea from "antd/es/input/TextArea";
import {StringUtils} from "../helpers/string.utils";
import memoryService from "../services/memory-service";
import {stateActions} from "../store";
import {UpdatePassageParam} from "../model/update-passage-param";
import SpinnerTimer from "./SpinnerTimer";

interface EditPassageProps {
    passage: Passage;
    visible: boolean;
    setVisibleFunction: Function;
}
const colsInTextArea = 47;
const EditPassage = ({props}: {props: EditPassageProps}) => {
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const {Option} = Select;
    const [startVerse, setStartVerse] = useState(props.passage.startVerse);
    const [frequency, setFrequency] = useState(props.passage.frequencyDays);
    const [endVerse, setEndVerse] = useState(props.passage.endVerse);
    const [appendLetter, setAppendLetter] = useState(props.passage.passageRefAppendLetter);
    const [translation, setTranslation] = useState(props.passage.translationName);
    let maxVerseByBookChapterMap = useSelector((appState: AppState) => appState.maxVerseByBookChapter);
    const [maxVerse, setMaxVerse] = useState(props.passage.endVerse);
    const [currPassageText, setCurrPassageText] = useState("");
    const [rowsInTextArea, setRowsInTextArea] = useState(10);
    const [frequencies, setFrequencies] = useState<{freqLabel: string, freqValue: number}[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [editPassageVisible, setEditPassageVisible] = useState(props.visible);

    useEffect(() => {
        // populate the frequency dropdown values (only one time - no dependencies)
        const freqDep: {freqLabel: string, freqValue: number}[] = [];
        freqDep.push({freqValue: -1, freqLabel: "Every Time"});
        for (let i = 1; i <= 500; i++) {
            freqDep.push({freqLabel: i + "", freqValue: i});
        }
        setFrequencies(freqDep);
    }, []);

    useEffect(() => {
        setEditPassageVisible(props.visible);
    }, [props.visible]);

    useEffect(() => {
        console.log("useEffect - maxVerseByBookChapter:", maxVerseByBookChapterMap);
        console.log("useEffect - passage:", props.passage);
        if (!maxVerseByBookChapterMap || !maxVerseByBookChapterMap.hasOwnProperty(translation)) {
            console.log("useEffect - maxVerseByBookChapter not populated yet, calling server to populate, then returning");
            (async () => {
                const locMaxVerseByBookChapter = await memoryService.getMaxVerseByBookChapter(translation);
                dispatcher(stateActions.setMaxVerseByBookChapter({maxVerseByBookChapter: locMaxVerseByBookChapter.data, translation: translation}));
            })();
            return;
        }
        if (!props.passage || props.passage.passageId === -1 || !props.passage.verses || props.passage.verses.length === 0) {
            console.log("useEffect - passage not populated yet, returning");
            return;
        }
        const locMaxVerseByBookChapter = maxVerseByBookChapterMap[translation];
        const maxChapVerseForBook = locMaxVerseByBookChapter[props.passage.bookName];
        console.log("useEffect - maxChapVerseForBook:", maxChapVerseForBook);
        const maxVerseForChap = maxChapVerseForBook.find((chapAndVerse: number[]) => chapAndVerse[0] === props.passage.chapter);
        console.log("useEffect - maxVerseForChap:", maxVerseForChap);
        setMaxVerse(maxVerseForChap[1]);
        setStartVerse(props.passage.startVerse);
        setEndVerse(props.passage.endVerse);
        setFrequency(props.passage.frequencyDays);
        setAppendLetter(props.passage.passageRefAppendLetter);
        populateCurrentPassageTextFromPassage(props.passage);
    }, [props.passage, maxVerseByBookChapterMap]);

    const populateCurrentPassageTextFromPassage = (psg: Passage) => {
        if (psg.verses && psg.verses.length > 0) {
            const txt = PassageUtils.getUnformattedPassageTextNoVerseNumbers(psg);
            setCurrPassageText(txt);
            setRowsInTextArea(Math.ceil(txt.length / colsInTextArea));
        }
    }

    const changePassageText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrPassageText(e.target.value);
        if (!StringUtils.isEmpty(e.target.value) && StringUtils.isEmpty(appendLetter)) {
            setAppendLetter("a");
        }

        if (StringUtils.isEmpty(e.target.value)) {
            setAppendLetter(undefined);
        }
    };

    const changeTranslation = (value) => {
        if (value !== translation) {
            console.log("changeTranslation - translation changed!");
            setTranslation(value);
        }
    };

    const changeStartVerse = (value) => {
        if (parseInt(value) !== startVerse) {
            console.log("changeStartVerse - startVerse changed!");
            setStartVerse(parseInt(value));
        }
    };

    const changeEndVerse = (value) => {
        if (parseInt(value) !== endVerse) {
            console.log("changeEndVerse - endVerse changed!");
            setEndVerse(parseInt(value));
        }
    };

    const changPassageAppendLetter = (value) => {
        if (value !== appendLetter) {
            setAppendLetter(value);
        }
    };

    const changeFrequency = (value) => {
        if (parseInt(value) !== frequency) {
            console.log("changeFrequency - frequency changed!");
            setFrequency(parseInt(value));
        }
    }

    const submitChanges = () => {
        const updateParam: UpdatePassageParam = new UpdatePassageParam();
        updateParam.passageRefAppendLetter = appendLetter;
        updateParam.user = user;
        updateParam.newText = currPassageText;
        updateParam.passage = {...props.passage,
            translationName: translation,
            translationId: translation,
            startVerse: startVerse,
            endVerse: endVerse,
            frequencyDays: frequency
        };
        console.log("submitChanges - here is the param that will be sent:", updateParam);
        setBusy({state: true, message: "Updating passage..."});
        memoryService.updatePassage(updateParam).then(resp => {
            if (resp.data === "success") {
                console.log('Update memory passage was successful!');
                notification.success({message: "Passage has been updated!", placement: "bottomRight"});
                setEditPassageVisible(false);
                props.setVisibleFunction();
            } else {
                notification.error({message: "Error updating passage: " + resp.data, placement: "top"});
            }
            setBusy({state: false, message: ""});
        });
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message} />;
    } else {
        return (
            <Modal title="Edit Quote" footer={null} open={editPassageVisible} onCancel={() => setEditPassageVisible(false)}>
                <Card bordered={true}>
                    <Row style={{marginBottom: "4px"}}>
                        <Col span={24}>
                            <Select style={{width: "100%"}} size="large" value={translation} onChange={changeTranslation}>
                                <Option value="N/A">{"--Select Translation--"}</Option>
                                {Object.keys(Constants.translationLongNames).map(key => (
                                        <Option key={key} value={key}>{Constants.translationLongNames[key]}</Option>
                                    )
                                )}
                            </Select>
                        </Col>
                    </Row>
                    <Row align="middle" style={{marginBottom: "4px"}}>
                        <Col span={3}>Start:</Col>
                        <Col span={7} style={{marginRight: "6px"}}>
                            <Select style={{width: "100%"}} size="large" value={startVerse} onChange={changeStartVerse}>
                                <Option value={-1}>{"--Start Verse--"}</Option>
                                {Array(maxVerse).fill(undefined).map((n, i) => i + 1).map(num => (
                                    <Option key={"start-" + num} value={num}>{num}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={3}>End:</Col>
                        <Col span={7}>
                            <Select style={{width: "100%"}} size="large" value={endVerse} onChange={changeEndVerse}>
                                <Option value={-1}>{"--End Verse--"}</Option>
                                {Array(maxVerse).fill(undefined).map((n, i) => i + 1).filter(num => num >= startVerse).map(num => (
                                    <Option key={"end-" + num} value={num}>{num}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    {appendLetter && !StringUtils.isEmpty(appendLetter) &&
                        <Row style={{marginBottom: "4px"}}>
                            <Col span={6}>Append Letter:</Col>
                            <Col span={4}>
                                <Select style={{width: "100%"}} size="small" value={appendLetter}
                                        onChange={changPassageAppendLetter}>
                                    <Option value={undefined}>{"--No Append Letter--"}</Option>
                                    {["a", "b", "c"].map(letter => (
                                        <Option key={letter} value={letter}>{letter}</Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                    }
                    <Row align="middle" style={{marginBottom: "4px"}}>
                        <Col span={12}>Frequency:</Col>
                        <Col span={12}>
                            <Select style={{width: "100%"}} size="large" value={frequency} onChange={changeFrequency}>
                                {frequencies.map(freq => (
                                        <Option key={freq.freqValue} value={freq.freqValue}>{freq.freqLabel}</Option>
                                    )
                                )}
                            </Select>
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "4px"}}>
                        <Col span={24}>Passage Text:</Col>
                    </Row>
                    <Row style={{marginBottom: "8px"}}>
                        <Col span={24}>
                            <TextArea rows={rowsInTextArea} value={currPassageText} onChange={changePassageText}/>
                        </Col>
                    </Row>
                    <Row style={{marginBottom: "4px"}}>
                        <Col span={24}>
                            <Button onClick={submitChanges}>Submit Update</Button>
                        </Col>
                    </Row>
                </Card>
            </Modal>
        );
    }
};

export default EditPassage;