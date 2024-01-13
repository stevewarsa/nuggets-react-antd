import {Button, Col, Modal, Row} from "antd";
import React, {useEffect, useState} from "react";
import {PassageUtils} from "../helpers/passage-utils";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import useMemoryPassages from "../hooks/use-memory-passages";

interface UpdateFontSizeProps {
    visible: boolean;
    setVisibleFunction: Function;
}

const getFontSizeFromCss = () => {
    // Access the computed value of --base-font-size
    let currFontSize = getComputedStyle(document.documentElement).getPropertyValue('--base-font-size');
    return parseInt(currFontSize.replace("px", ""));
};
const UpdateFontSize = ({props}: {props: UpdateFontSizeProps}) => {
    const prefs = useSelector((state: AppState) => state.userPreferences);
    const user = useSelector((state: AppState) => state.user);
    const {updatePreference} = useMemoryPassages();

    const [currFontSize, setCurrFontSize] = useState<number>(getFontSizeFromCss());
    const [overrideFontSizeVisible, setOverrideFontSizeVisible] = useState<boolean>(props.visible);

    useEffect(() => {
        console.log("UpdateFontSize.useEffect[] - currFontSize " + currFontSize + ", overrideFontSizeVisible " + overrideFontSizeVisible);
    }, []);

    useEffect(() => {
        console.log("UpdateFontSize.useEffect[props.visible] - props.visible " + props.visible);
        setOverrideFontSizeVisible(props.visible);
    }, [props.visible]);

    useEffect(() => {
        if (prefs?.length <= 0) {
            return;
        }
        const fontSizeFromIndexCss = getFontSizeFromCss();
        const newFontSizeFromPrefs = parseInt(PassageUtils.getPreferenceValueByKeyWithDefault(prefs, "font_size_override", fontSizeFromIndexCss + ""));
        if (newFontSizeFromPrefs !== currFontSize) {
            console.log("Practice.useEffect[prefs] - currFontSize " + currFontSize + ", making update to newFontSizeFromPrefs: " + newFontSizeFromPrefs);
            setCurrFontSize(newFontSizeFromPrefs);
            document.documentElement.style.setProperty('--base-font-size', `${newFontSizeFromPrefs}px`);
        }
    }, [prefs]);

    const updateFontSizeInPrefs = async (newFontSize: number) => {
        await updatePreference(user, "font_size_override", newFontSize + "");
    };

    const handleCancel = () => {
        setOverrideFontSizeVisible(false);
        props.setVisibleFunction(false);
    };

    return (
        <Modal footer={null} title="Enter Font Size" open={overrideFontSizeVisible} onCancel={handleCancel}>
            <Row>
                <Col span={8}>
                    Size:
                </Col>
                <Col span={8}>
                    {currFontSize}
                </Col>
                <Col span={8}>
                    <Button type="primary" style={{marginRight: "3px"}} onClick={() => updateFontSizeInPrefs(currFontSize + 1)}>+</Button>
                    <Button type="primary" onClick={() => updateFontSizeInPrefs(currFontSize - 1)}>-</Button>
                </Col>
            </Row>
        </Modal>
    );
};

export default UpdateFontSize;