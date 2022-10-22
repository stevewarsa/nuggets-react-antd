import {Form, Input, Modal, Row, Select} from "antd";
import SpinnerTimer from "./SpinnerTimer";
import useSendQuote from "../hooks/use-send-quote";
import {Quote} from "../model/quote";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";

type SizeType = Parameters<typeof Form>[0]['size'];

interface SendQuoteProps {
    currentQuote: Quote;
    visible: boolean;
    setVisibleFunction: Function;
}

const SendQuote = ({props}: {props: SendQuoteProps}) => {
    const allUsers = useSelector((appState: AppState) => appState.allUsers);
    const user = useSelector((state: AppState) => state.user);
    const {
        modalBusy,
        sendQuoteVisible,
        modalErrorMessage,
        userToSendTo,
        emailAddress,
        setEmailAddress,
        emailSubject,
        setEmailSubject,
        comments,
        quoteForSend,
        handleOk,
        handleCancel,
        handleSelectUser,
        handleComments
    } = useSendQuote(props.currentQuote, props.visible);

    const [componentSize, setComponentSize] = useState<SizeType | 'default'>('small');

    const { TextArea } = Input;

    const onFormLayoutChange = ({ size }: { size: SizeType }) => {
        setComponentSize(size);
    };

    useEffect(() => {
        props.setVisibleFunction(sendQuoteVisible);
    }, [sendQuoteVisible]);

    return (
        <Modal title="Send Quote" open={sendQuoteVisible} onOk={handleOk} onCancel={handleCancel}>
            {modalBusy.state && <Row justify="center"><SpinnerTimer message={modalBusy.message}/></Row>}
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                initialValues={{ size: componentSize }}
                onValuesChange={onFormLayoutChange}
                size={componentSize as SizeType}
            >
                {modalErrorMessage &&
                    <Form.Item label="Error" colon={true}>
                        <span style={{color: "red", fontWeight: "bold"}}>{modalErrorMessage}</span>
                    </Form.Item>
                }
                {allUsers && allUsers.length > 0 &&
                    <Form.Item label="To" colon={true}>
                        <Select onChange={handleSelectUser}>
                            <Select.Option key="n/a" value={userToSendTo}>--Select User--</Select.Option>
                            {allUsers.filter(usr => !["Guest", user].includes(usr.userName)).map(usr =>
                                <Select.Option key={usr.userName} value={usr.userName}>{usr.userName}</Select.Option>
                            )}
                        </Select>
                    </Form.Item>
                }
                <Form.Item label="Email Address" colon={true}>
                    <Input autoComplete="off" value={emailAddress} autoFocus onChange={(evt) => setEmailAddress(evt.target.value)} />
                </Form.Item>
                <Form.Item label="Email Subject" colon={true}>
                    <Input autoComplete="off" value={emailSubject} autoFocus onChange={(evt) => setEmailSubject(evt.target.value)} />
                </Form.Item>
                <Form.Item label="Comments" colon={true}>
                    <TextArea
                        style={{marginLeft: "5px", marginRight: "5px"}}
                        autoSize
                        placeholder="Enter comments to send with quote"
                        value={comments}
                        onChange={handleComments}/>
                </Form.Item>
                <Form.Item label="Quote Text" colon={true}>
                    {quoteForSend}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SendQuote;