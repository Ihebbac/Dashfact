import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Typography,
  Modal,
  Space,
  Descriptions,
  Avatar,
  Badge,
  notification,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AddOrUpdateAdmin from "./Modals/AdminModalAddEdit.js";

const { Text } = Typography;
const { confirm } = Modal;

const Admins = () => {
  const [data, setData] = useState([]);
  const [refetech, setrefetech] = useState(false);
  const [isload, setisload] = useState(true);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [record, setrecord] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handrefetech = () => {
    setrefetech(!refetech);
  };

  const showPromiseConfirm = (alldata, dataDelete) => {
    confirm({
      title: "Voulez-vous supprimer l'utilisateur " + alldata.username + " ?",
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        setisload(true);
        await axios
          .delete(`https://rayhanaboutique.online/users/${alldata._id}`)
          .then(function (response) {
            handrefetech();
            setisload(false);
            notification.success({
              message: "Utilisateur supprimé avec succès",
            });
          })
          .catch(function (err) {
            console.log(err);
            setisload(false);
            notification.error({
              message: "Erreur lors de la suppression",
            });
          });
      },
      onCancel() {},
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => <Text ellipsis>{id}</Text>,
    },
    {
      title: "Nom d'utilisateur",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Badge status={type === "admin" ? "success" : "default"} text={type} />
      ),
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "error"}
          text={status}
        />
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              setVisible(true);
              setrecord(record);
              setAction("EDIT");
            }}
          >
            <EditTwoTone />
          </Button>

          <Button
            onClick={() => {
              setIsModalOpen(true);
              setrecord(record);
            }}
          >
            <InfoCircleOutlined />
          </Button>

          <Button danger onClick={() => showPromiseConfirm(record, record._id)}>
            <DeleteTwoTone twoToneColor="#FFFFFF" />
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setisload(true);
    axios
      .get("https://rayhanaboutique.online/api/user")
      .then((response) => {
        if (response.data) {
          setData(response.data);
        } else {
          notification.error({ message: "Aucune donnée trouvée" });
        }
      })
      .catch((error) => {
        notification.error({ message: "Erreur de chargement des données" });
      })
      .finally(() => {
        setisload(false);
      });
  }, [refetech]);

  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              loading={isload}
              className="criclebox tablespace mb-24"
              title="Gestion des utilisateurs"
              extra={
                <Button
                  type="primary"
                  onClick={() => {
                    setVisible(true);
                    setrecord({});
                    setAction("ADD");
                  }}
                >
                  Ajouter un utilisateur
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 10 }}
                rowKey="_id"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>

        <AddOrUpdateAdmin
          visible={visible}
          record={action === "EDIT" ? record : {}}
          refetech={handrefetech}
          type={action}
          onCancel={() => setVisible(false)}
        />

        <Modal
          title="Détails de l'utilisateur"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Nom d'utilisateur">
              <Space>
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  icon={<UserOutlined />}
                />
                <Text strong>{record?.username || "Non spécifié"}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {record?.email || <Badge status="error" text="Non spécifié" />}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Badge
                status={record?.type === "admin" ? "success" : "default"}
                text={record?.type || "user"}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Badge
                status={record?.status === "active" ? "success" : "error"}
                text={record?.status || "inactive"}
              />
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      </div>
    </>
  );
};

export default Admins;
