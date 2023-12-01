import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import SpinnerTimer from "../components/SpinnerTimer";
import {Col, Input, Row} from "antd";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";
import {Topic} from "../model/topic";

const TopicList = () => {
    const allTopics: Topic[] = useSelector((state: AppState) => state.topicList);
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const [busy, setBusy] = useState({state: false, message: ""});
    const [topicList, setTopicList] = useState<Topic[]>([]);
    const [filteredTopicList, setFilteredTopicList] = useState<Topic[]>([]);
    const [filter, setFilter] = useState<string>(undefined);

    useEffect(() => {
        setTopicList(allTopics);
        setFilteredTopicList(allTopics);
    }, [allTopics]);

    const handleTopicClick = (topic: Topic) => {
        console.log("User clicked on topic: " + topic.name + " (id=" + topic.id + ")");
        dispatcher(stateActions.setIncomingTopic(topic));
        navigate("/browseNuggets");
    };

    const clearFilter = () => {
        setFilteredTopicList(topicList);
        setFilter(undefined);
    };

    const doTopicFilter = (evt) => {
        setFilter(evt.target.value);
        setFilteredTopicList(topicList.filter(topic => topic.name.toLowerCase().includes(evt.target.value.toLowerCase())));
    };

    return (
        <>
            {busy.state && <SpinnerTimer message={busy.message} />}
            <Row justify="center">
                <h1>Topic List</h1>
            </Row>
            <Row justify="center" style={{marginBottom: "5px"}}>
                <Col><span style={{fontWeight: "bold"}}>Count:</span> {filteredTopicList.length}</Col>
            </Row>
            <Row justify="center">
                <Col style={{marginRight: "6px"}}><Input placeholder="Enter topic filter" value={filter} onChange={doTopicFilter}/></Col>
                {filteredTopicList.length < topicList.length && <Col><a style={{cursor: "pointer"}} onClick={clearFilter}> (Clear Filter)</a></Col>}
            </Row>
            {filteredTopicList && filteredTopicList.length > 0 && filteredTopicList.map(topic => (
                <Row key={topic.id} justify="center" align="middle">
                    <Col><a style={{cursor: "pointer"}} onClick={() => handleTopicClick(topic)}>{topic.name}</a></Col>
                </Row>
            ))
            }
            {(!filteredTopicList || filteredTopicList.length === 0) && <Row justify="center" align="middle"><Col>No topics configured</Col></Row>}
        </>
        );
};

export default TopicList;