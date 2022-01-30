import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {StringUtils} from "../helpers/string.utils";
import memoryService from "../services/memory-service";
import SpinnerTimer from "../components/SpinnerTimer";
import {Col, Row} from "antd";

const ViewMemoryPracticeHistory = () => {
    const user = useSelector((state: AppState) => state.user);
    const [busy, setBusy] = useState({state: false, message: ""});
    const [historyRecs, setHistoryRecs] = useState([]);

    useEffect(() => {
        const callServer = async () => {
            setBusy({state: true, message: "Retrieving practice history..."});
            const practiceHistoryResponse = await memoryService.getMemoryPracticeHistory(user);
            if (practiceHistoryResponse.data && practiceHistoryResponse.data.length > 0) {
                setHistoryRecs(practiceHistoryResponse.data);
            }
            setBusy({state: false, message: ""});
        };
        if (!StringUtils.isEmpty(user)) {
            callServer();
        }
    }, [user]);
    if (busy.state) {
        return <SpinnerTimer message={busy.message} />;
    } else {
        return (
            <>
                <Row justify="center">
                    <h1>Practice History</h1>
                </Row>
                <Row justify="center">
                    <Col span={6}>Passage ID</Col>
                    <Col span={12}>Date Last Practiced</Col>
                </Row>
                {historyRecs && historyRecs.length > 0 && historyRecs.map((rec, index) =>
                <Row justify="center" key={index + "-" + rec.passageId + " " + rec.dateViewedLong + "-row"}>
                    <Col span={6} style={{marginRight: "5px"}} key={index + "-" + rec.passageId + " " + rec.dateViewedLong + "-col1"}>{rec.passageId}</Col>
                    <Col span={12} key={index + "-" + rec.passageId + " " + rec.dateViewedLong + "-col2"}>{rec.dateViewedStr}</Col>
                </Row>
                )}
            </>
        );
    }
};

export default ViewMemoryPracticeHistory;