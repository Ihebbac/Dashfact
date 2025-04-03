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
import { CloudUploadOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import { isNil } from "lodash";
import TextArea from "antd/lib/input/TextArea";
const { Option } = Select;

const AddOrUpdateModalCars = (props) => {
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
        images: [props?.record.thumbnailImage],
      });
    } else {
      form.resetFields()
      form.setFieldsValue({
        images: [],
      });
    }
  }, [form, props.record, props.visible]);

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const handleChange = async (info, listfilesuploaded) => {
    setLoading(true);
    try {
      const listOfPromise = [];
      info?.fileList?.forEach((el) => {
        if (
          !isNil(el?.originFileObj?.name) &&
          !listfilesuploaded?.find(
            (val) =>
              val ===
              "http://127.0.0.1:3000" + "/images/" + el?.originFileObj?.name
          )
        ) {
          console.log("eeeeeeeeee");
          var bodyFormData = new FormData();

          bodyFormData.append("images", el.originFileObj);
          form.setFieldsValue({
            images: [
              ...form.getFieldValue("images"),
              "http://127.0.0.1:3000" + "/images/" + el?.originFileObj.name,
            ],
          });
          listOfPromise.push(
            axios({
              method: "post",
              url: "http://127.0.0.1:3000" + "/api/upload",
              data: bodyFormData,
              headers: { "Content-Type": "multipart/form-data" },
            })
          );
        }
      });
      await Promise.all(listOfPromise);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleonfinish = async (val) => {
    const config = {
      headers: {
        authorization: JSON.parse(localStorage.getItem("token")),
      },
    };

    let user = JSON.parse(localStorage.getItem("user"));
    const values = {
      ...val,
      id: props.record.id,
    };

    const img = form.getFieldValue("images");
    if (props.type === "EDIT") {
      await axios
        .put("http://127.0.0.1:3000/api/v1/categories/" + values.id, {
          name: values?.name,
          description: values?.description,
          thumbnailImage: img[0],
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
        .post("http://127.0.0.1:3000/api/v1/categories", {
          name: values?.name,
          description: values?.description,
          thumbnailImage: img[0],
        })
        .then((response) => {
          notification.success({ message: "Create Done  " });
          props.refetech();
          onCancel();
        })
        .catch(function (err) {
          props.refetech();
          onCancel();
        });
    }
  };
  const handlePreview = async (file) => {
    console.log("file",file)
    // if (!file.url && !file.preview) {
    //   file.preview = await getBase64(file.originFileObj);
    // }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    // setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };
  return (
    <>
    <Modal visible={previewOpen}
    //  title={previewTitle} 
    destroyOnClose
     footer={null} 
     onCancel={() => setPreviewOpen(!previewOpen)
      && setPreviewImage("")
     }
     >
    <img
      alt={previewImage?.name}
      style={{
        width: '100%',
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
          >
            <Row justify="space-between" gutter={16}>
              <Col span={24}>
                {Loading ? (
                  <Row justify="center">
                    <Spin />
                  </Row>
                ) : (
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      return (
                        <Form.Item name="image">
                          <Upload
                            name="slideimg"
                            className="avatar-uploader projects-uploader"
                            onChange={(val) =>
                              handleChange(val, getFieldValue("images"))
                            }
                            onRemove={(val) => {
                              form.setFieldsValue({
                                images: [
                                  ...form
                                    .getFieldValue("images")
                                    .filter((el) => el !== val.name),
                                ],
                              });
                            }}
                            onDrop={(val) =>
                              handleChange(val, getFieldValue("images"))
                            }
                            listType="picture-card"
                            fileList={
                              !isNil(getFieldValue("images"))
                                ? getFieldValue("images")?.map((el, i) => ({
                                    uid: -i,
                                    name: el,
                                    status: "done",
                                    url: el,
                                  }))
                                : []
                            }
                            onPreview={handlePreview}
                            multiple
                          >
                            <Button
                              icon={
                                <CloudUploadOutlined  style={{ width: 20, height : 19, color: "#000" }}/>
                               
                              }
                            >
                              Importer des images
                            </Button>
                          </Upload>
                        </Form.Item>
                      );
                    }}
                  </Form.Item>
                )}
              </Col>
              </Row>
              </Card>
              <Card
            centered
            style={{
              width: "100%",
              height: "100%",
            }}
            hoverable
          > <Col span={24}>
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Veuillez entrer le nom!",
              },
            ]}
          >
            <Input placeholder="Nom de la catégorie" type="name" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="description"
            rules={[
              {
                required: true,
                message: "Merci de saisir la description!",
              },
            ]}
          >
            <TextArea placeholder="Déscription" type="textarea" />
          </Form.Item>
        </Col></Card>
             
        </Form>
        </Modal>
      </div>
   
    
  </>
  );
};

export default AddOrUpdateModalCars;
