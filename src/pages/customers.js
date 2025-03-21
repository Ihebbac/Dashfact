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
import {
  Row,
  Col,
  Card,
  Radio,
  Table,
  Upload,
  message,
  Progress,
  Button,
  Avatar,
  Typography,
  Modal,
  Form,
  Input,
  notification,
  Descriptions,
  Space,
  Divider,
  Badge,
  Popover,
} from "antd";
import datetime from "moment";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  UsergroupAddOutlined,
  CloseCircleTwoTone,
  PlusCircleTwoTone,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  AppstoreAddOutlined,
  QuestionCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { ToTopOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import React, { Component, useEffect, useRef, useState } from "react";
import axios from "axios";
// Images
import ava1 from "../assets/images/logo-shopify.svg";
import ava2 from "../assets/images/logo-atlassian.svg";
import ava3 from "../assets/images/logo-slack.svg";
import ava5 from "../assets/images/logo-jira.svg";
import ava6 from "../assets/images/logo-invision.svg";
import face from "../assets/images/face-1.jpg";
import face2 from "../assets/images/face-2.jpg";
import face3 from "../assets/images/face-3.jpg";
import face4 from "../assets/images/face-4.jpg";
import face5 from "../assets/images/face-5.jpeg";
import face6 from "../assets/images/face-6.jpeg";
import pencil from "../assets/images/pencil.svg";
import CategorieModalAddEdit from "./Modals/CategorieModalAddEdit.js";
import Text from "antd/lib/typography/Text.js";

const { Title } = Typography;
const { confirm } = Modal;

// table code start
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// project table start

const Customers = () => {
  const onChange = (e) => console.log(`radio checked:${e.target.value}`);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([
    {
      uid: "-1",
      name: "image.png",
      status: "done",
      url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    },
  ]);
  const [Nom, setNom] = useState("");
  const [description, setdescription] = useState("");
  const [ThumbnailImage, setThumbnailImage] = useState("");
  const [data, setData] = useState([]);
  const [refetech, setrefetech] = useState(false);
  const [isload, setisload] = useState(true);
  const [createdAt, setcreatedAt] = useState("");
  const [updatedAt, setupdatedAt] = useState("");
  const [isModalCat, setIsModalCat] = useState(false);

  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [record, setrecord] = useState({});

  const [form] = Form.useForm();
  const handrefetech = () => {
    setrefetech(!refetech);
  };
  const showDetail = (values) => {
    console.log("get by id ", values);
  };
  const show = (dar) => {
    console.log("ihekkkkk", dar);
  };
  const showPromiseConfirm = (alldata, dataDelete) => {
    console.log("d", alldata);
    confirm({
      title: "Vous voulez supprimer le client  " + alldata.fullname + "?",
      icon: (
        <QuestionCircleOutlined
          style={{
            color: "red",
          }}
        />
      ),
      content:
        "lorsque vous appuillez sur ok le client : " +
        alldata.fullname +
        " " +
        " sera supprimer !",

      async onOk() {
        console.log("Success delete ", dataDelete);
        setisload(true);
        await axios
          .delete(`https://www.tnprime.shop:6443/api/v1/customers/${alldata.id}`)
          .then(function (response) {
            handrefetech();
            setisload(false);
          })
          .catch(function (err) {
            console.log(err);
            setisload(false);
          });
        message.success("Client supprimer avec succée..................");
      },
      onCancel() {},
    });
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );
  const content = (
    <div>
      <p><InfoCircleOutlined  />
      Voir détail</p>
      <p> <DeleteOutlined />Supprimer</p>
      
    </div>
  );
  const columns = [
    { title: "Id", dataIndex: "id", key: "id" },
    {
      title: "Nom Complet",
      dataIndex: "fullname",
      key: "fullname",
      ellipsis: true,
    },
    {
      title: "N° Télephone",
      dataIndex: "phone",
      key: "phone",
    },

    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      ellipsis: true,
    },
    {
      title: "Adresse de livraison",
      key: "shippingAddress",
      dataIndex: "shippingAddress",
      ellipsis: true,
    },
    {
      title: "createdAt",
      key: "createdAt",
      dataIndex: "createdAt",
      render: (x) => {
        const dateObject = datetime(x);

        const formattedDate = dateObject.format("DD/MM/YYYY");
        return <time>{formattedDate}</time>;
      },
    },
    {
      title: "updatedAt",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (x) => {
        if (!x) {
          return <Badge className="site-badge-count-109"  style={{
        
          }} status="processing" text="Non modifié" />;
        }
    
        const dateObject = datetime(x);
        const formattedDate = dateObject.format("DD/MM/YYYY");
        return <time>{formattedDate}</time>;
    },
  },
    {
      title: "Action",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <div className="action-buttons">
          <Row>
            <Col span={12}>
              {" "}
              <Button
                onClick={() => {
                  setIsModalOpen(true);
                  setrecord(record);
                  setAction("EDIT");
                }}
              >
                <InfoCircleOutlined />
              </Button>
            </Col>

            <Col span={12}>
              {" "}
              <Button
                type="primary "
                danger
                onClick={() => showPromiseConfirm(record, record.id)}
              >
                <DeleteTwoTone twoToneColor="#FFFFFF" />
              </Button>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  useEffect(() => {
    axios.get("https://www.tnprime.shop:6443/api/v1/customers").then((response) => {
      console.log("response", response);
      if (response.data.data) {
        setData(response.data.data);
        setisload(false);
      } else {
        notification.error({ message: "No Data Found" });
        setisload(false);
      }
    });
  }, [refetech]);
  const onFinish = async (values) => {
    setisload(true);
    console.log("valuesssssss", values);
    // const res = await axios
    // .post(`https://www.tnprime.shop:6443/api/v1/categories/${values}`)
    // .then(function (response) {
    //   // handrefetech();
    //   setisload(false);
    // })
    // .catch(function (err) {
    //   console.log(err);
    //   setisload(false);
    // });

    // console.log("data received:", res);
    form.resetFields();
  };
  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              loading={isload}
              className="criclebox tablespace mb-24"
              title="Liste des Clients"
              extra={
                <>
                 <Popover content={content} title="Vous avez le droit que à :"> <Button
                    type="primary"
                    disabled
                    onClick={() => {
                      setVisible(true);
                      setrecord({});
                      setAction("ADD");
                    }}
                  >
                    Ajouter un Client
                  </Button></Popover>
                 
                </>
              }
            >
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={data}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>
        <CategorieModalAddEdit
          visible={visible}
          record={action === "EDIT" ? record : {}}
          refetech={handrefetech}
          type={action}
          onCancel={() => setVisible(false)}
        />
        <Modal
          title="Information sur le client"
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={false}
        >
          <Space  direction="vertical"
    // size="middle"
    style={{
      display: 'flex',
    }}
    >
          
            {" "}
            <Descriptions bordered >
           
              <Descriptions.Item label="Nom & prénom:" span={3}>
                {" "}
                <Avatar
      style={{
        backgroundColor: '#87d068',
      }}
      icon={<UserOutlined />}
    />
                <Text keyboard>{record.fullname}</Text>
              </Descriptions.Item >
              <Descriptions.Item label="N° Téléphone:" span={3}>
              {record.phone ? record.phone : <Badge
        className="site-badge-count-109"
        count='non renseigné'
        style={{
          backgroundColor: '#f5222d',
        }}
      />}
              </Descriptions.Item>
              
              <Descriptions.Item label="Adresse:" span={3}>
              {record.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Status:" span={3}>
      <Badge status="processing" text="en attente" />
    </Descriptions.Item>
             
            </Descriptions>
          </Space>
        </Modal>
      </div>
    </>
  );
};

export default Customers;
