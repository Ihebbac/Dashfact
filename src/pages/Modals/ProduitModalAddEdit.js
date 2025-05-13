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
  Upload,
  Image,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";

const { Text } = Typography;

const ProduitModalAddEdit = (props) => {
  const { visible, onCancel, type, record, refetch } = props;
  const [form] = Form.useForm();
  const [magasins, setMagasins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Initialize form and quantities when modal becomes visible or record changes
  useEffect(() => {
    const fetchMagasins = async () => {
      try {
        const response = await axios.get(
          "https://rayhanaboutique.online/magasins"
        );
        setMagasins(response.data);
      } catch (err) {
        console.error("Error loading stores:", err);
        message.error("Erreur lors du chargement des magasins");
      }
    };

    if (visible) {
      fetchMagasins();

      if (type === "EDIT" && record) {
        // Initialize form with record data
        form.setFieldsValue({
          nom: record.nom,
          reference: record.reference,
          taille: record.taille,
          prixAchat: record.prixAchat,
          prixVente: record.prixVente,
        });

        // Initialize quantities from record
        setQuantities(record.quantite || []);

        // Initialize image preview if exists
        if (record.image) {
          setImagePreview(
            `https://rayhanaboutique.online/upload/${record.image}`
          );
          setImageFile(record?.image);
        }
      } else {
        form.resetFields();
        setQuantities([]);
        setImageFile(null);
        setImagePreview("");
      }
    }
  }, [visible, record]);

  const handleAddMagasin = () => {
    setQuantities([
      ...quantities,
      {
        magasinId: user.type === "user" ? user?.magasinId[0] : null,
        quantiteInitiale: 0,
        quantiteVendue: 0,
        quantitePerdue: 0,
      },
    ]);
  };

  const handleRemoveMagasin = (index) => {
    const newQuantities = quantities.filter((_, i) => i !== index);
    setQuantities(newQuantities);
  };

  const handleQuantityChange = (index, field, value) => {
    const newQuantities = [...quantities];
    newQuantities[index] = {
      ...newQuantities[index],
      [field]: value,
    };
    setQuantities(newQuantities);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Vous ne pouvez uploader que des fichiers images!");
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("L'image doit être inférieure à 2MB!");
    }

    return isImage && isLt2M;
  };

  const handleImageChange = (info) => {
    if (info.file.status === "done") {
      // Get this url from response in real world
      const imageUrl = URL.createObjectURL(info.file.originFileObj);
      setImagePreview(imageUrl);
      setImageFile(info.file.originFileObj.name);
      form.setFieldsValue("image", info.file.originFileObj.name);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await axios.post(
        "https://rayhanaboutique.online/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.filename;
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Erreur lors de l'upload de l'image");
      return null;
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let imageFilename = record?.image || null;

      // // Upload new image if one was selected
      // if (imageFile) {
      //   imageFilename = await uploadImage();
      //   if (!imageFilename) return;
      // }

      const payload = {
        ...values,
        image: imageFile,
        quantite: quantities.map((q) => ({
          ...q,
          quantiteInitiale: Number(q.quantiteInitiale),
          quantiteVendue: Number(q.quantiteVendue),
          quantitePerdue: Number(q.quantitePerdue),
        })),
      };

      if (type === "EDIT") {
        await axios.put(
          `https://rayhanaboutique.online/stock/${record._id}`,
          payload
        );
        message.success("Produit mis à jour avec succès");
      } else {
        await axios.post("https://rayhanaboutique.online/stock", payload);
        message.success("Produit créé avec succès");
      }

      refetch();
      onCancel();
    } catch (error) {
      console.error("API Error:", error);
      message.error(
        error.response?.data?.message || "Erreur lors de l'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  const quantityColumns = [
    {
      title: "Magasin",
      dataIndex: "magasinId",
      render: (_, __, index) => (
        <Select
          disabled={user.type === "user"}
          value={quantities[index]?.magasinId}
          onChange={(value) => handleQuantityChange(index, "magasinId", value)}
          placeholder="Sélectionner un magasin"
          style={{ width: "100%" }}
          allowClear
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
      render: (_, __, index) => (
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
      render: (_, __, index) => (
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
      render: (_, __, index) => (
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

  const uploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    action: "https://rayhanaboutique.online/upload",
    beforeUpload: beforeUpload,
    onChange: handleImageChange,
    accept: "image/*",
  };

  return (
    <Modal
      title={
        type === "EDIT" ? "Modifier le Produit" : "Ajouter un Nouveau Produit"
      }
      visible={visible}
      width={1000}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={type === "EDIT" ? "Mettre à jour" : "Créer"}
      cancelText="Annuler"
      destroyOnClose
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

            <Col span={24} style={{ marginBottom: 16 }}>
              <Form.Item label="Image du Produit">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: 100, maxHeight: 100 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        border: "1px dashed #d9d9d9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Aucune image
                    </div>
                  )}
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Choisir une image</Button>
                  </Upload>
                </div>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="taille"
                label="Taille"
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
                <InputNumber style={{ width: "100%" }} min={1} max={6} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="prixAchat"
                label="Prix d'Achat (TND)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  formatter={(value) => `TND ${value}`}
                  parser={(value) => value.replace("TND ", "")}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="prixVente"
                label="Prix de Vente (TND)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  formatter={(value) => `TND ${value}`}
                  parser={(value) => value.replace("TND ", "")}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Text strong style={{ display: "block", marginBottom: 16 }}>
                Quantités par Magasin
              </Text>

              <Table
                columns={quantityColumns}
                dataSource={quantities}
                pagination={false}
                rowKey={(_, index) => index}
                bordered
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
