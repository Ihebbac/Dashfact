import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Typography,
  Modal,
  Input,
  notification,
  Space,
  Tag,
  Avatar
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import MagasinModalAddEdit from "./Modals/MagasinModalAddEdit";

const { Text } = Typography;
const { confirm } = Modal;

const Magasin = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setRecord] = useState(null);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    fetchMagasins();
  }, [refetch]);

  const fetchMagasins = () => {
    axios.get("https://rayhanaboutique.online/magasins")
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
        notification.error({ message: "Erreur lors du chargement des magasins" });
      });
  };

  const handleRefetch = () => {
    setRefetch(!refetch);
  };

  const showDeleteConfirm = (magasinData) => {
    confirm({
      title: `Voulez-vous vraiment supprimer le magasin ${magasinData.nom}?`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios.delete(`https://rayhanaboutique.online/magasins/${magasinData._id}`)
          .then(() => {
            notification.success({ message: "Magasin supprimé avec succès" });
            handleRefetch();
          })
          .catch(() => {
            notification.error({ message: "Erreur lors de la suppression du magasin" });
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
        (item.responsable && item.responsable.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredData(results);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilteredData(data);
  };

  const columns = [
    {
      title: "Nom du Magasin",
      dataIndex: "nom",
      key: "nom",
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Responsable",
      dataIndex: "responsable",
      key: "responsable",
      render: (text) => (
        <Tag color="blue">{text || "Non spécifié"}</Tag>
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
              title="Gestion des Magasins"
              extra={
                <div className="d-flex">
                  <Input
                    placeholder="Rechercher par nom ou responsable..."
                    style={{ marginRight: 10, width: 250 }}
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
                    style={{ marginRight: 10 }}
                  >
                    Réinitialiser
                  </Button>
                  
                  <Button
                    type="primary"
                    onClick={() => {
                      setVisible(true);
                      setRecord(null);
                      setAction("ADD");
                    }}
                    icon={<PlusOutlined />}
                  >
                    Ajouter un Magasin
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
                    emptyText: "Aucun magasin trouvé"
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
        
        <MagasinModalAddEdit
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

export default Magasin;