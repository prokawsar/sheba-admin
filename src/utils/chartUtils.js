const themeColors = [
  '#1B998B', '#D7263D', '#F46036', '#E2C044', '#C5D86D', '#03A9F4'
]

export function stackedColumnOptions(xAxis, tickAmount) {
  return {
    chart: {
      type: 'bar',
      stacked: true,
      dropShadow: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      events:{
        dataPointSelection: function(){}
      }
    },
    fill: {
      opacity: 1
    },
    colors: themeColors,
    states: {
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    grid: {
      borderColor: '#222835',
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 5,
      shape: "circle"
    },
    plotOptions: {
      bar: {
        horizontal: false
      },
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      x: {
        show: false
      },
      y: [
        {},
        {
          formatter: undefined
        }
      ],
      fixed: {
        enabled: true,
        position: 'topLeft',
        offsetY: 5,
        offsetX: 25
      },
    },
    xaxis: {
      //type: 'datetime',
      categories: xAxis,
      axisTicks: {
        show: false
      },
      axisBorder:{
        show:false
      },
      labels:{
        style:{
          colors: '#fff'
        }
      }
    },
    yaxis: {
      tickAmount,
      decimalsInFloat: 0,
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true
      },
      labels: {
        show: true,
        style: {
          color: '#fff'
        }
      }
    },
    stroke: {
      width: 0,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        useSeriesColors: true
      },
      markers: {
        size: 3,
        shape: "circle"
      },
    }
  }
}

export function lineChartOptions(xAxis, yAxis, is_sparkline){
  var opts = barChartOptions(xAxis, yAxis, is_sparkline);
  opts.chart.type = 'line';
  opts.stroke.width = 3;

  if(is_sparkline){
    opts.tooltip.fixed = {
      enabled: true,
      position: 'topLeft',
      offsetY: -25,
      offsetX: 0
    }
  }

  return opts;
}

export function barChartOptions(xAxis, yAxis, is_sparkline){
  return {
    chart: {
      type: 'bar',
      stacked: false,
      dropShadow: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      sparkline:{
        enabled: is_sparkline ? true : false
      }
    },
    colors: themeColors,
    fill: {
      opacity: 1
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    grid: {
      clipMarkers: false,
      borderColor: '#222835',
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 1,
      shape: "circle"
    },
    plotOptions: {
      bar: {
        horizontal: false
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        show: is_sparkline ? true : false
      },
      y: [
        {},
        {
          formatter: undefined
        }
      ],
      fixed: {
        enabled: true,
        position: 'topLeft',
        offsetY: 5,
        offsetX: 25
      },
      theme: 'dark'
    },
    xaxis: {
      categories: xAxis,
      axisBorder:{
        show: false
      },
      axisTicks:{
        show: false
      },
      labels:{
        style:{
          colors: '#fff'
        }
      }
    },
    yaxis: yAxis,
    stroke: {
      width: [0, 0, 2],
      curve: 'smooth'
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        useSeriesColors: true
      },
      markers: {
        size: 3,
        shape: "circle"
      },
    }
  }
}

export function normalizeBarChartData(sets, data, isMixed) {
  let _sets = sets || [],
    result = [];
  _sets.forEach((element, idx) => {
    let obj = {
      name: element,
      type: (isMixed && idx > 1) ? 'line' : 'column',
      data: data[idx] || []
    }

    result.push(obj);
  });

  return result;
}

export function normalizeLineChartData(sets, data) {
  let _sets = sets || [],
    result = [];
  _sets.forEach((element, idx) => {
    let obj = {
      name: element,
      type: 'line',
      data: data[idx] || []
    }

    result.push(obj);
  });

  return result;
}

export function setsToYAxes(sets, formatters, tickAmount){
  let _sets = sets || [],
    result = [],
    commonSeriesName = '';
  _sets.forEach((element, idx) => {
    if (idx < 3) {
      let obj = {
        floating: false,
        opposite: false,
        seriesName: element,
        tickAmount,
        decimalsInFloat: 0,
        axisBorder: {
          show: true,
        },
        axisTicks: {
          show: true
        },
        labels: {
          show: true,
          formatter: (v) => v
        }
      };
      if (idx == 0) {
        commonSeriesName = obj.seriesName;
      }
      if (idx == 2) {
        obj.opposite = true;
      }
      if (idx == 1) {
        obj.seriesName = commonSeriesName;
        obj.floating = true;
        obj.axisBorder.show = false;
        obj.axisTicks.show = false;
        obj.labels.show = false;
      }

      if (typeof formatters[idx] != 'undefined' && formatters[idx]) {
        obj.labels.formatter = formatters[idx];
      }

      result.push(obj);
    }
  });

  return result;
}

export function setsToSingleAxis(tickAmount, formatter){
  let obj = {
    tickAmount,
    decimalsInFloat: 0,
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: true
    },
    labels: {
      show: true,
      style: {
        color: '#fff'
      },
      formatter: formatter || undefined,
    }
  }

  return obj;
}