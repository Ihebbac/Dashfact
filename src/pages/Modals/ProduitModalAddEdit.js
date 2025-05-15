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
  Typography,
  Upload,
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";

const { Text } = Typography;

const ProduitModalAddEdit = (props) => {
  const { visible, onCancel, type, record, refetch } = props;
  const [form] = Form.useForm();
  const [magasins, setMagasins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchMagasins = async () => {
      try {
        const response = await axios.get("https://rayhanaboutique.online/magasins");
        setMagasins(response.data);
      } catch (err) {
        console.error("Error loading stores:", err);
        message.error("Erreur lors du chargement des magasins");
      }
    };

    if (visible) {
      fetchMagasins();

      if (type === "EDIT" && record) {
        form.setFieldsValue({
          nom: record.nom,
          reference: record.reference,
          taille: record.taille,
          prixAchat: record.prixAchat,
          prixVente: record.prixVente,
          quantiteInitiale: record.quantiteInitiale,
          quantiteVendue: record.quantiteVendue,
          quantitePerdue: record.quantitePerdue,
          magasinId: record.magasinId,
        });

        if (record.image) {
          setImagePreview(`https://rayhanaboutique.online/upload/${record.image}`);
          setImageFile(record.image);
        }
      } else {
        form.resetFields();
        setImageFile(null);
        setImagePreview("");
        
        // Set default magasinId for users
        if (user.type === "user" && user.magasinId) {
          form.setFieldsValue({
            magasinId: user.magasinId[0]
          });
        }
      }
    }
  }, [visible, record]);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Vous ne pouvez uploader que des fichiers images!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("L'image doit être inférieure à 2MB!");
      return false;
    }

    return true;
  };

  const handleImageChange = (info) => {
    if (info.file.status === "done") {
      const imageUrl = URL.createObjectURL(info.file.originFileObj);
      setImagePreview(imageUrl);
      setImageFile(info.file.originFileObj);
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

      // Upload new image if one was selected
      if (imageFile && typeof imageFile !== 'string') {
        imageFilename = await uploadImage();
        if (!imageFilename) return;
      }

      const payload = {
        ...values,
        image: imageFilename || imageFile,
      };

      if (type === "EDIT") {
        await axios.put(`https://rayhanaboutique.online/stock/${record._id}`, payload);
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
      title={type === "EDIT" ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
      visible={visible}
      width={800}
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
                rules={[{ required: true, message: "Ce champ est obligatoire" }]}
              >
                <Input placeholder="Entrez le nom du produit" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="reference"
                label="Référence"
                rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
                rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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
                rules={[{ required: true, message: "Ce champ est obligatoire" }]}
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

            <Col span={12}>
              <Form.Item
                name="magasinId"
                label="Magasin"
                rules={[{ required: true, message: "Ce champ est obligatoire" }]}
              >
                <Select
                  disabled={user.type === "user"}
                  placeholder="Sélectionner un magasin"
                  style={{ width: "100%" }}
                >
                  {magasins.map((magasin) => (
                    <Select.Option key={magasin._id} value={magasin._id}>
                      {magasin.nom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="quantiteInitiale"
                label="Quantité Initiale"
                rules={[{ required: true, message: "Ce champ est obligatoire" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="quantiteVendue"
                label="Quantité Vendue"
                initialValue={0}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="quantitePerdue"
                label="Quantité Perdue"
                initialValue={0}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default ProduitModalAddEdit;