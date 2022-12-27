import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import memoryService from "../services/memory-service";
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

const processHistoryRecs = (recs: {passageId: string, dateViewedLong: string, dateViewedStr: string}[], psgRefByPsgId: {[psgId: number]: {psgRef: string, passage: Passage}}) => {
    const locHistoryRecsByDay: {[dateStr: string]: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string, passage: Passage}[]} = {};
    for (const rec of recs) {
        const dateViewed: number = parseInt(rec.dateViewedLong);
        const psgIdNum: number = parseInt(rec.passageId);
        const dateOnlyStr = DateUtils.formatDate(new Date(dateViewed));
        let historyRecsForDay: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string, passage: Passage}[] = null;
        if (locHistoryRecsByDay[dateOnlyStr]) {
            // this date already exists in the map
            historyRecsForDay = locHistoryRecsByDay[dateOnlyStr];
        } else {
            historyRecsForDay = [];
            locHistoryRecsByDay[dateOnlyStr] = historyRecsForDay;
        }
        const foundRecAlready = historyRecsForDay.find(existingRec => existingRec.passageId === psgIdNum && existingRec.fullDateStr === rec.dateViewedStr);
        if (!foundRecAlready) {
            historyRecsForDay.push({
                passageId: psgIdNum,
                passageRef: psgRefByPsgId[psgIdNum].psgRef,
                passage: psgRefByPsgId[psgIdNum].passage,
                timeStr: DateUtils.formatDateTime(new Date(dateViewed), "HH:mm:ss"),
                fullDateStr: rec.dateViewedStr,
                dateViewedLong: dateViewed
            });
        }
    }
    return locHistoryRecsByDay;
};

const ViewMemoryPracticeHistory = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: AppState) => state.user);
    const {getMemPassages} = useMemoryPassages();
    const [busy, setBusy] = useState({state: false, message: ""});
    const [historyRecsByDay, setHistoryRecsByDay] = useState<{[dateStr: string]: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string, passage: Passage}[]}>({});
    const [openDays, setOpenDays] = useState<{[dayKey: string]: boolean}>({});

    useEffect(() => {
        if (!StringUtils.isEmpty(user)) {
            (async () => {
                setBusy({state: true, message: "Retrieving practice history..."});
                const practiceHistoryResponse = await memoryService.getMemoryPracticeHistory(user);
                if (practiceHistoryResponse.data && practiceHistoryResponse.data.length > 0) {
                    const memPsgResp = await getMemPassages(user, false);
                    if (memPsgResp && memPsgResp.passages && memPsgResp.passages.length > 0) {
                        const psgDataPsgId = processMemPassages(memPsgResp.passages);
                        const historyRecs = processHistoryRecs(practiceHistoryResponse.data, psgDataPsgId);
                        setHistoryRecsByDay(historyRecs);
                        const locOpenDays: {[dayKey: string]: boolean} = {};
                        for (let day of Object.keys(historyRecsByDay)) {
                            locOpenDays[day] = false;
                        }
                        setOpenDays(locOpenDays);
                    }
                }
                setBusy({state: false, message: ""});
            })();
        }
    }, [user]);

    const openDay = (dayKey: string) => {
        setOpenDays(prev => {
            const prevCopy = {...prev};
            prevCopy[dayKey] = true;
            return prevCopy;
        });
    };

    const closeDay = (dayKey: string) => {
        setOpenDays(prev => {
            const prevCopy = {...prev};
            prevCopy[dayKey] = false;
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
                    <h1>Practice History</h1>
                </Row>
                {historyRecsByDay && Object.keys(historyRecsByDay).length > 0 && Object.keys(historyRecsByDay).map(dayKey => (
                    <React.Fragment key={dayKey}>
                        <p>Day: {dayKey} ({historyRecsByDay[dayKey].length})
                            <Button key={dayKey + "-plus"} hidden={openDays[dayKey]} onClick={() => openDay(dayKey)} icon={<PlusCircleOutlined/>}></Button>
                            <Button key={dayKey + "-minus"} hidden={!openDays[dayKey]} onClick={() => closeDay(dayKey)} icon={<MinusCircleOutlined/>}></Button>
                        </p>
                        {openDays[dayKey] && <ol key={dayKey + "-psglist"}>
                            {historyRecsByDay[dayKey].map(entry => (
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

export default ViewMemoryPracticeHistory;