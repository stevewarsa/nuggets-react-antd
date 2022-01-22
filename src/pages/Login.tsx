import {Button, Checkbox, Form, Input, Select} from "antd";
import {useCallback, useEffect, useState} from "react";
import {CookieUtils} from "../helpers/cookie-utils";
import {StringUtils} from "../helpers/string.utils";
import {useDispatch, useSelector} from "react-redux";
import {stateActions} from "../store";
import {useLocation, useNavigate} from "react-router-dom";
import memoryService from "../services/memory-service";
import {AppState} from "../model/AppState";
import SpinnerTimer from "../components/SpinnerTimer";
import {useIsMounted} from "../helpers/is-mounted";

const Login = () => {
    const dispatcher = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const allUsers = useSelector((appState: AppState) => appState.allUsers);
    const {Option} = Select;
    const [initVals, setInitVals] = useState({username: "", remember: false, selectUserName: "N/A"});
    const [form] = Form.useForm();
    const [busy, setBusy] = useState({state: false, message: ""});
    const isMounted = useIsMounted();

    const redirectAfterLogin = useCallback(() => {
        // @ts-ignore
        if (location.state?.from?.pathname && !["/readChapter", "/selectVerses", "/practice"].includes(location.state.from.pathname)) {
            // @ts-ignore
            console.log("location.state.from is populated with: ", location.state.from.pathname);
            // @ts-ignore
            navigate(location.state.from.pathname);
        } else {
            console.log("location.state.from is NOT populated");
            navigate("/mainMenu");
        }
        // @ts-ignore
    }, [location.state, navigate]);

    useEffect(() => {
        if (!isMounted.current) {
            return;
        }
        const userName = CookieUtils.getCookie('user.name');
        if (!StringUtils.isEmpty(userName)) {
            // log 'em right in...
            dispatcher(stateActions.setUser(userName));
            redirectAfterLogin();
            return;
        }
    }, [dispatcher, navigate, isMounted, redirectAfterLogin]);

    useEffect(() => {
        form.resetFields();
    }, [initVals, form]);

    const onFinish = async () => {
        setBusy({state: true, message: "Logging in..."});
        //console.log('Success:', initVals);
        const user = StringUtils.isEmpty(initVals.username) ? initVals.selectUserName : initVals.username;
        const response = await memoryService.doLogin(user);
        if (response.data === "success") {
            if (initVals.remember) {
                // write cookie so they won't have to login next time
                //console.log("Writing out cookies for automatic login");
                CookieUtils.setCookie('user.name', user, 365);
            }
            dispatcher(stateActions.setUser(user));
            setBusy({state: false, message: ""});
            redirectAfterLogin();
        } else {
            //console.log("onFinish - response: " + response.data);
            setBusy({state: false, message: ""});
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const handleUserSelectionChange = (value) => {
        setInitVals(prev => {
            return {...prev, selectUserName: value};
        });
    };

    const handleRememberMe = (evt) => {
        setInitVals(prev => {
            return {...prev, remember: evt.target.checked};
        });
    };

    const handleUserName = (evt) => {
        setInitVals(prev => {
            return {...prev, username: evt.target.value};
        });
    };

    if (busy.state) {
        return <SpinnerTimer message={busy.message}/>;
    } else {
        return (
            <Form
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={initVals}
                autoComplete="off"
                form={form}
            >
                {(!initVals.selectUserName || initVals.selectUserName === "N/A") &&
                    <Form.Item
                        label="Username"
                        name="username"
                    >
                        <Input autoFocus value={initVals.username} onChange={handleUserName}/>
                    </Form.Item>
                }

                {allUsers && allUsers.length > 0 && StringUtils.isEmpty(initVals.username) &&
                    <Form.Item
                        label="Select User"
                        name="selectUserName"
                    >
                        <Select size="large" value={initVals.selectUserName} onChange={handleUserSelectionChange}>
                            <Option key="N/A" value="N/A">--Select User--</Option>
                            {allUsers.map(user => <Option key={user.userName}
                                                          value={user.userName}>{user.userName}</Option>)}
                        </Select>
                    </Form.Item>
                }

                <Form.Item name="remember" valuePropName="checked">
                    <Checkbox onClick={handleRememberMe} checked={initVals.remember}>Remember me</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button disabled={initVals.selectUserName === "N/A" && StringUtils.isEmpty(initVals.username)} type="primary" htmlType="submit">
                        Login
                    </Button>
                </Form.Item>
            </Form>
        );
    }
};

export default Login;