import {Modal, Select} from "antd";
import {useEffect, useState} from "react";
import useFilterByTag from "../hooks/use-filter-by-tag";
import {useSelector} from "react-redux";
import {AppState} from "../model/AppState";
import SpinnerTimer from "./SpinnerTimer";
const { Option } = Select;

interface FilterByTagProps {
    visible: boolean;
    setVisibleFunction: Function;
}

const FilterByTag = ({props}: {props: FilterByTagProps}) => {
    const allTags: {id: number, name: string}[] = useSelector((appState: AppState) => appState.topicList);
    const {
        amIVisible,
        dropdownOpen,
        setDropdownOpen,
        handleOk,
        handleCancel,
        handleChange
    } = useFilterByTag(props.visible);
    const [children, setChildren] = useState<React.ReactNode[]>([]);


    useEffect(() => {
        if (allTags && allTags.length > 0) {
            const locChildren = allTags.map(tg => <Option key={tg.id}>{tg.name}</Option>);
            setChildren(locChildren);
        }
    }, [allTags]);


    useEffect(() => {
        props.setVisibleFunction(amIVisible);
    }, [amIVisible]);

    return (
        <Modal title="Filter By Tags" open={amIVisible} onOk={handleOk} onCancel={handleCancel}>
            {children && children.length > 0 && <Select
                mode="multiple"
                allowClear
                style={{width: '100%'}}
                placeholder="Please select"
                onChange={handleChange}
                open={dropdownOpen}
                onDropdownVisibleChange={(visible) => setDropdownOpen(visible)}
            >
                {children}
            </Select>
            }
            {(!children || children.length === 0) && <SpinnerTimer message="loading tags..."/>}
        </Modal>
    );
};

export default FilterByTag;