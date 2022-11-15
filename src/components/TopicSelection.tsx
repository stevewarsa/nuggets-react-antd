import {Topic} from "../model/topic";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import React, {ChangeEvent, forwardRef, useImperativeHandle, useRef, useState} from "react";
import {Button, Checkbox, Col, Divider, Input, InputRef, notification, Row, Tag} from "antd";
import {CloseSquareOutlined, PlusOutlined} from "@ant-design/icons";
import {StringUtils} from "../helpers/string.utils";

interface TopicSelectionProps {
    associatedTopics: Topic[];
    addTopicFunction: Function;
    newTopicFunction: any;
}

const TopicSelection = forwardRef(({props}: {props: TopicSelectionProps}, ref) => {
    const allTopics: Topic[] = useSelector((appState: AppState) => appState.topicList);
    const recentTopicsUsed: Topic[] = useSelector((appState: AppState) => appState.recentTopicsUsed);
    const newTopicInputRef = useRef<InputRef>(null);
    const topicFilterRef = useRef<InputRef>(null);
    const [filter, setFilter] = useState(undefined);
    const [topicsPendingAdd, setTopicsPendingAdd] = useState<Topic[]>([]);
    const [newTopicInputVisible, setNewTopicInputVisible] = useState(false);
    const [newTopicInputValue, setNewTopicInputValue] = useState(undefined);

    useImperativeHandle(ref, () => ({
        cleanup: doCleanup
    }));

    const handleTopicFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const filterValue = e.target.value.trim();
        setFilter(filterValue);
    };

    const handleAddRemovePendingTopic = (evt, topic: Topic) => {
        if (evt.target.checked) {
            // user checked box - add this topic to the pending list
            setTopicsPendingAdd([...topicsPendingAdd, topic]);
        } else {
            // user unchecked the box - remove this topic from the pending list
            setTopicsPendingAdd(topicsPendingAdd.filter(tpc => tpc.id !== topic.id));
        }
    };

    const handleAddPendingTopics = () => {
        doCleanup();
        props.addTopicFunction(topicsPendingAdd);
    };

    const doCleanup = () => {
        setTopicsPendingAdd([]);
        setFilter(undefined);
    };

    const handleEnterNewTopic = () => {
        if (StringUtils.isEmpty(newTopicInputValue)) {
            notification.warning({message: "New topic not entered", placement: "topLeft"});
        } else {
            props.newTopicFunction(newTopicInputValue);
        }
        setNewTopicInputValue(undefined);
        setNewTopicInputVisible(false);
    };

    return (
        <>
            <Row style={{marginBottom: "5px"}}>
                <Col><Button disabled={topicsPendingAdd.length === 0} type="primary" onClick={handleAddPendingTopics}>Add Selected</Button></Col>
            </Row>
            {newTopicInputVisible && (
                <Input
                    ref={newTopicInputRef}
                    type="text"
                    size="small"
                    style={{width: 78}}
                    value={newTopicInputValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTopicInputValue(e.target.value)}
                    onBlur={handleEnterNewTopic}
                    onPressEnter={handleEnterNewTopic}
                />
            )}
            {!newTopicInputVisible && (
                <Tag onClick={() => setNewTopicInputVisible(true)} className="topic">
                    <PlusOutlined/> New Topic
                </Tag>
            )}
            {recentTopicsUsed && recentTopicsUsed.length > 0 && <h3>Recent Topics Used:</h3>}
            {recentTopicsUsed &&
                recentTopicsUsed.length > 0 &&
                recentTopicsUsed.filter(tg => !props.associatedTopics.map(topic => topic.id).includes(tg.id)).map(tg => (
                    <Tag key={tg.id + "-recent"} onClick={() => props.addTopicFunction([tg])} className="topic">
                        <PlusOutlined/> {tg.name}
                    </Tag>
                ))}
            {recentTopicsUsed && recentTopicsUsed.length > 0 &&
                <Divider style={{color: "black"}} dashed/>}
            {allTopics && allTopics.length > 0 &&
                <>
                    <h3>All Topics:</h3>
                    <Row>
                        <Col>
                            <Input
                                ref={topicFilterRef}
                                type="text"
                                size="middle"
                                style={{width: 150}}
                                value={filter}
                                autoFocus
                                onChange={handleTopicFilterChange}
                                placeholder="Filter Topics"
                            />
                        </Col>
                        <Col>
                            <Button icon={<CloseSquareOutlined/>} onClick={() => setFilter(undefined)}/>
                        </Col>
                    </Row>
                    <br/><br/>
                </>
            }
            {allTopics.length > 0 &&
                allTopics.filter(tg => !props.associatedTopics.map(topic => topic.id).includes(tg.id) && (!filter || tg.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)).map(topic => (
                    <Row key={topic.id}>
                        <Col>
                            <Checkbox onClick={(evt) => handleAddRemovePendingTopic(evt, topic)}
                                      checked={topicsPendingAdd.length > 0 && topicsPendingAdd.filter(tpc => topic.id === tpc.id).length === 1}>
                            </Checkbox>
                            <Tag style={{marginLeft: 4}} onClick={() => props.addTopicFunction([topic])} className="topic">
                                <PlusOutlined/> {topic.name}
                            </Tag>
                        </Col>
                    </Row>
                ))
            }
            <Row style={{marginBottom: "5px"}}>
                <Col><Button disabled={topicsPendingAdd.length === 0} type="primary" onClick={handleAddPendingTopics}>Add Selected</Button></Col>
            </Row>
        </>
    );
});

export default TopicSelection;