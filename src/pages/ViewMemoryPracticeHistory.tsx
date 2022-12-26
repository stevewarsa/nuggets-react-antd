import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {Button, Row} from "antd";
import {DateUtils} from "../helpers/date.utils";
import useMemoryPassages from "../hooks/use-memory-passages";
import {Passage} from "../model/passage";
import {PassageUtils} from "../helpers/passage-utils";
import {ArrowRightOutlined} from "@ant-design/icons";

const processMemPassages = (memPsgs: Passage[]) => {
    const locMemPsgRefByPsgId: {[psgId: number]: string} = {};
    for (let psg of memPsgs) {
        locMemPsgRefByPsgId[psg.passageId] = PassageUtils.getPassageStringNoIndex(psg, true, true);
    }
    return locMemPsgRefByPsgId;
};

const ViewMemoryPracticeHistory = () => {
    const user = useSelector((state: AppState) => state.user);
    const {getMemPassages} = useMemoryPassages();
    const [busy, setBusy] = useState({state: false, message: ""});
    const [historyRecsByDay, setHistoryRecsByDay] = useState<{[dateStr: string]: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string}[]}>({});
    const [openDays, setOpenDays] = useState<string[]>([]);

    useEffect(() => {
        if (!StringUtils.isEmpty(user)) {
            (async () => {
                setBusy({state: true, message: "Retrieving practice history..."});
                const practiceHistoryResponse = await memoryService.getMemoryPracticeHistory(user);
                if (practiceHistoryResponse.data && practiceHistoryResponse.data.length > 0) {
                    const memPsgResp = await getMemPassages(user, false);
                    if (memPsgResp && memPsgResp.passages && memPsgResp.passages.length > 0) {
                        const psgRefByPsgId = processMemPassages(memPsgResp.passages);
                        processHistoryRecs(practiceHistoryResponse.data, psgRefByPsgId);
                    }
                }
                setBusy({state: false, message: ""});
            })();
        }
    }, [user]);

    const processHistoryRecs = (recs: {passageId: string, dateViewedLong: string, dateViewedStr: string}[], psgRefByPsgId: {[psgId: number]: string}) => {
        const locHistoryRecsByDay: {[dateStr: string]: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string}[]} = {};
        for (const rec of recs) {
            const dateViewed: number = parseInt(rec.dateViewedLong);
            const psgIdNum: number = parseInt(rec.passageId);
            const dateOnlyStr = DateUtils.formatDate(new Date(dateViewed));
            let historyRecsForDay: {passageId: number, dateViewedLong: number, timeStr: string, passageRef: string, fullDateStr: string}[] = null;
            if (locHistoryRecsByDay[dateOnlyStr]) {
                // this date already exists in the map
                historyRecsForDay = locHistoryRecsByDay[dateOnlyStr];
            } else {
                historyRecsForDay = [];
                locHistoryRecsByDay[dateOnlyStr] = historyRecsForDay;
            }
            historyRecsForDay.push({
                passageId: psgIdNum,
                passageRef: psgRefByPsgId[psgIdNum],
                timeStr: DateUtils.formatDateTime(new Date(dateViewed), "HH:mm:ss"),
                fullDateStr: rec.dateViewedStr,
                dateViewedLong: dateViewed
            });
        }
        setHistoryRecsByDay(locHistoryRecsByDay);
    };

    const openDay = (dayKey: string) => {
        setOpenDays(prev => {
            return [...prev, dayKey];
        });
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
                    <>
                        <p>Day: {dayKey} ({historyRecsByDay[dayKey].length}) <Button onClick={() => openDay(dayKey)} icon={<ArrowRightOutlined/>}></Button></p>
                        {openDays.find(day => dayKey === day) && <ol>
                            {historyRecsByDay[dayKey].map(entry => (
                                <li>{entry.passageRef} ({entry.timeStr})</li>
                            ))}
                        </ol>
                        }
                    </>
                ))}
                {/*<Row justify="center">*/}
                {/*    <Col span={6}>Passage ID</Col>*/}
                {/*    <Col span={12}>Date Last Practiced</Col>*/}
                {/*</Row>*/}
                {/*{historyRecs && historyRecs.length > 0 && historyRecs.map((rec, index) =>*/}
                {/*<Row justify="center" key={index + "-" + rec.passageId + " " + rec.dateViewedLong + "-row"}>*/}
                {/*    <Col span={6} style={{marginRight: "5px"}} key={index + "-" + rec.passageId + " " + rec.dateViewedLong + "-col1"}>{rec.passageId}</Col>*/}
                {/*    <Col span={12} key={index + "-" + rec.passageId + " " + rec.dateViewedLong + "-col2"}>{DateUtils.formatDateTime(new Date(parseInt(rec.dateViewedLong)), "MM-dd-yyyy HH:mm:ss")}</Col>*/}
                {/*</Row>*/}
                {/*)}*/}
            </>
        );
    }
};

export default ViewMemoryPracticeHistory;