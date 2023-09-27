import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Row} from "antd";
import {DateUtils} from "../helpers/date.utils";
import useMemoryPassages from "../hooks/use-memory-passages";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";


const processMemPassages = (memPsgs: Passage[]) => {
    const locMemPsgRefByPsgId: {[psgId: number]: {psgRef: string, passage: Passage}} = {};
    for (let psg of memPsgs) {
        locMemPsgRefByPsgId[psg.passageId] = {psgRef: PassageUtils.getPassageStringNoIndex(psg, true, true), passage: psg};
    }
    return locMemPsgRefByPsgId;
};

const MemoryPassagesByBox = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: AppState) => state.user);
    const {getMemPassages} = useMemoryPassages();
    const [memPsgsByBox, setMemPsgsByBox] = useState<{[boxNo: number]: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string, passage: Passage}[]}>({});
    const [openBoxes, setOpenBoxes] = useState<{[box: string]: boolean}>({});
    const [busy, setBusy] = useState({state: false, message: ""});

    useEffect(() => {
        if (!StringUtils.isEmpty(user)) {
            (async () => {
                setBusy({state: true, message: "Retrieving memory passages..."});
                const memPsgResp = await getMemPassages(user, false);
                if (memPsgResp?.passages?.length > 0) {
                    const psgDataPsgId = processMemPassages(memPsgResp.passages);
                    const locMemPsgsByBox: {[boxNo: number]: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string, passage: Passage}[]} = {};
                    for (const psg of memPsgResp.passages) {
                        let passagesForBox: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string, passage: Passage}[] = null;
                        if (locMemPsgsByBox[psg.frequencyDays]) {
                            // this date already exists in the map
                            passagesForBox = locMemPsgsByBox[psg.frequencyDays];
                        } else {
                            passagesForBox = [];
                            locMemPsgsByBox[psg.frequencyDays] = passagesForBox;
                        }
                        const foundRecAlready = passagesForBox.find(existingRec => existingRec.passageId === psg.passageId && existingRec.fullDateStr === psg.last_viewed_str);
                        if (!foundRecAlready) {
                            passagesForBox.push({
                                passageId: psg.passageId,
                                passageRef: psgDataPsgId[psg.passageId].psgRef,
                                passage: psgDataPsgId[psg.passageId].passage,
                                timeStr: DateUtils.formatDateTime(new Date(psg.last_viewed_str), "yyyy-MM-dd HH:mm:ss"),
                                fullDateStr: psg.last_viewed_str,
                                dateViewedLong: psg.last_viewed_num
                            });
                        }
                    }
                    const locOpenBoxes: {[box: string]: boolean} = {};
                    for (let day of Object.keys(locMemPsgsByBox)) {
                        locOpenBoxes[day] = false;
                    }
                    setOpenBoxes(locOpenBoxes);
                    console.log("MemoryPassagesByBox.useEffect[user] - openBoxes: ", locOpenBoxes);
                    setMemPsgsByBox(locMemPsgsByBox);
                    console.log("MemoryPassagesByBox.useEffect[user] - MemPsgsByBox: ", locMemPsgsByBox);
                }
                setBusy({state: false, message: ""});
            })();
        }
    }, [user]);
    const openBox = (box: string) => {
        setOpenBoxes(prev => {
            const prevCopy = {...prev};
            prevCopy[box] = true;
            return prevCopy;
        });
    };

    const closeBox = (box: string) => {
        setOpenBoxes(prev => {
            const prevCopy = {...prev};
            prevCopy[box] = false;
            return prevCopy;
        });
    };

    const handlePsgClick = (psg: Passage) => {
        dispatcher(stateActions.setChapterSelection({book: psg.bookName, chapter: psg.chapter, translation: psg.translationName, verse: psg.startVerse}));
        navigate("/readChapter");
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message} />;
    } else {
        return (
            <>
                <Row justify="center">
                    <h1>Memory Passages By Box</h1>
                </Row>
                {memPsgsByBox && Object.keys(memPsgsByBox).length > 0 && Object.keys(memPsgsByBox).map(box => (
                    <React.Fragment key={box}>
                        <p>Box: {box} ({memPsgsByBox[parseInt(box)].length})
                            <Button key={box + "-plus"} hidden={openBoxes[box]} onClick={() => openBox(box)} icon={<PlusCircleOutlined/>}></Button>
                            <Button key={box + "-minus"} hidden={!openBoxes[box]} onClick={() => closeBox(box)} icon={<MinusCircleOutlined/>}></Button>
                        </p>
                        {openBoxes[box] && <ol key={box + "-psglist"}>
                            {memPsgsByBox[box].map(entry => (
                                <li key={entry.fullDateStr + "-" + entry.passageId}>
                                    <a style={{cursor: "pointer"}} onClick={() => handlePsgClick(entry.passage)}>{entry.passageRef}</a>
                                    ({entry.timeStr})
                                </li>
                            ))}
                        </ol>
                        }
                    </React.Fragment>
                ))}
            </>
        );
    }
};

export default MemoryPassagesByBox;