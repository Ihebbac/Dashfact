/* eslint-disable array-callback-return */
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
  Image,
  Space,
  Tag,
  Carousel,
  Badge,
  Select,
} from "antd";
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
  SearchOutlined,
} from "@ant-design/icons";
import { ToTopOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import React, { Component, useEffect, useRef, useState } from "react";

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
import ProduitModalAddEdit from "./Modals/ProduitModalAddEdit";
import axios from "axios";
import { CirclePicker } from "react-color";
import datetime from "moment";
import _ from "lodash";
import ProduitModalAddEditWithoutexcel from "./Modals/ProduitModalAddEditWithoutexcel";
const { Title } = Typography;
const { confirm } = Modal;
const formProps = {
  name: "file",
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};
// table code start
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const Produit = () => {
  const onChange = (e) => console.log(`radio checked:${e.target.value}`);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [optionColor, setoptionColor] = useState("");
  const [fileList, setFileList] = useState([
    // {
    //   uid: '-1',
    //   name: 'image.png',
    //   status: 'done',
    //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    // },
  ]);
  const [Nom, setNom] = useState("");
  const [description, setdescription] = useState("");
  const [ThumbnailImage, setThumbnailImage] = useState("");

  const [createdAt, setcreatedAt] = useState("");
  const [updatedAt, setupdatedAt] = useState("");
  const [isModalCat, setIsModalCat] = useState(false);
  const [data, setData] = useState([]);
  const [filterData, setfilterData] = useState([]);

  const [visible, setVisible] = useState(false);
  const [visiblewithoutexcel, setVisiblewithoutexcel] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setrecord] = useState(null);
  const [recordOption, setrecordOption] = useState(null);
  const [refetech, setrefetech] = useState(false);
  const [show, setshow] = useState(false);

  const abilities = JSON.parse(localStorage.getItem("user"))?.abilities?.find(
    (el) => el.page === "produit"
  )?.can;

  useEffect(() => {
    axios
      .get("http://127.0.0.1:3000/api/v1/products")
      .then((response) => {
        if (response.data.data) {
          setSearch("");
          setfilterData([]);
          let sorted_obj = _.sortBy(response.data.data, function (o) {
            return Number(o.id);
          });
          setData(sorted_obj);
        } else {
          notification.error({ message: "No Data Found" });
        }
      });
  }, [refetech]);

  const handrefetech = () => {
    setrefetech(!refetech);
  };

  const showPromiseConfirm = (alldata, dataDelete) => {
    confirm({
      title: "Vous voulez supprimer " + alldata.name + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete("http://127.0.0.1:3000/api/v1/products/" + dataDelete)
          .then((response) => {
            message.success("Produit supprimer avec success.");
            handrefetech();
          });
      },
      onCancel() {},
    });
  };
  const showModalCat = () => {
    setIsModalCat(true);
  };

  console.log("record", data);

  const columns = [
    {
      title: "Id du produit",
      dataIndex: "id",
      key: "id",
    },

    {
      title: "image",
      render: (text) => (
        <img src={text.option[0].images.split(",")[0]} width={80} />
      ),
    },

    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
    },

    // {
    //   title: "Déscription",
    //   key: "description",
    //   dataIndex: "description",
    //   with: 100,
    //   ellipsis: true,
    //   // render: (text) => <div className="text-truncate">{text}</div>,
    // },

    // {
    //   title: "createdAt",
    //   key: "createdAt",
    //   dataIndex: "createdAt",
    //   render: (x) => {
    //     const dateObject = datetime(x);

    //     const formattedDate = dateObject.format("DD/MM/YYYY");
    //     return <time>{formattedDate}</time>;
    //   },
    // },
    {
      title: "updatedAt",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (x) => {
        if (!x) {
          return (
            <Badge
              className="site-badge-count-109"
              style={{}}
              status="processing"
              text="Non modifié"
            />
          );
        }

        const dateObject = datetime(x);
        const formattedDate = dateObject.format("DD/MM/YYYY");
        return <time>{formattedDate}</time>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Row>
            {abilities.includes("edit") && (
              <Col span={8} className="ms-2">
                {" "}
                <Button
                  onClick={() => {
                    setVisible(true);
                    setrecord(record);
                    setAction("EDIT");
                  }}
                >
                  <EditTwoTone />
                </Button>
              </Col>
            )}

            {abilities.includes("read") && (
              <Col span={8} className="ms-2">
                {" "}
                <Button
                  onClick={() => {
                    setshow(true);
                    setrecord(record);
                    setrecordOption(record?.option);
                    setoptionColor(record?.option[0].color);
                  }}
                >
                  <InfoCircleOutlined />
                </Button>
              </Col>
            )}

            {abilities.includes("delete") && (
              <Col span={8}>
                {" "}
                <Button
                  type="primary"
                  danger
                  onClick={() => showPromiseConfirm(record, record.id)}
                >
                  <DeleteTwoTone twoToneColor="#FFFFFF" />
                </Button>
              </Col>
            )}
          </Row>
        </div>
      ),
    },
  ];

  const handelrecherche = () => {
    axios
      .get("http://127.0.0.1:3000/api/v1/products/search?q=" + search)
      .then((response) => {
        console.log("response", response);
        if (response.data.data) {
          setData(response.data.data);
        } else {
          notification.error({ message: "No Data Found" });
        }
      });
  };

  return (
    <>
      <h1>Produit</h1>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title="Liste des produits"
              extra={
                <div className="d-flex ">
                  <Select
                    style={{ marginRight: 25 }}
                    onChange={(value) => {
                      setSearch(value);
                      setfilterData(
                        data.filter((el) => el?.collectionId === Number(value))
                      );
                    }}
                    value={search}
                  >
                    <Select.Option value="1">MOKAP PRODUCT</Select.Option>
                    <Select.Option value="2"> IG PRODUCT</Select.Option>
                    <Select.Option value=""> ALL PRODUCT</Select.Option>
                  </Select>

                  <Input
                    style={{ marginRight: 25 }}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />

                  <Button
                    style={{ marginRight: 25 }}
                    onClick={() => {
                      handelrecherche();
                    }}
                  >
                    {" "}
                    Rechercher
                  </Button>

                  {abilities.includes("create") && (
                    <Button
                      type="primary"
                      onClick={() => {
                        setVisiblewithoutexcel(true);
                        setrecord({});
                        setAction("ADD");
                      }}
                    >
                      Ajouter un produit
                    </Button>
                  )}
                  {abilities.includes("create") && (
                    <Button
                      type="primary"
                      onClick={() => {
                        setVisible(true);
                        setrecord({});
                        setAction("ADD");
                      }}
                    >
                      Importer depuis Excel
                    </Button>
                  )}
                </div>
              }
            >
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={!search.length > 0 ? data : filterData}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>
        <ProduitModalAddEdit
          visible={visible}
          record={action === "EDIT" ? record : {}}
          refetech={handrefetech}
          type={action}
          onCancel={() => setVisible(false)}
        />
        <ProduitModalAddEditWithoutexcel
          visible={visiblewithoutexcel}
          record={action === "EDIT" ? record : {}}
          refetech={handrefetech}
          type={action}
          onCancel={() => setVisiblewithoutexcel(false)}
        />

        <Modal
          visible={show}
          destroyOnClose
          width={1000}
          onCancel={() => setshow(false)}
          footer={false}
        >
          {record && (
            <Badge.Ribbon
              style={{ marginTop: 15 }}
              color="red"
              text={`       ${
                recordOption &&
                (recordOption.filter((el) => el.color === optionColor)[0]
                  ?.discount ??
                  0)
              } % 
                   `}
            >
              <Card>
                <Row>
                  <Col span={12}>
                    <div className="ant-row-flex ant-row-flex-center">
                      {/* <Image
                     src={
                       record &&
                       recordOption
                         .filter((el) => el.color === optionColor)[0]
                         ?.images?.split(",")[0]
                     }
                     width={300}
                   /> */}

                      <Carousel autoplay>
                        {record &&
                          recordOption
                            ?.filter((el) => el.color === optionColor)[0]
                            ?.images?.split(",")
                            ?.map((el) => {
                              return <Image src={el} width={"90%"} />;
                            })}
                      </Carousel>
                    </div>
                  </Col>

                  <Col span={12} style={{ padding: 15 }}>
                    <h1> {record && record?.name} </h1>

                    <p>{record && record?.description} </p>
                    <hr />
                    <p>{record && record?.detail} </p>
                    <hr />

                    <Row style={{ marginTop: 20 }}>
                      <CirclePicker
                        colors={record?.option?.map((el) => el.color)}
                        color={optionColor}
                        onChangeComplete={(val) => {
                          setoptionColor(val.hex);
                        }}
                      />
                    </Row>

                    <Row style={{ marginTop: 20 }}>
                      {recordOption &&
                        recordOption
                          ?.filter((el) => el.color === optionColor)[0]
                          ?.size?.split(",")
                          ?.map((elm) => <Tag>{elm}</Tag>)}
                    </Row>

                    <Row style={{ marginTop: 20 }}>
                      <strong>
                        <h2>
                          {" "}
                          {recordOption &&
                            recordOption?.filter(
                              (el) => el.color === optionColor
                            )[0]?.price}
                          {" € "}
                        </h2>
                      </strong>
                    </Row>
                  </Col>
                </Row>
              </Card>
            </Badge.Ribbon>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Produit;
