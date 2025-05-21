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
  Tabs,
  Popconfirm,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UploadOutlined,
  ShopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import ProduitModalAddEdit from "./Modals/ProduitModalAddEdit";
import Text from "antd/lib/typography/Text";

const { confirm } = Modal;
const { TabPane } = Tabs;

const Produit = () => {
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [magasins, setMagasins] = useState([]);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setRecord] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [show, setShow] = useState(false);
  const [showMagasinStock, setShowMagasinStock] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [stockByMagasin, setStockByMagasin] = useState([]);
  // New state for selected rows
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const abilities = user?.abilities?.find((el) => el.page === "produit")?.can;

  useEffect(() => {
    fetchData();
  }, [refetch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const stockResponse = await axios.get(
        "https://rayhanaboutique.online/stock"
      );
      if (stockResponse.data) {
        setSearch("");
        setFilterData([]);
        setSelectedRowKeys([]); // Clear selection on data refresh

        const filteredData =
          user.type === "user"
            ? stockResponse.data.filter((el) =>
                user?.magasinId?.includes(el.magasinId)
              )
            : stockResponse.data;

        const sortedData = _.sortBy(filteredData, (o) => Number(o._id));
        setData(sortedData);
      } else {
        notification.error({ message: "No Data Found" });
      }

      const magasinsResponse = await axios.get(
        "https://rayhanaboutique.online/magasins"
      );
      setMagasins(magasinsResponse.data);
    } catch (err) {
      console.error("Error loading data:", err);
      notification.error({ message: "Error loading data" });
    } finally {
      setLoading(false);
    }
  };

  const handleRefetch = () => {
    setRefetch(!refetch);
  };

  const showDeleteConfirmation = (stockItem) => {
    confirm({
      title: `Voulez-vous supprimer ${stockItem.nom}?`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await axios.delete(
            `https://rayhanaboutique.online/stock/${stockItem._id}`
          );
          message.success("Produit supprimé avec succès.");
          handleRefetch();
        } catch (error) {
          message.error("Erreur lors de la suppression du produit.");
        }
      },
    });
  };

  // New function to handle bulk deletion
  const handleBulkDelete = async () => {
    if (!selectedRowKeys.length) {
      message.warning("Aucun produit sélectionné");
      return;
    }

    confirm({
      title: `Voulez-vous supprimer ${selectedRowKeys.length} produit(s) sélectionné(s)?`,
      icon: <ExclamationCircleOutlined />,
      content: "Cette action est irréversible",
      onOk: async () => {
        try {
          setLoading(true);
          // Using Promise.all to handle multiple delete requests in parallel
          await Promise.all(
            selectedRowKeys.map((id) =>
              axios.delete(`https://rayhanaboutique.online/stock/${id}`)
            )
          );
          message.success(
            `${selectedRowKeys.length} produit(s) supprimé(s) avec succès.`
          );
          setSelectedRowKeys([]);
          handleRefetch();
        } catch (error) {
          console.error("Error during bulk delete:", error);
          message.error("Erreur lors de la suppression des produits.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const loadStockByMagasin = async () => {
    try {
      const response = await axios.get(
        "https://rayhanaboutique.online/stock/all"
      );

      // Process the raw data using lodash
      const processedData = _.chain(response.data)
        // Group products by magasin ID
        .groupBy((product) => product.magasinId._id)
        // Transform each group into the required format
        .map((produits, magasinIdKey) => {
          // Get magasin info from the first product in the group
          const magasinInfo = produits[0]?.magasinId || {
            _id: magasinIdKey,
            nom: "Unknown",
          };

          // Calculate totals using lodash
          const totalInitial = _.sumBy(produits, "quantiteInitiale") || 0;
          const totalVendu = _.sumBy(produits, "quantiteVendue") || 0;
          const totalPerdu = _.sumBy(produits, "quantitePerdue") || 0;
          const totalStock = totalInitial - totalVendu - totalPerdu;

          // Calculate stock value based on available stock and purchase price
          const stockValue = _.reduce(
            produits,
            (sum, product) => {
              const availableStock =
                product.quantiteInitiale -
                product.quantiteVendue -
                product.quantitePerdue;
              return sum + availableStock * product.prixAchat;
            },
            0
          );

          // Prepare the data structure as required
          return {
            magasin: { _id: magasinInfo._id, nom: magasinInfo.nom },
            count: produits.length,
            totalInitial,
            totalVendu,
            totalPerdu,
            totalStock,
            stockValue,
            produits: produits.map((product) => ({
              _id: product._id,
              nom: product.nom,
              reference: product.reference,
              quantiteInitiale: product.quantiteInitiale,
              quantiteVendue: product.quantiteVendue,
              quantitePerdue: product.quantitePerdue,
              prixAchat: product.prixAchat,
            })),
          };
        })
        .value();

      setStockByMagasin(processedData);
      setShowMagasinStock(true);
    } catch (error) {
      console.error("Error loading stock by magasin:", error);
      message.error("Erreur lors du chargement des stocks par magasin");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <Image
          src={`https://rayhanaboutique.online/upload/${image}`}
          width={100}
          height={100}
        />
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
      title: "Taille",
      dataIndex: "taille",
      key: "taille",
    },
    {
      title: "Prix Achat",
      dataIndex: "prixAchat",
      key: "prixAchat",
    },
    {
      title: "Prix Vente",
      dataIndex: "prixVente",
      key: "prixVente",
    },
    {
      title: "Quantité Initiale",
      dataIndex: "quantiteInitiale",
      key: "quantiteInitiale",
    },
    {
      title: "Quantité Vendue",
      dataIndex: "quantiteVendue",
      key: "quantiteVendue",
    },
    {
      title: "Quantité Perdue",
      dataIndex: "quantitePerdue",
      key: "quantitePerdue",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Row gutter={8}>
          <Col>
            <Button
              onClick={() => {
                setVisible(true);
                setRecord(record);
                setAction("EDIT");
              }}
            >
              <EditTwoTone />
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => {
                setShow(true);
                setRecord(record);
              }}
            >
              <InfoCircleOutlined />
            </Button>
          </Col>
          <Col>
            <Button danger onClick={() => showDeleteConfirmation(record)}>
              Supprimer
            </Button>
          </Col>
        </Row>
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
    setFilterData(filtered);
  };

  const handleExcelImport = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setFileUploading(true);
      await axios.post(
        "https://rayhanaboutique.online/stock/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      message.success(`${file.name} importé avec succès`);
      handleRefetch();
    } catch (error) {
      console.error("Error importing Excel:", error);
      message.error(`Échec de l'importation: ${error.message}`);
    } finally {
      setFileUploading(false);
    }
  };

  const magasinStockColumns = [
    {
      title: "Magasin",
      dataIndex: "magasin",
      key: "magasin",
      render: (magasin) => magasin.nom,
    },
    {
      title: "Nombre de Produits",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "Stock Total",
      dataIndex: "totalStock",
      key: "totalStock",
      render: (totalStock, record) => (
        <div>
          <Text>Initial: {record.totalInitial}</Text>
          <Divider type="vertical" />
          <Text>Vendu: {record.totalVendu}</Text>
          <Divider type="vertical" />
          <Text>Perdu: {record.totalPerdu}</Text>
          <Divider type="vertical" />
          <Text strong>Disponible: {totalStock}</Text>
        </div>
      ),
    },
    {
      title: "Valeur du Stock",
      dataIndex: "stockValue",
      key: "stockValue",
      render: (value) => `${value.toFixed(2)} TND`,
    },
  ];

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
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
                      setRecord({});
                      setAction("ADD");
                    }}
                  >
                    Ajouter un produit
                  </Button>

                  {/* Bulk Delete Button */}
                  {selectedRowKeys.length > 0 && (
                    <Button
                      style={{ marginRight: 25 }}
                      type="danger"
                      icon={<DeleteOutlined />}
                      onClick={handleBulkDelete}
                      loading={loading}
                    >
                      Supprimer ({selectedRowKeys.length})
                    </Button>
                  )}

                  {user.type === "admin" && (
                    <Button
                      style={{ marginRight: 25 }}
                      icon={<ShopOutlined />}
                      onClick={loadStockByMagasin}
                    >
                      Stock par Magasin
                    </Button>
                  )}

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
              {/* Display selection summary */}
              {selectedRowKeys.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Text>{`${selectedRowKeys.length} produit(s) sélectionné(s)`}</Text>
                  <Button
                    type="link"
                    onClick={() => setSelectedRowKeys([])}
                    style={{ marginLeft: 8 }}
                  >
                    Effacer la sélection
                  </Button>
                </div>
              )}

              <div className="table-responsive">
                <Table
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={filterData.length > 0 ? filterData : data}
                  pagination={true}
                  className="ant-border-space"
                  rowKey="_id"
                  loading={loading}
                />
              </div>
            </Card>
          </Col>
        </Row>

        <ProduitModalAddEdit
          visible={visible}
          record={action === "EDIT" ? record : {}}
          refetch={handleRefetch}
          type={action}
          onCancel={() => setVisible(false)}
        />

        <Modal
          visible={show}
          destroyOnClose
          width={1000}
          onCancel={() => setShow(false)}
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
                    <p>
                      <strong>Taille:</strong> {record.taille}
                    </p>
                    <p>
                      <strong>Prix Achat:</strong> {record.prixAchat}
                    </p>
                    <p>
                      <strong>Prix Vente:</strong> {record.prixVente}
                    </p>
                  </Col>
                  <Col span={12}>
                    <Image
                      src={`https://rayhanaboutique.online/upload/${record.image}`}
                      width={200}
                      height={200}
                    />
                  </Col>
                </Row>

                <Card title="Stock" style={{ marginTop: 16 }} bordered={false}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Text strong>Quantité Initiale:</Text>
                      <Text> {record.quantiteInitiale}</Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>Quantité Vendue:</Text>
                      <Text> {record.quantiteVendue}</Text>
                    </Col>
                    <Col span={8}>
                      <Text strong>Quantité Perdue:</Text>
                      <Text> {record.quantitePerdue}</Text>
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col span={24}>
                      <Text strong>Stock Disponible: </Text>
                      <Text>
                        {record.quantiteInitiale -
                          record.quantiteVendue -
                          record.quantitePerdue}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Card>
            </Badge.Ribbon>
          )}
        </Modal>

        {/* Modal for Stock by Magasin */}
        <Modal
          title="Stock par Magasin"
          visible={showMagasinStock}
          width={1000}
          onCancel={() => setShowMagasinStock(false)}
          footer={null}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Résumé" key="1">
              <Table
                columns={magasinStockColumns}
                dataSource={stockByMagasin}
                rowKey={(record) => record.magasin._id}
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Détails" key="2">
              {stockByMagasin.map((magasinData) => (
                <Card
                  key={magasinData.magasin._id}
                  title={`Magasin: ${magasinData.magasin.nom}`}
                  style={{ marginBottom: 16 }}
                >
                  <Table
                    columns={[
                      { title: "Produit", dataIndex: "nom", key: "nom" },
                      {
                        title: "Référence",
                        dataIndex: "reference",
                        key: "reference",
                      },
                      {
                        title: "Stock Initial",
                        dataIndex: "quantiteInitiale",
                        key: "quantiteInitiale",
                      },
                      {
                        title: "Vendu",
                        dataIndex: "quantiteVendue",
                        key: "quantiteVendue",
                      },
                      {
                        title: "Perdu",
                        dataIndex: "quantitePerdue",
                        key: "quantitePerdue",
                      },
                      {
                        title: "Disponible",
                        key: "disponible",
                        render: (_, record) => (
                          <Text strong>
                            {record.quantiteInitiale -
                              record.quantiteVendue -
                              record.quantitePerdue}
                          </Text>
                        ),
                      },
                      {
                        title: "Valeur",
                        key: "valeur",
                        render: (_, record) => (
                          <Text>
                            {(
                              record.prixAchat *
                              (record.quantiteInitiale -
                                record.quantiteVendue -
                                record.quantitePerdue)
                            ).toFixed(2)}{" "}
                            TND
                          </Text>
                        ),
                      },
                    ]}
                    dataSource={magasinData.produits}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                  />
                </Card>
              ))}
            </TabPane>
          </Tabs>
        </Modal>
      </div>
    </>
  );
};

export default Produit;
