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
  DatePicker,
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

import axios from "axios";
import { CirclePicker } from "react-color";
import datetime from "moment";
import _ from "lodash";
import CheckModalAddEdit from "./Modals/CheckModalAddEdit";
const { Title } = Typography;
const { confirm } = Modal;
const { RangePicker } = DatePicker;

const Check = () => {
  const onChange = (e) => console.log(`radio checked:${e.target.value}`);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState([]);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setRecord] = useState(null);
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    axios
      .get("https://rayhanaboutique.online/checks")
      .then((response) => {
        if (response.data) {
          setSearch("");
          setFilteredData([]);
          let sortedData = _.sortBy(response.data, (o) => {
            return new Date(o.dateDepotCheck);
          }).reverse();
          setData(sortedData);
          setFilteredData(sortedData);
        } else {
          notification.error({ message: "Aucune donnée trouvée" });
        }
      })
      .catch((error) => {
        notification.error({ message: "Erreur lors du chargement des données" });
      });
  }, [refetch]);

  const handleRefetch = () => {
    setRefetch(!refetch);
  };

  const showDeleteConfirm = (checkData) => {
    confirm({
      title: `Voulez-vous vraiment supprimer le chèque ${checkData.numCheck}?`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete(`https://rayhanaboutique.online/checks/${checkData._id}`)
          .then((response) => {
            message.success("Chèque supprimé avec succès");
            handleRefetch();
          })
          .catch((error) => {
            message.error("Erreur lors de la suppression du chèque");
          });
      },
      onCancel() {},
    });
  };

  const handleSearch = () => {
    let results = data;
    
    if (search) {
      results = results.filter(
        (item) =>
          item.numCheck.toLowerCase().includes(search.toLowerCase()) ||
          item.nom.toLowerCase().includes(search.toLowerCase()) ||
          item.nomPersonne.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      results = results.filter((item) => item.status === statusFilter);
    }

    if (dateRange && dateRange.length === 2) {
      results = results.filter((item) => {
        const checkDate = new Date(item.dateDepotCheck);
        return (
          checkDate >= new Date(dateRange[0]) && 
          checkDate <= new Date(dateRange[1])
        );
      });
    }

    setFilteredData(results);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateRange([]);
    setFilteredData(data);
  };

  const columns = [
    {
      title: "Numéro de chèque",
      dataIndex: "numCheck",
      key: "numCheck",
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
    },
    {
      title: "Nom de la personne",
      dataIndex: "nomPersonne",
      key: "nomPersonne",
    },
    {
      title: "Date du chèque",
      dataIndex: "dateCheck",
      key: "dateCheck",
      render: (date) => datetime(date).format("DD/MM/YYYY"),
    },
    {
      title: "Date de dépôt",
      dataIndex: "dateDepotCheck",
      key: "dateDepotCheck",
      render: (date) => datetime(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.dateDepotCheck) - new Date(b.dateDepotCheck),
    },
    {
      title: "Montant entrant (TND)",
      dataIndex: "montant_in",
      key: "montant_in",
      render: (amount) => amount.toFixed(2),
    },
    {
      title: "Montant sortant (TND)",
      dataIndex: "montant_ou",
      key: "montant_ou",
      render: (amount) => amount.toFixed(2),
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === 'validé' ? 'green' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Validé', value: 'validé' },
        { text: 'Rejeté', value: 'rejeté' },
      ],
      onFilter: (value, record) => record.status === value,
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
              title="Gestion des chèques"
              extra={
                <div className="d-flex">
                  <Input
                    placeholder="Rechercher..."
                    style={{ marginRight: 10, width: 200 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                  />
                  
                  <Select
                    placeholder="Filtrer par statut"
                    style={{ marginRight: 10, width: 150 }}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    allowClear
                  >
                    <Select.Option value="validé">Validé</Select.Option>
                    <Select.Option value="rejeté">Rejeté</Select.Option>
                  </Select>
                  
                  <RangePicker
                    style={{ marginRight: 10 }}
                    onChange={(dates) => setDateRange(dates)}
                    value={dateRange}
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
                    Ajouter un chèque
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
                />
              </div>
            </Card>
          </Col>
        </Row>
        
        <CheckModalAddEdit
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

export default Check;