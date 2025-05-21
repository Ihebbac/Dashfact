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
import ClientInvoicesModal from "./Modals/ClientInvoicesModal";
import MagasinIdInvoicesModal from "./Modals/MagasinIdInvoicesModal";
import logo from "../assets/images/LOGO.png";

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

  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchData();
    fetchStore();
    fetchCustomers();
    fetchProducts();
  }, [refetech]);

  const fetchData = () => {
    axios.get("https://rayhanaboutique.online/invoice").then((response) => {
      if (response.data) {
        setSearch("");
        let sorted_obj = _.sortBy(response.data, function (o) {
          return Number(o._id);
        }).filter((el) =>
          user.type === "admin"
            ? true
            : user?.magasinId?.includes(el.magasinId._id)
        );
        setData(sorted_obj);
        setfilterData(sorted_obj);
      } else {
        notification.error({ message: "No Data Found" });
      }
    });
  };

  const fetchCustomers = () => {
    axios.get("https://rayhanaboutique.online/clients").then((response) => {
      setCustomers(response.data);
    });
  };

  const fetchStore = () => {
    axios.get("https://rayhanaboutique.online/magasins").then((response) => {
      setStore(response.data);
    });
  };

  const fetchProducts = () => {
    // if (user.type === "admin") {
    axios.get("https://rayhanaboutique.online/stock").then((response) => {
      setProducts(response.data);
    });
    // } else {
    //   axios
    //     .get("https://rayhanaboutique.online/stock/magasin/" + user?.magasinId[0])
    //     .then((response) => {
    //       setProducts(response.data);
    //     });
    // }
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
          .delete("https://rayhanaboutique.online/invoice/" + dataDelete)
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

    const theme = {
      secondary: [7, 40, 73], // #072849 (dark blue)
      primary: [243, 235, 229], // #F3EBE5 (light beige)

      light: [249, 249, 249], // slightly lighter version of the beige
      gray: [80, 80, 80], // kept original gray
    };

    const {
      invoiceNumber,
      date,
      status,
      customerName,
      customerAddress,
      customerPhone,
      items,
      subtotal,
      tax,
      total,
      notes,
    } = invoice;

    const drawHeader = () => {
      const headerHeight = 40;

      doc.setFillColor(...theme.primary);
      doc.rect(0, 0, pageWidth, headerHeight, "F");
      doc.addImage(logo, "png", 15, 10, 25, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Societe OR - FIN", 45, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("18 Rue El Mofti, Tunis", 45, 25);
      doc.text("Tél: 71 200 090 • MF: 803541/R", 45, 31);

      doc.setFontSize(13);
      doc.text(`FACTURE #${invoiceNumber}`, pageWidth - 15, 18, {
        align: "right",
      });
      doc.setFontSize(11);
      doc.text(
        `Date : ${dayjs(date).format("DD/MM/YYYY")}`,
        pageWidth - 15,
        25,
        { align: "right" }
      );
      // doc.text(`Statut : ${status.toUpperCase()}`, pageWidth - 15, 31, { align: "right" });
    };

    const drawClientBox = () => {
      doc.setFillColor(...theme.light);
      doc.rect(15, 50, pageWidth - 30, 30, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("CLIENT", 20, 58);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(customerName, 20, 65);
      doc.text(customerAddress, 20, 71);
      doc.text(`Tél: ${customerPhone}`, 20, 77);
    };

    const drawSeparator = () => {
      doc.setDrawColor(220);
      doc.setLineWidth(0.2);
      doc.line(15, 85, pageWidth - 15, 85);
    };

    const drawTable = () => {
      const itemsData = items.map((item) => [
        item.reference,
        item.nom,
        item.taille,
        item.quantity,
        `${item.prixVente.toFixed(2)} TND`,
        `${(item.quantity * item.prixVente).toFixed(2)} TND`,
      ]);

      autoTable(doc, {
        startY: 90,
        head: [
          ["Réf.", "Désignation", "Taille", "Qté", "Prix Unitaire", "Total"],
        ],
        body: itemsData,
        theme: "grid",
        headStyles: {
          fillColor: theme.secondary,
          textColor: 255,
          fontStyle: "bold",
          fontSize: 11,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 10,
          valign: "middle",
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 30, halign: "right" },
          5: { cellWidth: 30, halign: "right" },
        },
        styles: {
          lineColor: 230,
          lineWidth: 0.1,
          font: "helvetica",
        },
        margin: { left: 15, right: 15 },
        didDrawPage: drawFooter,
      });
    };

    const drawFooter = (data) => {
      const footerY = pageHeight - 30;
      doc.setFillColor(...theme.primary);
      doc.rect(0, footerY, pageWidth, 30, "F");

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(
        "Merci pour votre confiance. Paiement attendu sous 30 jours.",
        pageWidth / 2,
        footerY + 10,
        { align: "center" }
      );
      doc.text(
        "IBAN: FR76 3000 1000 0100 0000 0000 XXXX • BIC: SOGEFRPP",
        pageWidth / 2,
        footerY + 16,
        { align: "center" }
      );

      doc.setFontSize(8);
    };

    const drawTotals = () => {
      const finalY = doc.lastAutoTable.finalY + 10;
      const totalsHeight = notes ? 50 : 40;
      const totalsWidth = 100;
      const totalsX = pageWidth - totalsWidth - 15;

      doc.setFillColor(...theme.light);
      doc.setDrawColor(...theme.secondary);
      doc.setLineWidth(0.5);
      doc.rect(totalsX, finalY, totalsWidth, totalsHeight, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(...theme.gray);

      const lines = [
        ["Sous-total:", `${subtotal.toFixed(2)} TND`],
        ["Taxe (19%):", `${tax.toFixed(2)} TND`],
        ["Timbre Fiscal:", "1.00 TND"],
      ];

      lines.forEach(([label, value], i) => {
        const y = finalY + 12 + i * 10;
        doc.text(label, totalsX + 5, y);
        doc.text(value, totalsX + totalsWidth - 5, y, { align: "right" });
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("TOTAL:", totalsX + 5, finalY + 45);
      doc.text(
        `${(total + 1).toFixed(2)} TND`,
        totalsX + totalsWidth - 5,
        finalY + 45,
        { align: "right" }
      );

      return finalY + totalsHeight;
    };

    const drawNotes = (yPos) => {
      if (notes) {
        doc.setFillColor(...theme.light);
        doc.rect(15, yPos + 5, pageWidth - 30, 20, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...theme.gray);
        doc.text(`Notes: ${notes}`, 20, yPos + 15, {
          maxWidth: pageWidth - 40,
        });
      }
    };

    // ==== Render All Sections ====
    drawHeader();
    drawClientBox();
    drawSeparator();
    drawTable();
    const afterTotalsY = drawTotals();
    drawNotes(afterTotalsY);

    // ==== Save PDF ====
    doc.save(`facture_${invoiceNumber}.pdf`);
  };

  const generatePDFBCD = (invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const theme = {
      secondary: [7, 40, 73], // #072849 (dark blue)
      primary: [243, 235, 229], // #F3EBE5 (light beige)

      light: [249, 249, 249], // slightly lighter version of the beige
      gray: [80, 80, 80], // kept original gray
    };

    const {
      invoiceNumber,
      date,
      status,
      customerName,
      customerAddress,
      customerPhone,
      items,
      subtotal,
      tax,
      total,
      notes,
    } = invoice;

    const drawHeader = () => {
      const headerHeight = 40;
      doc.setFillColor(...theme.primary);
      doc.rect(0, 0, pageWidth, headerHeight, "F");
      doc.addImage(logo, "png", 15, 10, 25, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Societe OR - FIN", 45, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("18 Rue El Mofti, Tunis", 45, 25);
      doc.text("Tél: 71 200 090", 45, 31);

      doc.setFontSize(13);
      doc.text(`BDC #${invoiceNumber}`, pageWidth - 15, 18, {
        align: "right",
      });
      doc.setFontSize(11);
      doc.text(
        `Date : ${dayjs(date).format("DD/MM/YYYY")}`,
        pageWidth - 15,
        25,
        { align: "right" }
      );
      // doc.text(`Statut : ${status.toUpperCase()}`, pageWidth - 15, 31, { align: "right" });
    };

    const drawClientBox = () => {
      doc.setFillColor(...theme.light);
      doc.rect(15, 50, pageWidth - 30, 30, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("CLIENT", 20, 58);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(customerName, 20, 65);
      doc.text(customerAddress, 20, 71);
      doc.text(`Tél: ${customerPhone}`, 20, 77);
    };

    const drawSeparator = () => {
      doc.setDrawColor(220);
      doc.setLineWidth(0.2);
      doc.line(15, 85, pageWidth - 15, 85);
    };

    const drawTable = () => {
      const itemsData = items.map((item) => [
        item.reference,
        item.nom,
        item.taille,
        item.quantity,
        `${item.prixVente.toFixed(2)} TND`,
        `${(item.quantity * item.prixVente).toFixed(2)} TND`,
      ]);

      autoTable(doc, {
        startY: 90,
        head: [
          ["Réf.", "Désignation", "Taille", "Qté", "Prix Unitaire", "Total"],
        ],
        body: itemsData,
        theme: "grid",
        headStyles: {
          fillColor: theme.secondary,
          textColor: 255,
          fontStyle: "bold",
          fontSize: 11,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 10,
          valign: "middle",
          cellPadding: 4,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 30, halign: "right" },
          5: { cellWidth: 30, halign: "right" },
        },
        styles: {
          lineColor: 230,
          lineWidth: 0.1,
          font: "helvetica",
        },
        margin: { left: 15, right: 15 },
        didDrawPage: drawFooter,
      });
    };

    const drawFooter = (data) => {
      const footerY = pageHeight - 30;
      doc.setFillColor(...theme.primary);
      doc.rect(0, footerY, pageWidth, 30, "F");

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(
        "Merci pour votre confiance. Paiement attendu sous 30 jours.",
        pageWidth / 2,
        footerY + 10,
        { align: "center" }
      );
      // doc.text("IBAN: FR76 3000 1000 0100 0000 0000 XXXX • BIC: SOGEFRPP", pageWidth / 2, footerY + 16, { align: 'center' });

      doc.setFontSize(8);
    };

    const drawTotals = () => {
      const finalY = doc.lastAutoTable.finalY + 10;
      const totalsHeight = notes ? 50 : 40;
      const totalsWidth = 100;
      const totalsX = pageWidth - totalsWidth - 15;

      doc.setFillColor(...theme.light);
      doc.setDrawColor(...theme.secondary);
      doc.setLineWidth(0.5);
      doc.rect(totalsX, finalY, totalsWidth, totalsHeight, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(...theme.gray);

      const lines = [
        ["Sous-total:", `${subtotal.toFixed(2)} TND`],
        // ["Taxe (19%):", `${tax.toFixed(2)} TND`],
        // ["Timbre Fiscal:", "1.00 TND"],
      ];

      lines.forEach(([label, value], i) => {
        const y = finalY + 12 + i * 10;
        doc.text(label, totalsX + 5, y);
        doc.text(value, totalsX + totalsWidth - 5, y, { align: "right" });
      });

      // doc.setFont("helvetica", "bold");
      // doc.setFontSize(14);
      // doc.setTextColor(...theme.primary);
      // doc.text("TOTAL:", totalsX + 5, finalY + 45);
      // doc.text(
      //   `${total.toFixed(2)} TND`,
      //   totalsX + totalsWidth - 5,
      //   finalY + 45,
      //   { align: "right" }
      // );

      return finalY + totalsHeight;
    };

    const drawNotes = (yPos) => {
      if (notes) {
        doc.setFillColor(...theme.light);
        doc.rect(15, yPos + 5, pageWidth - 30, 20, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...theme.gray);
        doc.text(`Notes: ${notes}`, 20, yPos + 15, {
          maxWidth: pageWidth - 40,
        });
      }
    };

    // ==== Render All Sections ====
    drawHeader();
    drawClientBox();
    drawSeparator();
    drawTable();
    const afterTotalsY = drawTotals();
    drawNotes(afterTotalsY);

    // ==== Save PDF ====
    doc.save(`BDC_${invoiceNumber}.pdf`);
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
        const statusConfig = {
          paid: { color: "green", text: "Payé" },
          unpaid: { color: "red", text: "Non payé" },
          partially_paid: { color: "orange", text: "Partiellement payé" },
          cancelled: { color: "gray", text: "Annulé" },
          default: { color: "default", text: status },
        };

        const config = statusConfig[status] || statusConfig.default;
        return <Badge color={config.color} text={config.text} />;
      },
      filters: Object.entries({
        paid: "Payé",
        unpaid: "Non payé",
        partially_paid: "Partiellement payé",
        cancelled: "Annulé",
      }).map(([value, text]) => ({ text, value })),
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              console.log("tttttttt", record);
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
            Facture
          </Button>

          <Button
            onClick={() => {
              // setshow(true);
              // setrecord(record);
              generatePDFBCD(record);
            }}
          >
            BCD
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
                  <Button onClick={() => setModalVisible(true)}>
                    Voir les détails clients
                  </Button>

                  <Button onClick={() => setModalVisible2(true)}>
                    Voir les détails par Magasin
                  </Button>

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

        <ClientInvoicesModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          invoices={data}
        />
        <MagasinIdInvoicesModal
          visible={modalVisible2}
          onCancel={() => setModalVisible2(false)}
          invoices={data}
        />
      </div>
    </>
  );
};

export default Invoice;
