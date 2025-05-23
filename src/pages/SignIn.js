/*!
=========================================================
* Muse Ant Design Dashboard - v1.0.0
=========================================================
* Product Page: https://www.creative-tim.com/product/muse-ant-design-dashboard
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/muse-ant-design-dashboard/blob/main/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import React, { Component } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Switch,
  notification,
  message,
  Card,
} from "antd";
import signinbg from "../assets/images/men39s-clothes-hanger-generative-ai (1).jpg";
import {
  DribbbleOutlined,
  TwitterOutlined,
  InstagramOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Redirect } from "react-router-dom/cjs/react-router-dom";
import imagee from "../assets/videos/6994619-uhd_3840_2160_30fps.mp4";
function onChange(checked) {
  console.log(`switch to ${checked}`);
}

const { Title } = Typography;
const { Header, Footer, Content } = Layout;
const template = [
  <svg
    data-v-4ebdc598=""
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      data-v-4ebdc598=""
      d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6V4Z"
      fill="#111827"
      className="fill-muted"
    ></path>
    <path
      data-v-4ebdc598=""
      d="M3 10C3 9.44771 3.44772 9 4 9H10C10.5523 9 11 9.44771 11 10V16C11 16.5523 10.5523 17 10 17H4C3.44772 17 3 16.5523 3 16V10Z"
      fill="#111827"
      className="fill-muted"
    ></path>
    <path
      data-v-4ebdc598=""
      d="M14 9C13.4477 9 13 9.44771 13 10V16C13 16.5523 13.4477 17 14 17H16C16.5523 17 17 16.5523 17 16V10C17 9.44771 16.5523 9 16 9H14Z"
      fill="#111827"
      className="fill-muted"
    ></path>
  </svg>,
];
const profile = [
  <svg
    data-v-4ebdc598=""
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      data-v-4ebdc598=""
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM12 7C12 8.10457 11.1046 9 10 9C8.89543 9 8 8.10457 8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7ZM9.99993 11C7.98239 11 6.24394 12.195 5.45374 13.9157C6.55403 15.192 8.18265 16 9.99998 16C11.8173 16 13.4459 15.1921 14.5462 13.9158C13.756 12.195 12.0175 11 9.99993 11Z"
      fill="#111827"
      className="fill-muted"
    ></path>
  </svg>,
];
const signup = [
  <svg
    data-v-4ebdc598=""
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      data-v-4ebdc598=""
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 2C5.44772 2 5 2.44772 5 3V4H4C2.89543 4 2 4.89543 2 6V16C2 17.1046 2.89543 18 4 18H16C17.1046 18 18 17.1046 18 16V6C18 4.89543 17.1046 4 16 4H15V3C15 2.44772 14.5523 2 14 2C13.4477 2 13 2.44772 13 3V4H7V3C7 2.44772 6.55228 2 6 2ZM6 7C5.44772 7 5 7.44772 5 8C5 8.55228 5.44772 9 6 9H14C14.5523 9 15 8.55228 15 8C15 7.44772 14.5523 7 14 7H6Z"
      fill="#111827"
      className="fill-muted"
    ></path>
  </svg>,
];
const signin = [
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 14 14"
  >
    <path
      className="fill-muted"
      d="M12.25,14H1.75A1.752,1.752,0,0,1,0,12.25V3.5A1.752,1.752,0,0,1,1.75,1.75h.876V.875a.875.875,0,0,1,1.75,0V1.75h5.25V.875a.875.875,0,0,1,1.75,0V1.75h.875A1.752,1.752,0,0,1,14,3.5v8.75A1.752,1.752,0,0,1,12.25,14ZM3.5,4.375a.875.875,0,0,0,0,1.75h7a.875.875,0,0,0,0-1.75Z"
    />
  </svg>,
];

const SignIn = () => {
  let history = useHistory();

  const onFinish = (values) => {
    console.log("Success:", values);

    const res = axios
      .post("https://rayhanaboutique.online/admins/login", {
        email: values.email,
        password: values.password,
      })
      .then((response) => {
        console.log("zzzzzz", response);
        notification.success({
          message: `Bienvenue ! `,
          description: "mar7beeeeeeeee bik ",
          placement: "topRight",
        });

        history.push("/dashboard");
        // if (response.data.data) {
        //   setData(response.data.data);
        //   setisload(false);
        // } else {
        //   notification.error({ message: "No Data Found" });
        //   setisload(false);
        // }
      })
      .catch((error) => {
        console.error("error", error);
        notification.error({
          message: error.response.data.error.message,
          description:
            "Veuillez vérifier votre adresse e-mail ou votre mot de passe s'il vous plaît.",
          placement: "topRight",
        });
      });
    console.log("res", res);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Layout className="layout-default layout-signin">
        <Header>
          <div className="header-col header-brand">
            <h5>Fashion Dashboard</h5>
          </div>
          <div className="header-col header-nav">
            <Menu mode="horizontal" defaultSelectedKeys={["1"]}>
              {/* <Menu.Item key="1">
                  <Link to="/dashboard">
                    {template}
                    <span> Dashboard</span>
                  </Link>
                </Menu.Item> */}
              <Menu.Item key="2">
                <Link to="/profile">
                  {profile}
                  <span>Profile</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/sign-up">
                  {signup}
                  <span> Sign Up</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to="/sign-in">
                  {signin}
                  <span> Sign In</span>
                </Link>
              </Menu.Item>
            </Menu>
          </div>
          {/* <div className="header-col header-btn">
              <Button type="primary">FREE DOWNLOAD</Button>
            </div> */}
        </Header>
        <div className="card-container">
      <video className="videoTag" autoPlay loop muted>
        <source src={imagee} type="video/mp4" />
      </video>
      <Card className="transparent-card">
        <div className="signin">
          <Row gutter={[24, 0]} justify="space-around">
            <Col xs={{ span: 24, offset: 0 }} lg={{ span: 6, offset: 2 }} md={{ span: 12 }}>
              <Title className="mb-15" level={3} style={{ color: '#ffffffa3' }}>Se connecter...</Title>
              <Title className="font-regular text-muted" level={5}>
                Entrez votre adresse e-mail et votre mot de passe pour vous connecter
              </Title>
              <Form onFinish={onFinish} onFinishFailed={onFinishFailed} layout="vertical" className="row-col">
                <Form.Item
                  className="username"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Veuillez entrer votre adresse e-mail!",
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                  className="username"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Veuillez entrer votre mot de passe !",
                    },
                  ]}
                >
                  <Input type="password" placeholder="Mot de passe" />
                </Form.Item>
                <Form.Item name="remember" className="aligin-center" valuePropName="checked">
                  <Switch defaultChecked onChange={onChange} />
                  Se souvenir de moi
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    SE CONNECTER
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </div>
      </Card>
    </div>

      
      </Layout>
    </>
  );
};

export default SignIn;
