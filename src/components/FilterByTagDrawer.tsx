import {Button, Checkbox, Drawer, Input, List, Modal, Space} from "antd";
import {useEffect, useState} from "react";
import {FilterOutlined} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import {CheckboxChangeEvent} from "antd/es/checkbox";
import {stateActions} from "../store";
import {Topic} from "../model/topic";

const FilterByTagDrawer = () => {
    const dispatcher = useDispatch();
    const allTags: Topic[] = useSelector((appState: AppState) => appState.topicList);
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<string>(undefined);
    const [filteredTopicList, setFilteredTopicList] = useState<Topic[]>([]);
    const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

    useEffect(() => {
        if (allTags && allTags.length) {
            setFilteredTopicList(allTags);
        }
    }, [allTags]);

    const showDefaultDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const onTopicSelected = (e: CheckboxChangeEvent) => {
        if (e.target.checked) {
            // add it to the list
            setSelectedTopicIds(prevState => {
                return [...prevState, parseInt(e.target.value)];
            });
        } else {
            // it is unchecked so remove it from the list
            setSelectedTopicIds(prevState => {
                let locSelectedTopicIds = [...prevState];
                return locSelectedTopicIds.filter(topicId => topicId !== parseInt(e.target.value));
            });
        }
    };

    const onSubmitFilter = () => {
        setOpen(false);
        if (selectedTopicIds && selectedTopicIds.length > 0) {
            console.log("FilterByTagDrawer.onSubmitFilter - filtering quotes down to following list of topic ids:", selectedTopicIds);
            dispatcher(stateActions.filterByTags(selectedTopicIds));
            dispatcher(stateActions.setCurrentQuotesIndex(0));
        } else {
            console.log("FilterByTagDrawer.onSubmitFilter - check if user would like to filter to quotes not having any tags", selectedTopicIds);
            Modal.confirm({
                title: "Filter to No Topics?",
                content: "Would you like to filter the list to quotes without topics?",
                okText: "Yes",
                cancelText: "No",
                closable: true,
                onOk() {
                    dispatcher(stateActions.filterToQuotesWhereNoTags());
                    dispatcher(stateActions.setCurrentQuotesIndex(0));
                },
                onCancel() {},
            });
        }
        setSelectedTopicIds([]);
        setFilter(undefined);
        setFilteredTopicList(allTags);
    };

    const doTopicFilter = (evt) => {
        setFilter(evt.target.value);
        const locFiltered = allTags.filter(tg => tg.name.toLowerCase().includes(evt.target.value.toLowerCase()));
        if (locFiltered.length > 0) {
            setFilteredTopicList(locFiltered);
        }
    };

    return (
        <>
            <Space>
                <Button icon={<FilterOutlined/>} onClick={showDefaultDrawer}></Button>
            </Space>
            <Drawer
                title="Topic Filter"
                placement="left"
                size="default"
                onClose={onClose}
                open={open}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" onClick={onSubmitFilter}>
                            OK
                        </Button>
                    </Space>
                }
            >
                <List
                    size="large"
                    header={<div><Input placeholder="Topic filter" value={filter} onChange={doTopicFilter}/></div>}
                    bordered
                    dataSource={filteredTopicList}
                    renderItem={topic => (
                        <List.Item key={topic.id}>
                            <Checkbox
                                checked={selectedTopicIds.filter(id => id === topic.id).length === 1}
                                value={topic.id}
                                onChange={onTopicSelected}>
                                {topic.name}
                            </Checkbox>
                        </List.Item>
                    )}
                />
            </Drawer>
        </>
    );
};

export default FilterByTagDrawer;