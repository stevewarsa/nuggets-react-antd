import {TweenOneGroup} from "rc-tween-one";
import {Divider, Input, InputRef, Modal, Tag} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {Quote} from "../model/quote";
import useQuoteTopics from "../hooks/use-quote-topics";
import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import SpinnerTimer from "./SpinnerTimer";

interface QuoteTopicsProps {
    currentQuote: Quote;
    visible: boolean;
    setVisibleFunction: Function;
}

const QuoteTopics = ({props}: {props: QuoteTopicsProps}) => {
    const {
        topicInputVisible,
        topicInputValue,
        quoteTopicsVisible,
        filter,
        busy,
        handleTopicFilterChange,
        setQuoteTopicsVisible,
        addExistingTopicToQuote,
        handleTopicInputChange,
        handleTopicInputConfirm,
        handleTopicOk,
        handleTopicCancel,
        showTopicInput,
        handleRemoveTopic
    } = useQuoteTopics(props.currentQuote, props.visible);
    const allTopics: {id: number, name: string}[] = useSelector((appState: AppState) => appState.topicList);
    const recentTopicsUsed: {id: number, name: string}[] = useSelector((appState: AppState) => appState.recentTopicsUsed);
    const topicInputRef = useRef<InputRef>(null);
    const topicFilterRef = useRef<InputRef>(null);

    useEffect(() => {
        if (topicInputVisible) {
            topicInputRef.current.focus();
        }
    }, [topicInputVisible]);

    useEffect(() => {
        if (quoteTopicsVisible && topicFilterRef && topicFilterRef.current) {
            console.log("QuoteTopics.useEffect[quoteTopicsVisible] - focusing the topic filter text box...");
            setTimeout(() => {
                topicFilterRef.current.focus();
            }, 500);
        }
    }, [quoteTopicsVisible, props.currentQuote, allTopics]);

    useEffect(() => {
        props.setVisibleFunction(quoteTopicsVisible);
    }, [quoteTopicsVisible]);
    return (
        <Modal title="Quote Topics" open={quoteTopicsVisible} onOk={handleTopicOk} onCancel={handleTopicCancel}>
            {props.currentQuote && props.currentQuote.tags && props.currentQuote.tags.length > 0 &&
                <fieldset style={{borderStyle: "solid", borderWidth: "1px", marginBottom: "10px", padding: "10px"}}>
                    <legend>Associated Topics</legend>
                    <TweenOneGroup
                        enter={{
                            scale: 0.8,
                            opacity: 0,
                            type: 'from',
                            duration: 100,
                        }}
                        onEnd={e => {
                            if (e.type === 'appear' || e.type === 'enter') {
                                (e.target as any).style = 'display: inline-block';
                            }
                        }}
                        leave={{opacity: 0, width: 0, scale: 0, duration: 200}}
                        appear={false}
                    >
                        {props.currentQuote && props.currentQuote.tags.map(topic => (
                            <span key={topic.id} style={{display: 'inline-block'}}>
                        <Tag
                            key={topic.id}
                            closable
                            onClose={e => {
                                e.preventDefault();
                                handleRemoveTopic(topic, props.currentQuote);
                                setQuoteTopicsVisible(false);
                            }}
                            className="topic"
                        >
                            {topic.name}
                        </Tag>
                    </span>
                        ))}
                    </TweenOneGroup>
                </fieldset>
            }
            {topicInputVisible && (
                <Input
                    ref={topicInputRef}
                    type="text"
                    size="small"
                    style={{width: 78}}
                    value={topicInputValue}
                    onChange={handleTopicInputChange}
                    onBlur={handleTopicInputConfirm}
                    onPressEnter={handleTopicInputConfirm}
                />
            )}
            {busy.state && <SpinnerTimer message={busy.message} />}
            {!topicInputVisible && (
                <Tag onClick={showTopicInput} className="topic">
                    <PlusOutlined/> New Topic
                </Tag>
            )}
            {props.currentQuote && recentTopicsUsed && recentTopicsUsed.length > 0 && <h3>Recent Topics Used:</h3>}
            {props.currentQuote &&
                recentTopicsUsed &&
                recentTopicsUsed.length > 0 &&
                recentTopicsUsed.filter(tg => !props.currentQuote.tagIds.includes(tg.id)).map(tg => (
                    <Tag key={tg.id + "-recent"} onClick={() => addExistingTopicToQuote(tg)} className="topic">
                        <PlusOutlined/> {tg.name}
                    </Tag>
                ))}
            {props.currentQuote && recentTopicsUsed && recentTopicsUsed.length > 0 &&
                <Divider style={{color: "black"}} dashed/>}
            {props.currentQuote && allTopics && allTopics.length > 0 &&
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
            {props.currentQuote &&
                allTopics.length > 0 &&
                allTopics.filter(tg => !props.currentQuote.tagIds.includes(tg.id) && (!filter || tg.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)).map(tg => (
                    <Tag key={tg.id} onClick={() => addExistingTopicToQuote(tg)} className="topic">
                        <PlusOutlined/> {tg.name}
                    </Tag>
                ))
            }
        </Modal>
    );
};

export default QuoteTopics;