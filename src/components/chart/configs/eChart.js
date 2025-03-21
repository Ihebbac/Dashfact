const eChart = {
  series: [
    {
      name: "Total Revenue",
      data: [30], // Add more values as needed (summed totalPrice for each month)
      color: "#fff",
    },
  ],

  options: {
    chart: {
      type: "bar",
      width: "100%",
      height: "auto",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    grid: {
      show: true,
      borderColor: "#ccc",
      strokeDashArray: 2,
    },
    xaxis: {
      categories: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ], // Add more months as needed from orderDate
      labels: {
        show: true,
        align: "right",
        style: { colors: Array(10).fill("#fff") },
      },
    },
    yaxis: {
      labels: {
        show: true,
        align: "right",
        style: { colors: Array(10).fill("#fff") },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "TND " + val; // Changed currency to TND
        },
      },
    },
  },
};
export default eChart;
