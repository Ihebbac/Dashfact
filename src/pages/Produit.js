import {
  Row,
  Col,
  Card,
  Table,
  Upload,
  message,
  Button,
  Typography,
  Modal,
  Input,
  notification,
  Badge,
  Tag,
  Divider,
  Progress,
  Image,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import ProduitModalAddEdit from "./Modals/ProduitModalAddEdit";
import Text from "antd/lib/typography/Text";
import * as XLSX from "xlsx";

const { confirm } = Modal;

const Produit = () => {
  const [data, setData] = useState([]);
  const [filterData, setfilterData] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setrecord] = useState(null);
  const [refetech, setrefetech] = useState(false);
  const [show, setshow] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const abilities = JSON.parse(localStorage.getItem("user"))?.abilities?.find(
    (el) => el.page === "produit"
  )?.can;

  useEffect(() => {
    fetchData();
  }, [refetech]);

  const fetchData = () => {
    axios.get("https://rayhanaboutique.online/stock").then((response) => {
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

    axios
      .get("https://rayhanaboutique.online/magasins")
      .then((response) => setMagasins(response.data))
      .catch((err) => console.error("Error loading stores:", err));
  };

  const handrefetech = () => {
    setrefetech(!refetech);
  };

  const showPromiseConfirm = (alldata, dataDelete) => {
    confirm({
      title: "Vous voulez supprimer " + alldata.name + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete("https://rayhanaboutique.online/stock/" + dataDelete)
          .then((response) => {
            message.success("Produit supprimer avec success.");
            handrefetech();
          });
      },
      onCancel() {},
    });
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (_, record) => (
        <div>
          <Image
            src={`https://rayhanaboutique.online/upload/${record?.image}`}
            width={100}
            height={100}
          />
        </div>
      ),
    },
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
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
                onClick={() => showPromiseConfirm(record, record._id)}
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
        item.nom.toLowerCase().includes(search.toLowerCase()) ||
        item.reference.toLowerCase().includes(search.toLowerCase())
    );
    setfilterData(filtered);
  };
  const [dataSheet, setDataSheet] = useState([]);

  const handleExcelImport = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Optional: Set loading state here
      // setFileUploading(true);

      const response = await axios.post(
        "https://rayhanaboutique.online/stock/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const extractedData = response.data;
      console.log("✅ Extracted data with images:", extractedData);

      // Store in state or pass to another handler
      setDataSheet(extractedData);

      // Optional: show success toast
      // message.success(`${file.name} importé avec succès`);
    } catch (error) {
      console.error("❌ Error importing Excel:", error);
      // message.error(`Échec de l'importation: ${error.message}`);
    } finally {
      // Optional: setFileUploading(false);
    }
  };
  return (
    <>
      <h1>Produits</h1>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title="Liste des produits"
              extra={
                <div className="d-flex">
                  <Input
                    placeholder="Rechercher par nom ou référence"
                    style={{ marginRight: 25, width: 200 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={handleSearch}
                    suffix={<SearchOutlined onClick={handleSearch} />}
                  />

                  <Button
                    style={{ marginRight: 25 }}
                    type="primary"
                    onClick={() => {
                      setVisible(true);
                      setrecord({});
                      setAction("ADD");
                    }}
                  >
                    Ajouter un produit
                  </Button>

                  <Upload
                    accept=".xlsx,.xls,.csv"
                    customRequest={handleExcelImport}
                    showUploadList={false}
                    disabled={fileUploading}
                  >
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      loading={fileUploading}
                    >
                      Importer depuis Excel
                    </Button>
                  </Upload>
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

        <ProduitModalAddEdit
          visible={visible}
          record={action === "EDIT" ? record : {}}
          refetch={handrefetech}
          type={action}
          onCancel={() => setVisible(false)}
        />

        <Modal
          visible={show}
          destroyOnClose
          width={1000}
          onCancel={() => setshow(false)}
          footer={false}
        >
          {record && (
            <Badge.Ribbon style={{ marginTop: 15 }} color="red">
              <Card>
                <Row>
                  <Col span={12}>
                    <h3>Détails du produit</h3>
                    <p>
                      <strong>Référence:</strong> {record.reference}
                    </p>
                    <p>
                      <strong>Nom:</strong> {record.nom}
                    </p>
                    {record?.description && (
                      <p>
                        <strong>Description:</strong> {record.description}
                      </p>
                    )}
                  </Col>
                </Row>

                <Card
                  title="Stock par Magasin"
                  style={{ marginTop: 16 }}
                  bordered={false}
                >
                  {record?.quantite?.map((el, index) => {
                    const magasin = magasins.find(
                      (elm) => elm._id === el.magasinId
                    );
                    const availableStock =
                      el.quantiteInitiale - el.quantiteVendue;
                    const stockPercentage =
                      (availableStock / el.quantiteInitiale) * 100;

                    return (
                      <div key={index} style={{ marginBottom: 16 }}>
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Text strong>Magasin:</Text>
                            <Text style={{ marginLeft: 8 }}>
                              {magasin?.nom || "Inconnu"}
                            </Text>
                          </Col>

                          <Col span={8}>
                            <Text strong>Stock disponible:</Text>
                            <Badge
                              count={availableStock}
                              style={{
                                backgroundColor:
                                  availableStock > 0 ? "#52c41a" : "#f5222d",
                                marginLeft: 8,
                              }}
                            />
                          </Col>

                          <Col span={8}>
                            <Progress
                              percent={stockPercentage}
                              status={
                                stockPercentage > 50
                                  ? "success"
                                  : stockPercentage > 20
                                  ? "normal"
                                  : "exception"
                              }
                              showInfo={false}
                            />
                          </Col>
                        </Row>

                        <Row gutter={16} style={{ marginTop: 8 }}>
                          <Col span={12}>
                            <Text type="secondary">
                              Initial: {el.quantiteInitiale} | Vendu:{" "}
                              {el.quantiteVendue}
                            </Text>
                          </Col>
                          <Col span={12}>
                            {availableStock <= 0 && (
                              <Tag color="red">RUPTURE DE STOCK</Tag>
                            )}
                            {availableStock > 0 && availableStock <= 5 && (
                              <Tag color="orange">STOCK FAIBLE</Tag>
                            )}
                          </Col>
                        </Row>

                        {index < record.quantite.length - 1 && (
                          <Divider style={{ margin: "12px 0" }} />
                        )}
                      </div>
                    );
                  })}
                </Card>
              </Card>
            </Badge.Ribbon>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Produit;
