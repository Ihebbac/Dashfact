/* eslint-disable no-useless-concat */
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Tag,
  Upload,
} from "antd";

import { useForm } from "antd/lib/form/Form";
import React, { useEffect, useState } from "react";
import { notification } from "antd";
import axios from "axios";
import {
  CloudUploadOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";
import { isNil } from "lodash";
import TextArea from "antd/lib/input/TextArea";
const { Option } = Select;

const AddOrUpdateAdmin = (props) => {
  const { visible, onCancel } = props;
  const [Loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const serverURL = "http://127.0.0.1:3000";

  const [form] = useForm();

  useEffect(() => {
    if (props.type === "EDIT") {
      form.setFieldsValue({
        ...props?.record,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        images: [],
      });
    }
  }, [form, props.record, props.visible]);

  const handleonfinish = async (val) => {
    const config = {
      headers: {
        authorization: JSON.parse(localStorage.getItem("token")),
      },
    };

    let user = JSON.parse(localStorage.getItem("user"));
    const values = {
      ...val,
      id: props.record._id,
    };
    console.log("values", values);
    const img = form.getFieldValue("images");
    if (props.type === "EDIT") {
      console.log("edit", values);
      await axios
        .put("http://127.0.0.1:3000/api/v1/users/users/" + values.id, {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          abilities: values.abilities,
        })
        .then((response) => {
          notification.success({ message: "Update Done  " });
          props.refetech();
          onCancel();
        })
        .catch(function (err) {
          props.refetech();
          onCancel();
        });
    } else {
      console.log("from", form.getFieldValue("data"));
      await axios
        .post("http://127.0.0.1:3000/api/v1/users/users", {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          abilities: values.abilities,
        })
        .then((response) => {
          console.log("response", response);
          notification.success({ message: "Admin Crée avec succée " });
          props.refetech();
          onCancel();
        })
        .catch(function (err) {
          props.refetech();
          onCancel();
        });
    }
  };

  return (
    <>
      <Modal
        visible={previewOpen}
        //  title={previewTitle}
        destroyOnClose
        footer={null}
        onCancel={() => setPreviewOpen(!previewOpen) && setPreviewImage("")}
      >
        <img
          alt={previewImage?.name}
          style={{
            width: "100%",
          }}
          src={previewImage}
        />
      </Modal>

      <div className="site-card-border-less-wrapper">
        <Modal
          title={props.type === "EDIT" ? "Modifier" : "Ajouter"}
          visible={visible}
          destroyOnClose
          onOk={() => {
            form.submit();
          }}
          width={1000}
          onCancel={onCancel}
          className="criclebox "
        >
          <Form
            form={form}
            onFinish={handleonfinish}
            preserve={props.type === "EDIT" ? true : false}
          >
            <Card
              centered
              style={{
                width: "100%",
                height: "100%",
              }}
              hoverable
              className="criclebox "
            >
              <Row justify="space-between" gutter={16}>
                <Col span={24}>
                  {Loading ? (
                    <Row justify="center">
                      <Spin />
                    </Row>
                  ) : (
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          name="name"
                          rules={[
                            {
                              required: true,
                              message: "Veuillez entrer le nom d'utilisateur!",
                            },
                          ]}
                        >
                          <Input placeholder="Nom d'utlisiateur" type="name" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="email"
                          rules={[
                            {
                              required: true,
                              message: "Merci de saisir l'Email'!",
                              type: "email",
                            },
                          ]}
                        >
                          <Input placeholder="Email" type="Email" />
                        </Form.Item>
                      </Col>

                      {props.type !== "EDIT" && (
                        <Col span={24}>
                          <Form.Item
                            name="password"
                            rules={[
                              {
                                required: true,
                                message: "Merci de saisir le mot de pass!",
                              },
                            ]}
                          >
                            <Input placeholder="new password" type="text" />
                          </Form.Item>
                        </Col>
                      )}

                      <Col span={24}>
                        <Form.Item
                          name="role"
                          rules={[
                            {
                              required: true,
                              message: "Merci de saisir le role !",
                            },
                          ]}
                        >
                          <Input placeholder="role" type="text" />
                        </Form.Item>
                      </Col>

                      <Col span={24}>
                        <Form.List name="abilities">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <>
                                  <Row>
                                    <Col span={12} style={{ marginRight: 10 }}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, "page"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Missing Page",
                                          },
                                        ]}
                                      >
                                        <Select
                                          placeholder="can"
                                          options={[
                                            {
                                              label: "dashboard",
                                              value: "dashboard",
                                            },
                                            {
                                              label: "categorie",
                                              value: "categorie",
                                            },
                                            {
                                              label: "produit",
                                              value: "produit",
                                            },
                                            {
                                              label: "orders",
                                              value: "orders",
                                            },
                                            {
                                              label: "admins",
                                              value: "admins",
                                            },
                                          ]}
                                        />
                                      </Form.Item>
                                    </Col>

                                    <Col span={12} style={{ marginRight: 10 }}>
                                      <Form.Item
                                        {...restField}
                                        name={[name, "can"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Missing abilities",
                                          },
                                        ]}
                                      >
                                        <Select
                                          placeholder="can"
                                          mode="multiple"
                                          options={[
                                            { label: "create", value: "create" },
                                            { label: "read", value: "read" },
                                            {
                                              label: "delete",
                                              value: "delete",
                                            },
                                            {
                                              label: "edit",
                                              value: "edit",
                                            },
                                          ]}
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col
                                      span={6}
                                      style={{ marginRight: 25, marginTop: 10 }}
                                    >
                                      <MinusCircleOutlined
                                        onClick={() => remove(name)}
                                        style={{
                                          marginLeft: 40,
                                          marginTop: 10,
                                        }}
                                      />
                                    </Col>
                                  </Row>

                                  <hr></hr>
                                </>
                              ))}
                              <Form.Item>
                                <Button
                                  type="dashed"
                                  onClick={() => add()}
                                  block
                                  icon={<PlusOutlined />}
                                >
                                  Ajouter une Option
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            </Card>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default AddOrUpdateAdmin;
