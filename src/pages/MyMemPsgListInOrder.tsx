import useMemoryPassages from "../hooks/use-memory-passages";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import {Passage} from "../model/passage";
import SpinnerTimer from "../components/SpinnerTimer";
import {Col, Row} from "antd";
import {PassageUtils} from "../helpers/passage-utils";

const MyMemPsgListInOrder = () => {
    const {getMemPassages} = useMemoryPassages();
    const user = useSelector((state: AppState) => state.user);
    const [memPassageList, setMemPassageList] = useState<Passage[]>([]);
    const [busy, setBusy] = useState({state: false, message: ""});

    useEffect(() => {
        (async () => {
            setBusy({state: true, message: "Loading memory passages from server..."});
            const resp = await getMemPassages(user, true);
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
        })();
    }, [user]);

    return (
        <>
        {busy.state && <SpinnerTimer message={busy.message} />}
        <Row justify="center">
            <h1>Memory Passages In Order</h1>
        </Row>
            {memPassageList && memPassageList.length > 0 && memPassageList.map((psg, index) => (
                <Row key={psg.passageId} style={{marginLeft: '50px'}} justify="start" align="middle">
                    <Col style={{marginRight: '10px'}} >{index + 1}. </Col>
                    <Col>{PassageUtils.getPassageStringNoIndex(psg, null, true)}</Col>
                </Row>
            ))
            }
            {(!memPassageList || memPassageList.length === 0) && <Row justify="center" align="middle"><Col>No memory passages configured</Col></Row>}
        </>
    );
}

export default MyMemPsgListInOrder;