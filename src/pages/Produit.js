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

const { confirm } = Modal;

const Produit = () => {
  const [data, setData] = useState([]);
  const [filterData, setfilterData] = useState([]);
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
    axios.get("http://127.0.0.1:3000/stock").then((response) => {
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

  const handrefetech = () => {
    setrefetech(!refetech);
  };

  const showPromiseConfirm = (alldata, dataDelete) => {
    confirm({
      title: "Vous voulez supprimer " + alldata.name + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete("http://127.0.0.1:3000/stock/" + dataDelete)
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
    
    const filtered = data.filter(item => 
      item.nom.toLowerCase().includes(search.toLowerCase()) || 
      item.reference.toLowerCase().includes(search.toLowerCase())
    );
    setfilterData(filtered);
  };

  const handleExcelImport = async (options) => {
    const { file } = options;
    const formData = new FormData();
    formData.append('file', file);
    
    setFileUploading(true);
    
    try {
      const response = await axios.post('http://127.0.0.1:3000/stock/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      message.success(`${file.name} importé avec succès`);
      handrefetech();
    } catch (error) {
      message.error(`Échec de l'importation de ${file.name}: ${error.message}`);
    } finally {
      setFileUploading(false);
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
          refetech={handrefetech}
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
                    <p><strong>Référence:</strong> {record.reference}</p>
                    <p><strong>Nom:</strong> {record.nom}</p>
                    {record.description && <p><strong>Description:</strong> {record.description}</p>}
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