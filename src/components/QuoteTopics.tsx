import {TweenOneGroup} from "rc-tween-one";
import {InputRef, Modal, Tag} from "antd";
import {Quote} from "../model/quote";
import useQuoteTopics from "../hooks/use-quote-topics";
import React, {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import SpinnerTimer from "./SpinnerTimer";
import {Topic} from "../model/topic";
import TopicSelection from "./TopicSelection";

interface QuoteTopicsProps {
    currentQuote: Quote;
    visible: boolean;
    setVisibleFunction: Function;
}

const QuoteTopics = ({props}: {props: QuoteTopicsProps}) => {
    const {
        quoteTopicsVisible,
        busy,
        setQuoteTopicsVisible,
        addExistingTopicsToQuote,
        handleTopicInputConfirm,
        handleTopicOk,
        handleTopicCancel,
        handleRemoveTopic
    } = useQuoteTopics(props.currentQuote, props.visible);
    const allTopics: Topic[] = useSelector((appState: AppState) => appState.topicList);
    const topicFilterRef = useRef<InputRef>(null);

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
                        {props.currentQuote.tags.map(topic => (
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
            {busy.state && <SpinnerTimer message={busy.message} />}
            {props.currentQuote &&
                <TopicSelection props={{
                    associatedTopics: props.currentQuote.tags,
                    addTopicFunction: addExistingTopicsToQuote,
                    newTopicFunction: handleTopicInputConfirm
                }} />
            }
        </Modal>
    );
};

export default QuoteTopics;