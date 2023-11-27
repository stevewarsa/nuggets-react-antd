import {Quote} from "../model/quote";
import {Button, Col, Input, Modal, Row} from "antd";
import useEditQuote from "../hooks/use-edit-quote";
import {useEffect} from "react";

interface EditQuoteProps {
    currentQuote: Quote;
    visible: boolean;
    setVisibleFunction: Function;
}

const EditQuote = ({props}: {props: EditQuoteProps}) => {
    const {
        quoteForEdit,
        editQuoteVisible,
        handleQuoteForEdit,
        handleRemoveLineFeedsAndExtraSpaces,
        handleUpdateQuoteCancel,
        handleUpdateQuote
    } = useEditQuote(props.currentQuote, props.visible);
    const { TextArea } = Input;

    useEffect(() => {
        props.setVisibleFunction(editQuoteVisible);
    }, [editQuoteVisible]);

    return (
        <Modal title="Edit Quote" open={editQuoteVisible} onOk={handleUpdateQuote} onCancel={handleUpdateQuoteCancel}>
            <Row style={{marginBottom: "0.36rem"}}>
                <Col style={{width: "100%"}}>
                    <TextArea
                        style={{marginLeft: "0.36rem", marginRight: "0.36rem", fontSize: "1.71rem", fontWeight: "bolder"}}
                        autoSize
                        value={quoteForEdit}
                        onChange={handleQuoteForEdit}/>
                </Col>
            </Row>
            <Row>
                <Col style={{width: "100%", marginLeft: "0.36rem", marginRight: "0.36rem"}}>
                    <Button type="primary" onClick={handleRemoveLineFeedsAndExtraSpaces}>Remove Line Feeds</Button>
                </Col>
            </Row>
        </Modal>
    );
};

export default EditQuote;