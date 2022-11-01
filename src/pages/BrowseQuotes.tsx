import {StringUtils} from "../helpers/string.utils";
import SpinnerTimer from "../components/SpinnerTimer";
import {
    Button,
    Col, Collapse,
    Dropdown,
    Menu, MenuProps,
    Row,
    Space, Tag
} from "antd";
import Swipe from "react-easy-swipe";
import {
    ArrowLeftOutlined, ArrowRightOutlined,
    CopyOutlined, DeleteOutlined,
    EyeInvisibleOutlined, MailOutlined,
    MoreOutlined, EditOutlined,
    SearchOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import {PassageUtils} from "../helpers/passage-utils";
import {CSSTransition, SwitchTransition} from "react-transition-group";
import useBrowseQuotes from "../hooks/use-browse-quotes";
import EditQuote from "../components/EditQuote";
import QuoteTopics from "../components/QuoteTopics";
import SendQuote from "../components/SendQuote";
import FilterByTagDrawer from "../components/FilterByTagDrawer";
import React, {useState} from "react";
import useRemoveTopic from "../hooks/use-remove-topic";

const { Panel } = Collapse;

const items: MenuProps["items"] = [
    {label: "Copy", key: "copy", icon: <CopyOutlined/>},
    {label: "Send Quote...", key: "send", icon: <MailOutlined />},
    {label: "Edit Quote...", key: "edit", icon: <EditOutlined />},
    {label: "Topics...", key: "topics", icon: <UnorderedListOutlined />},
    {label: "Delete...", key: "delete", icon: <DeleteOutlined />}
];

const BrowseQuotes = () => {
    const {
        isFiltered,
        filteredQuotes,
        busy,
        editingQuote,
        setEditingQuote,
        selectTagsVisible,
        setSelectTagsVisible,
        sendQuoteVisible,
        setSendQuoteVisible,
        searchString,
        currentIndex,
        handleSearch,
        handleClearFilter,
        handleMenuClick,
        handlePrev,
        handleNext,
    } = useBrowseQuotes();
    const {handleRemoveTopic} = useRemoveTopic();
    const [associatedTopicsOpen, setAssociatedTopicsOpen] = useState(false);

    const handleClose = (topic: {id: number, name: string}) => {
        console.log("Remove topic: ", topic);
        handleRemoveTopic(topic, filteredQuotes[currentIndex]).then(() => setAssociatedTopicsOpen(false));
    };
    if (!filteredQuotes) {
        return <Row key="spinner-row" justify="center"><SpinnerTimer message="Loading quotes from server..." /></Row>;
    } else if (filteredQuotes.length === 0) {
        return <Row key="no-quotes-row" justify="center"><h5>There are no quotes configured.  Select 'Add Quote' menu to add one...</h5></Row>;
    } else {
        return (
            <>
                {busy.state && <SpinnerTimer message={busy.message}/>}
                <Row key="title-row" justify="center">
                    <h1>Browse Quotes</h1>
                </Row>
                <Swipe tolerance={60} onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
                    <Row key="index-row" style={{marginBottom: "10px"}} justify="center" align="middle">
                        <Col>{currentIndex + 1} of {filteredQuotes.length}</Col>
                        <Col style={{marginLeft: "5px"}}><Button icon={<SearchOutlined/>} onClick={handleSearch}/></Col>
                    </Row>
                    <Row key="quote-nav-row" justify="center">
                        <Space>
                            <Col><FilterByTagDrawer/></Col>
                            <Col span={6}><Button icon={<ArrowLeftOutlined/>} onClick={handlePrev}/></Col>
                            <Col span={6}><Button icon={<ArrowRightOutlined/>} onClick={handleNext}/></Col>
                            <Col span={6}><Button disabled={!isFiltered} icon={<EyeInvisibleOutlined/>}
                                                  onClick={handleClearFilter}/></Col>
                            <Col span={6}>
                                <Dropdown placement="bottomRight" trigger={["click"]} overlay={
                                    <Menu onClick={handleMenuClick} items={items}/>
                                }>
                                    <MoreOutlined style={{
                                        borderStyle: "solid",
                                        borderWidth: "thin",
                                        borderColor: "gray",
                                        padding: "7px",
                                        backgroundColor: "white"
                                    }}/>
                                </Dropdown>
                            </Col>
                        </Space>
                    </Row>
                    {filteredQuotes[currentIndex] && filteredQuotes[currentIndex].tags.length > 0 &&
                        <Row key="tags-row" justify="center">
                            <Col>
                                <Collapse activeKey={associatedTopicsOpen ? "1" : null} ghost
                                          onChange={(activeKeyString: string[]) => setAssociatedTopicsOpen(activeKeyString.length > 0)}>
                                    <Panel
                                        header={"Associated Topics (" + filteredQuotes[currentIndex].tags.length + ")"}
                                        key="1" style={{fontWeight: "bolder", fontSize: "18px"}}>
                                        {filteredQuotes[currentIndex] && filteredQuotes[currentIndex].tags.map(topic => (
                                            <Tag closable
                                                 onClose={e => {
                                                     e.preventDefault();
                                                     handleClose(topic);
                                                 }}
                                                 key={topic.id}
                                                 className="topic">
                                                {topic.name}
                                            </Tag>
                                        ))}
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>
                    }
                    {filteredQuotes && filteredQuotes.length > currentIndex && !StringUtils.isEmpty(filteredQuotes[currentIndex].quoteTx) &&
                        <SwitchTransition mode="out-in">
                            <CSSTransition
                                classNames="fade"
                                addEndListener={(node, done) => {
                                    node.addEventListener("transitionend", done, false);
                                }}
                                key={"filtered-quotes-" + currentIndex}
                            >
                                <Row key={"filtered-quotes-" + currentIndex}>
                                    <Col span={24}>
                                        <p
                                            style={{marginTop: "10px", overflow: "hidden"}}
                                            className="nugget-view"
                                            dangerouslySetInnerHTML={{__html: PassageUtils.updateLineFeedsWithBr(StringUtils.isEmpty(searchString) ? filteredQuotes[currentIndex].quoteTx : PassageUtils.updateAllMatches(searchString, filteredQuotes[currentIndex].quoteTx))}}/>
                                    </Col>
                                </Row>
                            </CSSTransition>
                        </SwitchTransition>
                    }
                </Swipe>
                {/*Down here are all the modals that can be popped up (Tags, Edit Quote, Send Quote)*/}
                <QuoteTopics props={{
                    currentQuote: filteredQuotes[currentIndex],
                    visible: selectTagsVisible,
                    setVisibleFunction: setSelectTagsVisible
                }}/>
                <EditQuote props={{
                    currentQuote: filteredQuotes[currentIndex],
                    visible: editingQuote,
                    setVisibleFunction: setEditingQuote
                }}/>
                <SendQuote props={{
                    currentQuote: filteredQuotes[currentIndex],
                    visible: sendQuoteVisible,
                    setVisibleFunction: setSendQuoteVisible
                }}/>
            </>
        );
    }
};

export default BrowseQuotes;