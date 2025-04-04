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
  Badge,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  Space,
  message,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import dayjs from "dayjs";
import InvoiceModalAddEdit from "./Modals/InvoiceModalAddEdit";

const { confirm } = Modal;
const { Option } = Select;
const { Text } = Typography;

const Invoice = () => {
  const [data, setData] = useState([]);
  const [filterData, setfilterData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setrecord] = useState(null);
  const [refetech, setrefetech] = useState(false);
  const [show, setshow] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStore] = useState([]);
  const [form] = Form.useForm();

  const abilities = JSON.parse(localStorage.getItem("user"))?.abilities?.find(
    (el) => el.page === "invoice"
  )?.can;

  useEffect(() => {
    fetchData();
    fetchStore();
    fetchCustomers();
    fetchProducts();
  }, [refetech]);

  const fetchData = () => {
    axios.get("http://127.0.0.1:3000/invoice").then((response) => {
      if (response.data) {
        setSearch("");
        setfilterData([]);
        let sorted_obj = _.sortBy(response.data, function (o) {
          return Number(o._id);
        });
        setData(sorted_obj);
      } else {
        notification.error({ message: "No Data Found" });
      }
    });
  };

  const fetchCustomers = () => {
    axios.get("http://127.0.0.1:3000/clients").then((response) => {
      setCustomers(response.data);
    });
  };

  const fetchStore = () => {
    axios.get("http://127.0.0.1:3000/magasins").then((response) => {
      setStore(response.data);
    });
  };

  const fetchProducts = () => {
    axios.get("http://127.0.0.1:3000/stock").then((response) => {
      setProducts(response.data);
    });
  };

  const handrefetech = () => {
    setrefetech(!refetech);
  };

  const showPromiseConfirm = (alldata, dataDelete) => {
    confirm({
      title: "Voulez-vous supprimer la facture " + alldata.invoiceNumber + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete("http://127.0.0.1:3000/invoice/" + dataDelete)
          .then((response) => {
            message.success("Facture supprimée avec succès.");
            handrefetech();
          });
      },
      onCancel() {},
    });
  };

  const columns = [
    {
      title: "Numéro de facture",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Client",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `${total.toFixed(2)} €`,
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "paid") color = "green";
        if (status === "unpaid") color = "red";
        if (status === "partially_paid") color = "orange";
        return <Badge color={color} text={status} />;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Row>
            <Col span={8} className="ms-2">
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
            <Col span={8} className="ms-2">
              <Button
                onClick={() => {
                  setshow(true);
                  setrecord(record);
                }}
              >
                <InfoCircleOutlined />
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type="primary"
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

  const handleSearch = () => {
    if (!search) {
      fetchData();
      return;
    }

    const filtered = data.filter(
      (item) =>
        item.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase())
    );
    setfilterData(filtered);
  };

  return (
    <>
      <h1>Factures</h1>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title="Liste des factures"
              extra={
                <div className="d-flex">
                  <Input
                    placeholder="Rechercher par numéro ou client"
                    style={{ marginRight: 25, width: 200 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    suffix={<SearchOutlined onClick={handleSearch} />}
                  />

                  <Button
                    type="primary"
                    onClick={() => {
                      setVisible(true);
                      setrecord({});
                      setAction("ADD");
                    }}
                  >
                    Créer une facture
                  </Button>
                </div>
              }
            >
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={filterData.length > 0 ? filterData : data}
                  pagination={true}
                  className="ant-border-space"
                />
              </div>
            </Card>
          </Col>
        </Row>

        <InvoiceModalAddEdit
          visible={visible}
          record={action === "EDIT" ? record : {}}
          refetech={handrefetech}
          type={action}
          customers={customers}
          products={products}
          stores={stores}
          onCancel={() => setVisible(false)}
        />

        {/* <Modal
          visible={show}
          destroyOnClose
          width={1000}
          onCancel={() => setshow(false)}
          footer={false}
          title={`Détails de la facture ${record?.invoiceNumber}`}
        >
          {record && (
            <Card>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col>
                      <Text strong>Date: </Text>
                      <Text>{dayjs(record.date).format("DD/MM/YYYY")}</Text>
                    </Col>
                    <Col>
                      <Badge 
                        status={record.status === "paid" ? "success" : 
                               record.status === "unpaid" ? "error" : "warning"} 
                        text={record.status}
                      />
                    </Col>
                  </Row>
                </Col>
                
                <Col span={24}>
                  <Divider orientation="left">Information client</Divider>
                  <Row gutter={[16, 8]}>
                    <Col span={8}>
                      <Text strong>Nom: </Text>
                      <Text>{record.customerName}</Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>Téléphone: </Text>
                      <Text>{record.customerPhone}</Text>
                    </Col>
                    <Col span={24}>
                      <Text strong>Adresse: </Text>
                      <Text>{record.customerAddress}</Text>
                    </Col>
                  </Row>
                </Col>
                
                <Col span={24}>
                  <Divider orientation="left">Articles</Divider>
                  <Table
                    columns={[
                      { title: "Référence", dataIndex: "reference", key: "reference" },
                      { title: "Nom", dataIndex: "nom", key: "nom" },
                      { title: "Taille", dataIndex: "taille", key: "taille" },
                      { title: "Quantité", dataIndex: "quantity", key: "quantity" },
                      { title: "Prix unitaire", dataIndex: "prixVente", key: "prixVente", render: (val) => `${val.toFixed(2)} €` },
                      { title: "Total", key: "total", render: (_, item) => `${(item.quantity * item.prixVente).toFixed(2)} €` },
                    ]}
                    dataSource={record.items}
                    pagination={false}
                    rowKey="stockId"
                  />
                </Col>
                
                <Col span={24}>
                  <Divider orientation="left">Total</Divider>
                  <Row justify="end" gutter={[16, 8]}>
                    <Col span={6}>
                      <Text strong>Sous-total: </Text>
                    </Col>
                    <Col span={6}>
                      <Text>{record.subtotal.toFixed(2)} €</Text>
                    </Col>
                    <Col span={6}>
                      <Text strong>Taxe: </Text>
                    </Col>
                    <Col span={6}>
                      <Text>{record.tax.toFixed(2)} €</Text>
                    </Col>
                    <Col span={6}>
                      <Text strong>Total: </Text>
                    </Col>
                    <Col span={6}>
                      <Text>{record.total.toFixed(2)} €</Text>
                    </Col>
                  </Row>
                </Col>
                
                {record.notes && (
                  <Col span={24}>
                    <Divider orientation="left">Notes</Divider>
                    <Text>{record.notes}</Text>
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </Modal> */}
      </div>
    </>
  );
};

export default Invoice;
