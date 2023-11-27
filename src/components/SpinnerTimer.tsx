import { useState } from "react";
import {useIsMounted} from "../hooks/is-mounted";
import {Spin} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const SpinnerTimer = ({message}: {message:string}) => {
    const [seconds, setSeconds] = useState(0);
    const isMounted = useIsMounted();
    const antIcon = <LoadingOutlined style={{ fontSize: "1.71rem" }} spin />;
    setTimeout(() => {
        // SW [11/11/2021 5:53 AM] Make sure this component is still mounted before doing the state update
        // otherwise will get the following message:
        // Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
        if (isMounted.current) {
            setSeconds(prevSeconds => prevSeconds + 1);
        }
    }, 1000);
    return (
        <>
            <Spin indicator={antIcon} style={{marginRight: "3px"}}  /> {message + " (" + seconds + " seconds)"}
        </>
    );
};

export default SpinnerTimer;