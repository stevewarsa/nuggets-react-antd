import {Col, Row} from "antd";
import useMemoryPassages from "../hooks/use-memory-passages";
import React, {useEffect, useState} from "react";
import {Passage} from "../model/passage";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import SpinnerTimer from "../components/SpinnerTimer";
import {StringUtils} from "../helpers/string.utils";

const MemoryStats = () => {
    const user = useSelector((state: AppState) => state.user);
    const {getMemPassages} = useMemoryPassages();
    const [busy, setBusy] = useState({state: false, message: ""});
    const [passageCount, setPassageCount] = useState<number>(0);
    const [verseCount, setVerseCount] = useState<number>(0);
    const [avgVersesPerPassage, setAvgVersesPerPassage] = useState<number>(0);
    const [translationStats, setTranslationStats] = useState<{translation: string, countOfPassages: {[translation: string]: []}, percent: number}[]>(undefined);

    useEffect(() => {
        setBusy({state: true, message: "Loading memory passages from DB..."});
        getMemPassages(user, true).then(resp => {
            const memPsgList: Passage[] = resp.passages;
            createStats(memPsgList);
            setBusy({state: false, message: ""});
        });
    }, []);

    const createStats = (memPsgList: Passage[]) => {
        setPassageCount(memPsgList.length);
        let verseCount = 0;
        for (let passage of memPsgList) {
            verseCount += passage.endVerse - passage.startVerse	+ 1;
        }
        setVerseCount(verseCount);
        setAvgVersesPerPassage(verseCount / memPsgList.length);
        let countsByTranslation = {};
        for (let passage of memPsgList) {
            if (countsByTranslation.hasOwnProperty(passage.translationName)) {
                countsByTranslation[passage.translationName] += 1;
            } else {
                // this is the first time we've encountered this particular translation
                countsByTranslation[passage.translationName] = 1;
            }
        }
        const keys = Object.keys(countsByTranslation);
        const translationStatsArray: {translation: string, countOfPassages: {[translation: string]: []}, percent: number}[] = [];
        for (let key of keys) {
            let pct: number = parseFloat(countsByTranslation[key]) / memPsgList.length;
            translationStatsArray.push({translation: key, countOfPassages: countsByTranslation[key], percent: pct});
        }
        setTranslationStats(translationStatsArray);
    }

    return (
        <>
            <Row justify="center"><h1>Memory Stats</h1></Row>
            {busy.state && <Row justify="center"><SpinnerTimer message={busy.message} /></Row>}
            {!translationStats || translationStats?.length === 0 && <Row justify="center"><h3>No Stats Available</h3></Row>}
            {translationStats?.length > 0 &&
            <>
                <Row>
                    <Col span={12} style={{fontWeight: "bolder"}}>Passage Count:</Col>
                    <Col span={12}>{passageCount}</Col>
                </Row>
                <Row>
                    <Col span={12} style={{fontWeight: "bolder"}}>Verse Count:</Col>
                    <Col span={12}>{verseCount}</Col>
                </Row>
                <Row>
                    <Col span={12} style={{fontWeight: "bolder"}}>Avg Verses per Passage:</Col>
                    <Col span={12}>{StringUtils.roundFloat(avgVersesPerPassage)}</Col>
                </Row>
            </>
            }
            {translationStats?.length > 0 && <Row justify="start"><h3>Percentages By Translation</h3></Row>}
            {translationStats?.length > 0 && translationStats.map(translation => (
                <Row key={translation.translation}>
                    <Col span={12} style={{fontWeight: "bolder"}}>{translation.translation.toUpperCase()}:</Col>
                    <Col span={12}>{StringUtils.roundFloat(translation.percent * 100.0)}</Col>
                </Row>
            ))
            }
        </>
    );
}
export default MemoryStats;