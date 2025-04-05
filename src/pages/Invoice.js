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
  FilterOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import dayjs from "dayjs";
import InvoiceModalAddEdit from "./Modals/InvoiceModalAddEdit";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const { confirm } = Modal;
const { Option } = Select;
const { Text } = Typography;

const Invoice = () => {
  const { RangePicker } = DatePicker;
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
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);

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
        let sorted_obj = _.sortBy(response.data, function (o) {
          return Number(o._id);
        });
        setData(sorted_obj);
        setfilterData(sorted_obj);
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

  const applyFilters = () => {
    let filtered = [...data];

    // Keyword filter (invoice number or customer name)
    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
          item.customerName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter((item) => {
        const invoiceDate = dayjs(item.date);
        return (
          invoiceDate.isAfter(startDate.startOf("day")) &&
          invoiceDate.isBefore(endDate.endOf("day"))
        );
      });
    }

    // Status filter

    if (statusFilter) {
      filtered = filtered.filter((item) => item?.status === statusFilter);
      console.log("sss", filtered, statusFilter);
    }

    setfilterData(filtered);
  };

  const resetFilters = () => {
    setSearch("");
    setDateRange([]);
    setStatusFilter(null);
    setfilterData([]);
  };
  // Import separately
  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = [41, 128, 185];
    const secondaryColor = [52, 152, 219];
    const lightColor = [245, 245, 245];
    const textGray = [80, 80, 80];

    // --- HEADER BAR ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 25, "F");

    // Optional logo
    // const imgData = 'data:image/png;base64,...';
    // doc.addImage(imgData, 'PNG', 15, 5, 15, 15);

    // Company Name & Address (left)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("VOTRE ENTREPRISE", 15, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("123 Rue de Commerce, Paris", 15, 21);

    // Invoice info (right)
    doc.setFontSize(12);
    doc.text(`FACTURE #${invoice.invoiceNumber}`, pageWidth - 15, 12, {
      align: "right",
    });

    doc.setFontSize(9);
    doc.text(
      `Date : ${dayjs(invoice.date).format("DD/MM/YYYY")}`,
      pageWidth - 15,
      18,
      { align: "right" }
    );
    doc.text(`Statut : ${invoice.status.toUpperCase()}`, pageWidth - 15, 23, {
      align: "right",
    });

    // --- CLIENT BOX ---
    doc.setTextColor(0);
    doc.setFillColor(...lightColor);
    doc.rect(15, 35, pageWidth - 30, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("CLIENT", 20, 43);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoice.customerName, 20, 50);
    doc.text(invoice.customerAddress, 20, 56);
    doc.text(`Tél: ${invoice.customerPhone}`, 20, 62);

    // --- SÉPARATEUR ---
    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    doc.line(15, 70, pageWidth - 15, 70);

    // --- TABLE PRODUITS ---
    const itemsData = invoice.items.map((item) => [
      item.reference,
      item.nom,
      item.taille,
      item.quantity,
      `${item.prixVente.toFixed(2)} TND`,
      `${(item.quantity * item.prixVente).toFixed(2)} TND`,
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Réf.', 'Désignation', 'Taille', 'Qté', 'Prix Unitaire', 'Total']],
      body: itemsData,
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 10,
        valign: 'middle',
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'left' }, // Réf.
        1: { cellWidth: 60, halign: 'left' }, // Désignation
        2: { cellWidth: 20, halign: 'center' }, // Taille
        3: { cellWidth: 20, halign: 'center' }, // Qté
        4: { cellWidth: 30, halign: 'right' }, // Prix U
        5: { cellWidth: 30, halign: 'right' }, // Total
      },
      styles: {
        lineColor: 230,
        lineWidth: 0.1,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      margin: { top: 0, left: 15, right: 15 },
      didDrawPage: function (data) {
        // Footer (déjà défini dans le reste du script, tu peux le garder tel quel ici)
        const footerY = pageHeight - 30;
        doc.setFillColor(...primaryColor);
        doc.rect(0, footerY, pageWidth, 30, 'F');
    
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("Merci pour votre confiance. Paiement attendu sous 30 jours.", pageWidth / 2, footerY + 10, { align: 'center' });
        doc.text("IBAN: FR76 3000 1000 0100 0000 0000 XXXX • BIC: SOGEFRPP", pageWidth / 2, footerY + 16, { align: 'center' });
    
        doc.setFontSize(8);
        doc.text(`Page ${data.pageCount}`, pageWidth - 15, footerY + 26, { align: 'right' });
      }
    });
    // --- TOTAUX ---
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFillColor(...lightColor);
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.5);
    doc.rect(pageWidth - 100, finalY, 85, 30, "FD");

    doc.setFontSize(12);
    doc.setTextColor(...textGray);
    doc.setFont("helvetica", "normal");
    doc.text(`Sous-total:`, pageWidth - 95, finalY + 10);
    doc.text(
      `${invoice.subtotal.toFixed(2)} TND`,
      pageWidth - 30,
      finalY + 10,
      { align: "right" }
    );

    doc.text(`Taxe:`, pageWidth - 95, finalY + 18);
    doc.text(`${invoice.tax.toFixed(2)} TND`, pageWidth - 30, finalY + 18, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(`TOTAL:`, pageWidth - 95, finalY + 26);
    doc.text(`${invoice.total.toFixed(2)} TND`, pageWidth - 30, finalY + 26, {
      align: "right",
    });

    // --- NOTES ---
    if (invoice.notes) {
      doc.setFillColor(245, 245, 245);
      doc.rect(15, finalY + 35, pageWidth - 30, 20, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...textGray);
      doc.text(`Notes: ${invoice.notes}`, 20, finalY + 45, {
        maxWidth: pageWidth - 40,
      });
    }

    // --- SAUVEGARDE ---
    doc.save(`facture_${invoice.invoiceNumber}.pdf`);
  };

  const columns = [
    {
      title: "Numéro de facture",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      sorter: (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Client",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `${total.toFixed(2)} TND`,
      sorter: (a, b) => a.total - b.total,
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
      filters: [
        { text: "Payé", value: "paid" },
        { text: "Non payé", value: "unpaid" },
        { text: "Partiellement payé", value: "partially_paid" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setVisible(true);
              setrecord(record);
              setAction("EDIT");
            }}
          >
            <EditTwoTone />
          </Button>
          <Button
            onClick={() => {
              // setshow(true);
              // setrecord(record);
              generatePDF(record);
            }}
          >
            <InfoCircleOutlined />
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => showPromiseConfirm(record, record._id)}
          >
            <DeleteTwoTone twoToneColor="#FFFFFF" />
          </Button>
        </Space>
      ),
    },
  ];

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
                <Space>
                  <Input
                    placeholder="Rechercher par numéro ou client"
                    style={{ marginRight: 10, width: 200 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onPressEnter={applyFilters}
                    // suffix={<SearchOutlined onClick={applyFilters} />}
                  />

                  <RangePicker
                    format="DD/MM/YYYY"
                    onChange={(dates) => setDateRange(dates)}
                    value={dateRange}
                  />

                  <Select
                    placeholder="Statut"
                    style={{ width: 150 }}
                    allowClear
                    onChange={(value) => setStatusFilter(value)}
                    value={statusFilter}
                  >
                    <Option value="paid">Payé</Option>
                    <Option value="unpaid">Non payé</Option>
                    <Option value="partially_paid">Partiellement payé</Option>
                  </Select>

                  <Button icon={<FilterOutlined />} onClick={applyFilters}>
                    Appliquer
                  </Button>

                  <Button onClick={resetFilters}>Réinitialiser</Button>

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
                </Space>
              }
            >
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={filterData}
                  pagination={{ pageSize: 10 }}
                  className="ant-border-space"
                  rowKey="_id"
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
      </div>
    </>
  );
};

export default Invoice;
