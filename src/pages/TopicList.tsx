import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {useEffect, useState} from "react";
import useMemoryPassages from "../hooks/use-memory-passages";
import SpinnerTimer from "../components/SpinnerTimer";
import {Col, Input, Row} from "antd";
import {stateActions} from "../store";
import {useNavigate} from "react-router-dom";

const TopicList = () => {
    const user = useSelector((state: AppState) => state.user);
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const {getTopicList} = useMemoryPassages();
    const [busy, setBusy] = useState({state: false, message: ""});
    const [topicList, setTopicList] = useState<{id: number, name: string}[]>([]);
    const [filteredTopicList, setFilteredTopicList] = useState<{id: number, name: string}[]>([]);
    const [filter, setFilter] = useState<string>(undefined);

    useEffect(() => {
        (async () => {
            setBusy({state: true, message: "Loading topic list from DB..."});
            const topics: {id: number, name: string}[] = await getTopicList(user);
            setTopicList(topics);
            setFilteredTopicList(topics);
            setBusy({state: false, message: ""});
        })();
    }, [user]);

    const handleTopicClick = (topic: { id: number; name: string }) => {
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
            {!filteredTopicList || filteredTopicList.length === 0 && <Row justify="center" align="middle"><Col>No topics configured</Col></Row>}
        </>
        );
};

export default TopicList;