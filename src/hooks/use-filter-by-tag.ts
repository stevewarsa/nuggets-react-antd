import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {stateActions} from "../store";

const useFilterByTag = (visible: boolean) => {
    const dispatcher = useDispatch();
    const [amIVisible, setAmIVisible] = useState(false);
    const [selectedFilterTags, setSelectedFilterTags] = useState<number[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        setAmIVisible(visible);
    }, [visible]);

    const handleOk = () => {
        setAmIVisible(false);
        dispatcher(stateActions.filterByTags(selectedFilterTags))
    };
    const handleCancel = () => {
        setAmIVisible(false);
    };

    const handleChange = (value: number[]) => {
        console.log(`selected ${value}`);
        setSelectedFilterTags(value);
        setDropdownOpen(false);
    };

    return {
        amIVisible: amIVisible,
        dropdownOpen: dropdownOpen,
        setDropdownOpen: setDropdownOpen,
        handleOk: handleOk,
        handleCancel: handleCancel,
        handleChange: handleChange
    };
};

export default useFilterByTag;