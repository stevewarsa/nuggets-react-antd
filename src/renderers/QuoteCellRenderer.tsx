import {PassageUtils} from "../helpers/passage-utils";

const QuoteCellRenderer = (props) => (
    <span dangerouslySetInnerHTML={{__html: PassageUtils.updateAllMatches(props.searchString, props.value)}}/>
);

export default QuoteCellRenderer;