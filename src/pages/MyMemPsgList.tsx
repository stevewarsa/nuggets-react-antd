import useMemoryPassages from "../hooks/use-memory-passages";
import {useEffect, useState} from "react";
import {Passage} from "../model/passage";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import SpinnerTimer from "../components/SpinnerTimer";
import {Col, Input, Row} from "antd";
import {PassageUtils} from "../helpers/passage-utils";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import {PracticeConfig} from "../model/PracticeConfig";

const MyMemPsgList = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const [translation, setTranslation] = useState("niv");
    const {getMemPassages} = useMemoryPassages();
    const user = useSelector((state: AppState) => state.user);
    const [memPassageList, setMemPassageList] = useState<Passage[]>([]);
    const [filteredMemPassageList, setFilteredMemPassageList] = useState<Passage[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [filter, setFilter] = useState<string>(undefined);
    const [practiceMode, setPracticeMode] = useState(PassageUtils.BY_REF);
    const [passageDisplayOrder, setPassageDisplayOrder] = useState(PassageUtils.BY_FREQ);

    useEffect(() => {
        if (prefs) {
            setTranslation(PassageUtils.getPreferredTranslationFromPrefs(prefs, "niv"));
        }
    }, [prefs]);

    useEffect(() => {
        (async () => {
            setBusy({state: true, message: "Loading memory passages from server..."});
            const resp = await getMemPassages(user, true);
            setMemPassageList(resp.passages);
            setFilteredMemPassageList(resp.passages);
            setBusy({state: false, message: ""});
        })();
    }, [user]);

    const doPassageFilter = (evt) => {
        setFilter(evt.target.value);
        setFilteredMemPassageList(memPassageList.filter(psg => PassageUtils.getPassageStringNoIndex(psg, null, true).toLowerCase().includes(evt.target.value.toLowerCase())));
    };

    const handlePsgClick = (psg: Passage) => {
        dispatcher(stateActions.setPracticeConfig({practiceMode: practiceMode, passageDisplayOrder: passageDisplayOrder, startAtPassageId: psg.passageId} as PracticeConfig));
        navigate("/practice");
        // dispatcher(stateActions.setChapterSelection({book: psg.bookName, chapter: psg.chapter, translation: translation}));
        // navigate("/readChapter");
    };

    return <>
        {busy.state && <SpinnerTimer message={busy.message} />}
        <Row justify="center">
            <h1>Memory Verses</h1>
        </Row>
        {filteredMemPassageList && filteredMemPassageList.length > 0 &&
            <>
                <Row justify="center">
                    <Col><Input placeholder="Enter passage filter" value={filter} onChange={doPassageFilter}/></Col>
                </Row>
                <Row justify="center" style={{marginBottom: "5px"}}>
                    <Col><span style={{fontWeight: "bold"}}>Count:</span> {filteredMemPassageList.length}</Col>
                </Row>
            </>
        }
        {filteredMemPassageList && filteredMemPassageList.length > 0 && filteredMemPassageList.map(psg => (
            <Row key={psg.passageId} justify="center" align="middle">
                <Col><a style={{cursor: "pointer", fontSize: "1.3rem"}} onClick={() => handlePsgClick(psg)}>{PassageUtils.getPassageStringNoIndex(psg, null, true)}</a></Col>
            </Row>
        ))
        }
        {(!filteredMemPassageList || filteredMemPassageList.length === 0) && <Row justify="center" align="middle"><Col>No memory passages configured</Col></Row>}
    </>;
};

export default MyMemPsgList;