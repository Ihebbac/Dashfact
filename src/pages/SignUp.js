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
import React from "react";
import { Layout, Typography, Card, Form, Input, Button, message } from "antd";
import { useHistory } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;
const { Header, Content } = Layout;

const Login = () => {
  const history = useHistory();

  const onFinish = async (values) => {
    try {
      const { email, password } = values;
      const response = await axios.post(
        "https://rayhanaboutique.online/api/auth/login",
        {
          email,
          password,
        }
      );

      const { access_token, user_data } = response.data;

      // Store the token and user data in localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user_data));

      // Show success message
      message.success("Login successful!");

      // Redirect based on user type
      if (user_data.type === "admin") {
        history.push("/dashboard");
      } else {
        history.push("/produit");
      }
    } catch (error) {
      console.error("Login failed", error);
      message.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Please fill in all required fields correctly.");
  };

  return (
    <div className="layout-default ant-layout layout-sign-up">
      <Header>
        <div className="header-col header-brand">
          <h3>Stock360</h3>
        </div>
      </Header>

      <Content className="p-0">
        <div className="sign-up-header">
          <div className="content">
            <Title>Login</Title>
            <p className="text-lg">
              Welcome back! Please enter your credentials to access your
              account.
            </p>
          </div>
        </div>

        <Card
          className="card-signup header-solid h-full ant-card pt-0"
          bordered="false"
        >
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                LOGIN
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </div>
  );
};

export default Login;
