import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Typography } from "antd";
import moment from "moment";

const { Title, Paragraph } = Typography;

function EChartMarge({ invoices, viewMode = "monthly", yearFilter = null }) {
  const [chartOptions, setChartOptions] = useState({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: "55%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        type: "category",
      },
      yaxis: {
        title: {
          text: "Montant (TND)",
        },
      },
      title: {
        text: "Analyse Marge",
        align: "left",
      },
      colors: ["#1890ff", "#52c41a"],
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toFixed(2);
          },
        },
      },
    },
  });

  useEffect(() => {
    if (!invoices || invoices.length === 0) return;

    const processData = () => {
      try {
        // Filtrer par année si spécifiée
        const filteredInvoices = yearFilter
          ? invoices.filter((inv) => moment(inv.date).year() === yearFilter)
          : invoices;

        if (viewMode === "monthly") {
          // Vue monthlyle
          const months = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
          ];
          const monthlyData = months.map((month, index) => {
            const monthInvoices = filteredInvoices.filter(
              (inv) => moment(inv.date).month() === index
            );

            const total = monthInvoices.reduce(
              (sum, inv) => sum + inv.totalMarge,
              0
            );
            const count = monthInvoices.length;

            return {
              month: month.substring(0, 3), // Nom court du mois
              total: parseFloat(total.toFixed(2)),
              count,
            };
          });

          return {
            categories: monthlyData.map((d) => d.month),
            series: [
              {
                name: "Montant Total",
                data: monthlyData.map((d) => d.total),
              }
            ],
          };
        } else if (viewMode === "yearly") {
          // Comparaison yearlyle
          const years = [
            ...new Set(invoices.map((inv) => moment(inv.date).year())),
          ].sort();

          const yearlyData = years.map((year) => {
            const yearInvoices = invoices.filter(
              (inv) => moment(inv.date).year() === year
            );

            const total = yearInvoices.reduce((sum, inv) => sum + inv.total, 0);
            const count = yearInvoices.length;

            return {
              year: year.toString(),
              total: parseFloat(total.toFixed(2)),
              count,
            };
          });

          return {
            categories: yearlyData?.map((d) => d.year),
            series: [
              {
                name: "Montant Total",
                data: yearlyData.map((d) => d.total),
              }
            ],
          };
        }
      } catch (error) {
        console.error("Erreur de traitement des données:", error);
        return { categories: [], series: [] };
      }
    };

    const { categories, series } = processData();

    setChartOptions((prev) => ({
      ...prev,
      series: series ?? [],
      options: {
        ...prev.options,
        chart: {
          ...prev.options.chart,
          type: viewMode === "yearly" ? "bar" : "bar",
        },
        xaxis: {
          ...prev.options.xaxis,
          categories: categories ?? [],
        },
        title: {
          ...prev.options.title,
          text:
            viewMode === "yearly"
              ? `Comparaison yearlyle des Factures ${
                  yearFilter ? `(Filtré: ${yearFilter})` : ""
                }`
              : `Analyse monthlyle des Factures ${
                  yearFilter ? `(Année: ${yearFilter})` : ""
                }`,
        },
      },
    }));
  }, [invoices, viewMode, yearFilter]);

  return (
    <div id="chart">
      <ReactApexChart
        options={chartOptions.options}
        series={chartOptions.series}
        type={chartOptions.options.chart.type}
        height={400}
      />
    </div>
  );
}

export default EChartMarge;