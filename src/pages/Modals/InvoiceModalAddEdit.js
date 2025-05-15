import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  InputNumber,
  Space,
  Divider,
  notification,
  Row,
  Col,
  Tag,
} from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Option } = Select;

const statusOptions = [
  { value: "unpaid", label: "Non Payée", color: "red" },
  { value: "partially_paid", label: "Partiellement Payée", color: "orange" },
  { value: "paid", label: "Payée", color: "green" },
];

const InvoiceModalAddEdit = ({
  visible,
  record,
  refetech,
  type,
  customers,
  products,
  stores,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [payed, setPayed] = useState(0);
  const [notPayed, setNotPayed] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("unpaid");
  const [magasinIds, setmagasinId] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (type === "EDIT" && record) {
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
        customerId: record.customerId || null,
        magasinId:
          record.magasinId && (record?.magasinId?._id || user?.magasinId[0]),
        customerName: record.customerName,
        customerAddress: record.customerAddress,
        customerPhone: record.customerPhone,
        status: record.status || "unpaid",
        notpayed: record.notpayed || 0,
        payed: record.payed || 0,
        notes: record.notes || "",
      });
      setmagasinId(
        record.magasinId && (record?.magasinId?._id || user?.magasinId[0])
      );
      setItems(record.items || []);
      setStatus(record.status || "unpaid");
      setPayed(record.payed || 0);
      setNotPayed(record.notpayed || 0);
      calculateTotals(record.items || []);
    } else {
      form.resetFields();
      form.setFieldsValue({
        magasinId: user?.magasinId[0],
      });
      setItems([]);
      setSubtotal(0);
      setTax(0);
      setTotal(0);
      setStatus("paid");
      setPayed(0);
      setNotPayed(0);
    }
  }, [visible, record, type]);

  const calculateTotals = (items) => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.prixVente,
      0
    );
    const newTax = newSubtotal * 0.19;
    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);

    if (type === "EDIT") {
      setNotPayed(Math.max(0, newTotal - payed));
      setPayed(newTotal);
    } else {
      setPayed(newTotal);
      setNotPayed(0);
      form.setFieldsValue({
        payed: newTotal,
        notpayed: 0,
      });
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        stockId: null,
        magasinId: stores[0]?._id || null,
        reference: "",
        nom: "",
        taille: 0,
        quantity: 1,
        prixAchat: 0,
        prixVente: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    calculateTotals(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "stockId" && value) {
      const product = products?.find((p) => p._id === value);
      if (product) {
        newItems[index].reference = product.reference;
        newItems[index].nom = product.nom;
        newItems[index].taille = product.taille;
        newItems[index].prixAchat = product.prixAchat;
        newItems[index].prixVente = product.prixVente;
      }
    }

    setItems(newItems);
    calculateTotals(newItems);
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      form.setFieldsValue({
        customerName: customer.nom,
        customerAddress: customer.adresse,
        customerPhone: customer.telephone,
      });
    }
  };

  const handlestoresChange = (customerId) => {
    const customer = stores.find((c) => c._id === customerId);
    setmagasinId(customer._id);
    if (customer) {
      form.setFieldsValue({
        magasinId: customer._id,
      });
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    if (value === "paid") {
      setPayed(total);
      setNotPayed(0);
      form.setFieldsValue({
        payed: total,
        notpayed: 0,
      });
    } else if (value === "unpaid") {
      setPayed(0);
      setNotPayed(total);
      form.setFieldsValue({
        payed: 0,
        notpayed: total,
      });
    }
  };

  const handlePayedChange = (value) => {
    const newPayed = Number(value) || 0;
    const newNotPayed = Math.max(0, total - newPayed);

    setPayed(newPayed);
    setNotPayed(newNotPayed);
    form.setFieldsValue({
      notpayed: newNotPayed,
    });

    if (newPayed >= total) {
      setStatus("paid");
    } else if (newPayed > 0) {
      setStatus("partially_paid");
    } else {
      setStatus("unpaid");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        invoiceNumber: values.invoiceNumber,
        date: values.date.toISOString(),
        customerId: values.customerId,
        magasinId: values.magasinId,
        customerName: values.customerName,
        customerAddress: values.customerAddress,
        customerPhone: values.customerPhone,
        items: items.map((item) => ({
          stockId: item.stockId,
          magasinId: item.magasinId,
          reference: item.reference,
          nom: item.nom,
          taille: item.taille,
          quantity: item.quantity,
          prixAchat: item.prixAchat,
          prixVente: item.prixVente,
        })),
        subtotal,
        tax,
        total,
        notpayed: notPayed,
        payed: payed,
        status,
        notes: values.notes,
      };

      if (type === "EDIT") {
        await axios.put(`https://rayhanaboutique.online/invoice/${record._id}`, payload);
        notification.success({ message: "Facture mise à jour avec succès" });
      } else {
        let customerId = values.customerId;

        if (!values.customerId) {
          const res = await axios.post("https://rayhanaboutique.online/clients", {
            adresse: values.customerAddress,
            telephone: values.customerPhone,
            nom: values.customerName,
            magasinId: [values.magasinId],
          });

          customerId = res?.data?._id;
        }

        await axios.post("https://rayhanaboutique.online/invoice", {
          ...payload,
          customerId: customerId,
        });
        notification.success({ message: "Facture créée avec succès" });
      }

      refetech();
      onCancel();
    } catch (error) {
      console.error("Error:", error);
      notification.error({
        message: "Erreur",
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Produit",
      dataIndex: "stockId",
      key: "stockId",
      render: (value, record, index) => (
        <Select
          value={value}
          style={{ width: "100%" }}
          onChange={(val) => handleItemChange(index, "stockId", val)}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {products
            ?.filter((el) => el.magasinId === magasinIds)
            .map((product) => (
              <Option key={product._id} value={product._id}>
                {product.nom} REF : ({product.reference})
              </Option>
            ))}
        </Select>
      ),
    },
    // {
    //   title: "Magasin",
    //   dataIndex: "magasinId",
    //   key: "magasinId",
    //   render: (value, record, index) => (
    //     <Select
    //       value={value}
    //       style={{ width: "100%" }}
    //       onChange={(val) => handleItemChange(index, "magasinId", val)}
    //     >
    //       {stores.map((store) => (
    //         <Option key={store._id} value={store._id}>
    //           {store.nom}
    //         </Option>
    //       ))}
    //     </Select>
    //   ),
    // },
    {
      title: "Quantité",
      dataIndex: "quantity",
      key: "quantity",
      render: (value, record, index) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleItemChange(index, "quantity", val)}
        />
      ),
    },
    {
      title: "Prix",
      dataIndex: "prixVente",
      key: "prixVente",
      render: (value) => `${value.toFixed(2)} TND`,
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) =>
        `${(record.quantity * record.prixVente).toFixed(2)} TND`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record, index) => (
        <Button
          danger
          type="text"
          icon={<MinusOutlined />}
          onClick={() => handleRemoveItem(index)}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      title={type === "EDIT" ? "Modifier la facture" : "Créer une facture"}
      width="100%"
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Enregistrer
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="magasinId"
          label="Magasin"
          rules={[{ required: true, message: "Ce champ est requis" }]}
        >
          <Select
            showSearch
            disabled={user?.type === "user"}
            optionFilterProp="children"
            onChange={handlestoresChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {stores.map((customer) => (
              <Option key={customer._id} value={customer._id}>
                {customer.nom}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="invoiceNumber"
              label="Numéro de facture"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="status"
          label="Statut"
          rules={[{ required: true, message: "Ce champ est requis" }]}
        >
          <Select
            onChange={handleStatusChange}
            value={status}
            optionLabelProp="label"
          >
            {statusOptions.map((option) => (
              <Option
                key={option.value}
                value={option.value}
                label={option.label}
              >
                <Tag color={option.color}>{option.label}</Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="customerId"
          label="Client"
          rules={[{ required: false, message: "Ce champ est requis" }]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            onChange={handleCustomerChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {customers.map((customer) => (
              <Option key={customer._id} value={customer._id}>
                {customer.nom}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customerName"
              label="Nom du client"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customerPhone"
              label="Téléphone"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customerAddress"
              label="Adresse"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Articles</Divider>

        <Button
          type="dashed"
          onClick={handleAddItem}
          block
          icon={<PlusOutlined />}
        >
          Ajouter un article
        </Button>

        <Table
          dataSource={items}
          pagination={false}
          rowKey={(record, index) => index}
          columns={columns}
          style={{ marginTop: 16 }}
        />

        <Divider orientation="left">Total</Divider>

        <Row justify="end" gutter={16}>
          <Col>
            <Space direction="vertical" size="middle">
              <div>
                <span style={{ marginRight: 16 }}>Sous-total:</span>
                <span>{subtotal.toFixed(2)} TND</span>
              </div>
              <div>
                <span style={{ marginRight: 16 }}>Taxe (19%):</span>
                <span>{tax.toFixed(2)} TND</span>
              </div>
              <div>
                <span style={{ marginRight: 16 }}>Total:</span>
                <span>{total.toFixed(2)} TND</span>
              </div>
            </Space>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Form.Item
              name="payed"
              label="Payé"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={total}
                value={payed}
                onChange={handlePayedChange}
                formatter={(value) => `${value} TND`}
                parser={(value) => value.replace(/ TND|€/g, "")}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="notpayed" label="Reste à payer">
              <InputNumber
                style={{ width: "100%" }}
                value={notPayed}
                disabled
                formatter={(value) => `${value} TND`}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Statut de paiement">
              <Tag
                color={
                  status === "paid"
                    ? "green"
                    : status === "partially_paid"
                    ? "orange"
                    : "red"
                }
              >
                {status === "paid"
                  ? "Payée"
                  : status === "partially_paid"
                  ? "Partiellement payée"
                  : "Non payée"}
              </Tag>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InvoiceModalAddEdit;
