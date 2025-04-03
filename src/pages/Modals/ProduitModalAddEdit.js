import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Table,
  Typography,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";

const { Text } = Typography;

const ProduitModalAddEdit = (props) => {
  const { visible, onCancel, type, record, refetch } = props;
  const [form] = Form.useForm();
  const [magasins, setMagasins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState([]);

  // Initialize quantities from record or empty array
  useEffect(() => {
    axios
      .get("http://127.0.0.1:3000/magasins")
      .then((response) => setMagasins(response.data))
      .catch((err) => console.error("Error loading stores:", err));

    if (type === "EDIT" && record?.quantite) {
      setQuantities(record.quantite);
      form.setFieldsValue({
        ...record,
      });
    } else {
      form.resetFields();
      setQuantities([]);
    }
  }, [visible, record]);

  const handleAddMagasin = () => {
    setQuantities([
      ...quantities,
      {
        magasinId: "",
        quantiteInitiale: 0,
        quantiteVendue: 0,
        quantitePerdue: 0,
      },
    ]);
  };

  const handleRemoveMagasin = (index) => {
    const newQuantities = [...quantities];
    newQuantities.splice(index, 1);
    setQuantities(newQuantities);
  };

  const handleQuantityChange = (index, field, value) => {
    const newQuantities = [...quantities];
    newQuantities[index][field] = value;
    setQuantities(newQuantities);

    console.log("tttttttttttt", field, value, newQuantities);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        quantite: quantities.map((q) => ({
          ...q,
          quantiteInitiale: Number(q.quantiteInitiale),
          quantiteVendue: Number(q.quantiteVendue),
          quantitePerdue: Number(q.quantitePerdue),
        })),
      };

      if (type === "EDIT") {
        await axios.put(`http://127.0.0.1:3000/stock/${record._id}`, payload);
        message.success("Stock mis à jour avec succès");
      } else {
        await axios.post("http://127.0.0.1:3000/stock", payload);
        message.success("Stock créé avec succès");
      }

      refetch();
      onCancel();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Magasin",
      dataIndex: "magasinId",
      render: (_, record, index) => (
        <Select
          value={quantities[index]?.magasinId}
          onChange={(value) => handleQuantityChange(index, "magasinId", value)}
          placeholder="Sélectionner un magasin"
          style={{ width: "100%" }}
        >
          {magasins.map((magasin) => (
            <Select.Option key={magasin._id} value={magasin._id}>
              {magasin.nom}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Quantité Initiale",
      dataIndex: "quantiteInitiale",
      render: (_, record, index) => (
        <InputNumber
          value={quantities[index]?.quantiteInitiale}
          onChange={(value) =>
            handleQuantityChange(index, "quantiteInitiale", value)
          }
          min={0}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Quantité Vendue",
      dataIndex: "quantiteVendue",
      render: (_, record, index) => (
        <InputNumber
          value={quantities[index]?.quantiteVendue}
          onChange={(value) =>
            handleQuantityChange(index, "quantiteVendue", value)
          }
          min={0}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Quantité Perdue",
      dataIndex: "quantitePerdue",
      render: (_, record, index) => (
        <InputNumber
          value={quantities[index]?.quantitePerdue}
          onChange={(value) =>
            handleQuantityChange(index, "quantitePerdue", value)
          }
          min={0}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Action",
      render: (_, __, index) => (
        <MinusCircleOutlined onClick={() => handleRemoveMagasin(index)} />
      ),
    },
  ];

  return (
    <Modal
      title={type === "EDIT" ? "MODIFIER LE STOCK" : "AJOUTER UN NOUVEAU STOCK"}
      visible={visible}
      width={1000}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={type === "EDIT" ? "Mettre à jour" : "Créer"}
      cancelText="Annuler"
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Card>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nom"
                label="Nom du Produit"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input placeholder="Entrez le nom du produit" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="reference"
                label="Référence"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input placeholder="Entrez la référence" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="taille"
                label="Taille (1-6)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  {
                    type: "number",
                    min: 1,
                    max: 6,
                    message: "Doit être entre 1 et 6",
                  },
                ]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="prixAchat"
                label="Prix d'Achat (€)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="prixVente"
                label="Prix de Vente (€)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Text strong style={{ display: "block", marginBottom: 16 }}>
                Quantités par Magasin
              </Text>

              <Table
                columns={columns}
                dataSource={quantities}
                pagination={false}
                rowKey={(_, index) => index}
                footer={() => (
                  <Button
                    type="dashed"
                    onClick={handleAddMagasin}
                    block
                    icon={<PlusOutlined />}
                  >
                    Ajouter un Magasin
                  </Button>
                )}
              />
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default ProduitModalAddEdit;
