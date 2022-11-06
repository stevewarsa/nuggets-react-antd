import {Topic} from "../model/topic";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import React, {ChangeEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Button, Checkbox, Col, Divider, Input, InputRef, Row, Tag} from "antd";
import {PlusOutlined} from "@ant-design/icons";

interface TopicSelectionProps {
    associatedTopics: Topic[];
    addTopicFunction: Function;
}
const TopicSelection = forwardRef(({props}: {props: TopicSelectionProps}, ref) => {
    const allTopics: Topic[] = useSelector((appState: AppState) => appState.topicList);
    const recentTopicsUsed: Topic[] = useSelector((appState: AppState) => appState.recentTopicsUsed);
    const topicFilterRef = useRef<InputRef>(null);
    const [filter, setFilter] = useState(undefined);
    const [topicsPendingAdd, setTopicsPendingAdd] = useState<Topic[]>([]);

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

    return (
        <>
            <Row style={{marginBottom: "5px"}}>
                <Col><Button disabled={topicsPendingAdd.length === 0} type="primary" onClick={handleAddPendingTopics}>Add Selected</Button></Col>
            </Row>
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
                            <Tag onClick={() => props.addTopicFunction([topic])} className="topic">
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