/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-computed-key */
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
    Space,
    Spin,
    Tag,
    Upload,
    Image,
  } from "antd";
  import { useForm } from "antd/lib/form/Form";
  import React, { useEffect, useState } from "react";
  import { notification } from "antd";
  import axios from "axios";
  import {
    MinusCircleOutlined,
    PlusOutlined,
    VerticalAlignTopOutlined,
  } from "@ant-design/icons";
  import { isNil, isEmpty, uniq } from "lodash";
  import TextArea from "antd/lib/input/TextArea";
  import { SwatchesPicker } from "react-color";
  
  const ProduitModalAddEditWithoutexcel = (props) => {
    const { visible, onCancel } = props;
    const [Loading, setLoading] = useState(false);
    const [cat, setcat] = useState([]);
    const [collection, setcollection] = useState([]);
    const [collectionId, setcollectionId] = useState(1);
    const [images, setimages] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const serverURL = "https://www.tnprime.shop:6443";
  
    const [form] = useForm();
  
    useEffect(() => {
      axios
        .get("https://www.tnprime.shop:6443/api/v1/categories")
        .then((response) => {
          console.log("response", response);
          if (response.data.data) {
            setcat(response.data.data);
          } else {
            notification.error({ message: "No Data Found" });
          }
        });
  
      axios
        .get("https://www.tnprime.shop:6443/api/v1/collection")
        .then((response) => {
          console.log("response", response);
          if (response.data.data) {
            setcollection(response.data.data);
          } else {
            notification.error({ message: "No Data Found" });
          }
        });
  
      if (props.type === "EDIT") {
        form.setFieldsValue({
          categoryId: props?.record.categoryId,
          collectionId: props?.record.collectionId,
          description: props?.record.description,
          detail: props?.record.detail,
          name: props?.record.name,
          createdAt: props?.record.createdAt,
          updatedAt: props?.record.createdAt,
          options: props?.record.option.map((el) => ({
            ...el,
            colors: ["eeeee"],
            images: el?.images?.split(","),
            sizes: ["iphone"],
            stock: el?.stock,
            price: el?.price,
            discount: Number(el?.discount),
            id: el.id,
          })),
        });
  
        let list = [];
        props?.record.option.forEach((el) => {
          list = [
            ...list,
            isEmpty(el?.images?.split(",")) ? [] : el?.images?.split(","),
          ];
        });
  
        console.log("list", list);
        setimages(list);
      } else {
        form.setFieldsValue({});
        form.resetFields();
        setimages([]);
      }
    }, [form, props.record, props.visibl]);
  
    const handlePreview = async (file) => {
      setPreviewImage(file.url || file.preview);
      setPreviewOpen(true);
    };
  
    const handleChange = async (info, key) => {
      const oldimges = [...images];
  
      setLoading(true);
      try {
        const listOfPromise = [];
        info?.fileList?.forEach((el) => {
          if (!isNil(el?.originFileObj?.name)) {
            var bodyFormData = new FormData();
  
            bodyFormData.append("images", el?.originFileObj);
  
            if (!oldimges[key]) {
              oldimges[key] = [];
            }
  
            const Listimages = oldimges[key];
  
            Listimages.push(
              "https://www.tnprime.shop:6443" + "/images/" + el?.name
            );
            setimages(oldimges);
  
            const col = collectionId == 1 ? "/api/upload" : "/api/upload/insta";
  
            console.log("eeeeeeeeeeeeeeeeeeeee dddddddddddd", collectionId);
  
            listOfPromise.push(
              axios({
                method: "post",
                url: "https://www.tnprime.shop:6443" + col,
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
      const option = values?.options?.map((el, key) => ({
        ...el,
        images: images[key].join(","),
        sizes: "iphone",
        price: Number(el.price),
        discount: Number(el.discount ?? 0),
        stock: Number(el.stock),
        color: "eeeee",
        id: el?.id,
      }));
      if (props.type === "EDIT") {
        await axios
          .put("https://www.tnprime.shop:6443/api/v1/products/" + values.id, {
            name: values.name,
            description: values.description,
            detail: values.detail,
            categoryId: values.categoryId,
            collectionId: values.collectionId,
            option: option,
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
        await axios
          .post("https://www.tnprime.shop:6443/api/v1/products", {
            name: values.name,
            description: values.description,
            detail: values.detail,
            categoryId: values.categoryId,
            collectionId: values.collectionId,
            option: option,
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
  
    return (
      <Form
        form={form}
        onFinish={handleonfinish}
        preserve={props.type === "EDIT" ? true : false}
      >
        <div className="site-card-border-less-wrapper">
          <Modal
            title={props.type === "EDIT" ? "UPDATE" : "CREATE sssssss"}
            visible={visible}
            destroyOnClose
            onOk={() => {
              form.submit();
            }}
            width={1000}
            onCancel={onCancel}
          >
            <Card
              centered
              style={{
                width: "100%",
                height: "100%",
              }}
            >
             
            </Card>
          </Modal>
        </div>
      </Form>
    );
  };
  
  export default ProduitModalAddEditWithoutexcel;
  