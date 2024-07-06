import {Button, Radio, Row, Space} from "antd";
import {useEffect, useState} from "react";
import {CaretRightOutlined} from "@ant-design/icons";
import {stateActions} from "../store";
import {PracticeConfig} from "../model/PracticeConfig";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {PassageUtils} from "../helpers/passage-utils";
import useMemoryPassages from "../hooks/use-memory-passages";
import {AppState} from "../model/AppState";

const PracticeSetup = () => {
    const navigate = useNavigate();
    const dispatcher = useDispatch();
    const user = useSelector((state: AppState) => state.user);
    const {getMemPassages} = useMemoryPassages();
    const [practiceMode, setPracticeMode] = useState(PassageUtils.BY_REF);
    const [passageDisplayOrder, setPassageDisplayOrder] = useState(PassageUtils.BY_FREQ);
    const [memPassagesExist, setMemPassagesExist] = useState(false);

    useEffect(() => {
        (async () => {
            const memPsgResp = await getMemPassages(user, false);
            setMemPassagesExist(memPsgResp?.passages && memPsgResp.passages.length > 0);
        })();
    }, []);

    const handlePracticeModeChange = (e: any) => {
        setPracticeMode(e.target.value);
    };
    const handlePassageDisplayOrderChange = (e: any) => {
        setPassageDisplayOrder(e.target.value);
    };

    const handleStart = async () => {
        dispatcher(stateActions.setPracticeConfig({practiceMode: practiceMode, passageDisplayOrder: passageDisplayOrder, startAtPassageId: -1} as PracticeConfig));
        navigate("/practice");
    }
    if (memPassagesExist) {
        return (
            <>
                <Row style={{marginBottom: '5px', justifyContent: "left"}}>
                    <h3>Practice Mode:</h3>
                </Row>
                <Row style={{marginBottom: '20px'}}>
                    <Radio.Group onChange={handlePracticeModeChange} value={practiceMode}>
                        <Space direction="vertical">
                            <Radio checked={practiceMode === PassageUtils.BY_REF} value={PassageUtils.BY_REF}>By
                                Reference</Radio>
                            <Radio checked={practiceMode === PassageUtils.BY_PSG_TXT} value={PassageUtils.BY_PSG_TXT}>By
                                Passage Text</Radio>
                        </Space>
                    </Radio.Group>
                </Row>
                <Row style={{marginBottom: '5px'}}>
                    <h3>Passage Display Order:</h3>
                </Row>
                <Row style={{marginBottom: '20px'}}>
                    <Radio.Group onChange={handlePassageDisplayOrderChange} value={passageDisplayOrder}>
                        <Space direction="vertical">
                            <Radio value={PassageUtils.BY_FREQ}>By Frequency</Radio>
                            <Radio value={PassageUtils.INTERLEAVE}>Interleave</Radio>
                            <Radio value={PassageUtils.RAND}>By Random</Radio>
                            <Radio value={PassageUtils.BY_LAST_PRACTICED}>By Last Practiced Date/Time</Radio>
                        </Space>
                    </Radio.Group>
                </Row>
                <Row style={{marginBottom: '10px'}}>
                    <Button icon={<CaretRightOutlined/>} type="primary" onClick={handleStart}>Start</Button>
                </Row>
            </>
        );
    } else {
        return (
            <Row justify="center" style={{marginBottom: '5px'}}>
                <h3>No Memory Verses Configured Yet...</h3>
            </Row>
        );
    }
};

export default PracticeSetup;