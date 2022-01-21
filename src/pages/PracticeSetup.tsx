import {Button, Radio, Row, Space} from "antd";
import {useState} from "react";
import {CaretRightOutlined} from "@ant-design/icons";
import {stateActions} from "../store";
import {PracticeConfig} from "../model/PracticeConfig";
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {PassageUtils} from "../helpers/passage-utils";
import memoryService from "../services/memory-service";
import {AppState} from "../model/AppState";

const PracticeSetup = () => {
    const history = useHistory();
    const dispatcher = useDispatch();
    const [practiceMode, setPracticeMode] = useState(PassageUtils.BY_REF);
    const [passageDisplayOrder, setPassageDisplayOrder] = useState(PassageUtils.BY_FREQ);
    const user = useSelector((state: AppState) => state.user);

    const handlePracticeModeChange = (e: any) => {
        setPracticeMode(e.target.value);
    };
    const handlePassageDisplayOrderChange = (e: any) => {
        setPassageDisplayOrder(e.target.value);
    };

    const handleStart = async () => {
        console.log("Handle Start - user: " + user);
        dispatcher(stateActions.setPracticeConfig({practiceMode: practiceMode, passageDisplayOrder: passageDisplayOrder} as PracticeConfig));
        const locMemoryPassageOverridesData: any = await memoryService.getMemoryPassageTextOverrides(user);
        dispatcher(stateActions.setMemoryTextOverrides(locMemoryPassageOverridesData.data));
        history.push("/practice");
    }

    return (
        <>
            <Row style={{marginBottom: '5px'}}>
                <h3>Practice Mode:</h3>
            </Row>
            <Row style={{marginBottom: '20px'}}>
                <Radio.Group onChange={handlePracticeModeChange} value={practiceMode}>
                    <Space direction="vertical">
                        <Radio checked={practiceMode === PassageUtils.BY_REF} value={PassageUtils.BY_REF}>By Reference</Radio>
                        <Radio checked={practiceMode === PassageUtils.BY_PSG_TXT} value={PassageUtils.BY_PSG_TXT}>By Passage Text</Radio>
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
                        <Radio value={PassageUtils.RAND}>By Random</Radio>
                        <Radio value={PassageUtils.BY_LAST_PRACTICED}>By Last Practiced Date/Time</Radio>
                    </Space>
                </Radio.Group>
            </Row>
            <Row style={{marginBottom: '10px'}}>
                <Button icon={<CaretRightOutlined />} type="primary" onClick={handleStart}>Start</Button>
            </Row>
        </>
    );
};

export default PracticeSetup;