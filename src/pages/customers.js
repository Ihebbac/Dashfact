import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Typography,
  Modal,
  Form,
  Input,
  notification,
  Space,
  Tag,
  Badge,
  Select,
  Avatar,
  message
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  PlusOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import ClientModalAddEdit from "./Modals/ClientModalAddEdit";

const { Title } = Typography;
const { confirm } = Modal;

const Customers = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setRecord] = useState(null);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [refetch]);

  const fetchClients = () => {
    axios
      .get("https://rayhanaboutique.online/clients")
      .then((response) => {
        if (response.data) {
          setSearch("");
          let sortedData = _.sortBy(response.data, (o) => o.nom.toLowerCase());
          setData(sortedData);
          setFilteredData(sortedData);
        } else {
          notification.error({ message: "Aucune donnée trouvée" });
        }
      })
      .catch((error) => {
        notification.error({ message: "Erreur lors du chargement des données" });
      });
  };

  const handleRefetch = () => {
    setRefetch(!refetch);
  };

  const showDeleteConfirm = (clientData) => {
    confirm({
      title: `Voulez-vous vraiment supprimer le client ${clientData.nom}?`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete(`https://rayhanaboutique.online/clients/${clientData._id}`)
          .then(() => {
            message.success("Client supprimé avec succès");
            handleRefetch();
          })
          .catch(() => {
            message.error("Erreur lors de la suppression du client");
          });
      },
    });
  };

  const handleSearch = () => {
    if (!search) {
      setFilteredData(data);
      return;
    }
    
    const results = data.filter(
      (item) =>
        item.nom.toLowerCase().includes(search.toLowerCase()) ||
        (item.telephone && item.telephone.includes(search)) ||
        (item.email && item.email.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredData(results);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilteredData(data);
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {text}
        </Space>
      ),
    },
    {
      title: "Adresse",
      dataIndex: "adresse",
      key: "adresse",
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          {text || "Non renseignée"}
        </Space>
      ),
    },
    {
      title: "Téléphone",
      dataIndex: "telephone",
      key: "telephone",
      render: (text) => (
        <Space>
          <PhoneOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <Space>
          <MailOutlined />
          {text || "Non renseigné"}
        </Space>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text) => (
        <Space>
          <FileTextOutlined />
          {text ? `${text.substring(0, 30)}...` : "Aucune note"}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              setVisible(true);
              setRecord(record);
              setAction("EDIT");
            }}
          >
            <EditTwoTone />
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => showDeleteConfirm(record)}
          >
            <DeleteTwoTone twoToneColor="#FFFFFF" />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox mb-24"
              title="Gestion des Clients"
              extra={
                <div className="d-flex">
                  <Input
                    placeholder="Rechercher par nom, téléphone ou email..."
                    style={{ marginRight: 10, width: 300 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    
                  />
                  
                  <Button
                    type="primary"
                    style={{ marginRight: 10 }}
                    onClick={handleSearch}
                    icon={<SearchOutlined />}
                  >
                    Rechercher
                  </Button>
                  
                  <Button
                    onClick={handleResetFilters}
                  >
                    Réinitialiser
                  </Button>
                  
                  <Button
                    type="primary"
                    style={{ marginLeft: 10 }}
                    onClick={() => {
                      setVisible(true);
                      setRecord(null);
                      setAction("ADD");
                    }}
                    icon={<PlusOutlined />}
                  >
                    Ajouter un Client
                  </Button>
                </div>
              }
            >
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  pagination={{ pageSize: 10 }}
                  className="ant-border-space"
                  rowKey="_id"
                  locale={{
                    emptyText: "Aucun client trouvé"
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
        
        <ClientModalAddEdit
          visible={visible}
          record={record}
          refetch={handleRefetch}
          action={action}
          onCancel={() => setVisible(false)}
        />
      </div>
    </>
  );
};

export default Customers;