// colors
var blue = '#5E81F4';
var gray = '#8181A5';
var yellow = '#F4BE5E';
var green = '#7CE7AC';
var red = '#FF808B';
var purple = '#9698D6';
var turquoise = '#2CE5F6';
var borderColor = '#F0F0F3';

// charts
Apex.chart = {
  fontFamily: 'Lato, sans-serif',
  fontSize: 14,
  foreColor: gray
};

// charts history area
(function(){
  var options = {
    labels: [...Array(7).keys()].map(n => `2018-09-0${n+1}`),
    series: [{
      name: 'Sales',
      data: [31, 40, 28, 51, 42, 109, 100]
    }, {
      name: 'Profit',
      data: [11, 32, 45, 32, 34, 52, 41]
    }],
    colors:[blue, green],
    chart: {
      height: 140,
      type: 'area',
      sparkline: {
        enabled: true
      }
    },
    stroke: {
      curve: 'smooth'
    }
  };

  var chart = document.querySelector('#chart-history-area');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// charts history bar
(function(){
  var options = {
    labels: [...Array(7).keys()].map(n => `2018-09-0${n+1}`),
    series: [{
      name: 'Sales',
      data: [31, 40, 28, 51, 42, 109, 100]
    }, {
      name: 'Profit',
      data: [11, 32, 45, 32, 34, 52, 41]
    }],
    colors:[blue, green],
    chart: {
      height: 140,
      type: 'bar',
      sparkline: {
        enabled: true
      }
    },
    stroke: {
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        endingShape: 'rounded',
        columnWidth: '20%'
      }
    }
  };

  var chart = document.querySelector('#chart-history-bar');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// sparklines
(function(){
  var randomizeArray = function (arg) {
    var array = arg.slice();
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  // data for the sparklines that appear below header area
  var sparklineData = [7, 5, 4, 8, 6, 4, 3];

  var sparkOptions1 = {
    chart: {
      group: 'sparklines',
      type: 'line',
      height: 60,
      sparkline: {
        enabled: true
      },
    },
    fill: {
      opacity: 1,
    },
    series: [{
      name: 'Sales',
      data: randomizeArray(sparklineData)
    }],
    labels: [...Array(7).keys()].map(n => `2018-09-0${n+1}`),
    yaxis: {
      min: 0
    },
    xaxis: {
      type: 'datetime',
    },
    colors: [blue],
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: 'topRight',
        offsetX: 0,
        offsetY: 60,
      },
    }
  }

  var sparkOptions2 = {
    chart: {
      group: 'sparklines',
      type: 'line',
      height: 60,
      sparkline: {
        enabled: true
      },
    },
    fill: {
      opacity: 1,
    },
    series: [{
      name: 'Sales',
      data: randomizeArray(sparklineData)
    }],
    labels: [...Array(7).keys()].map(n => `2018-09-0${n+1}`),
    yaxis: {
      min: 0
    },
    xaxis: {
      type: 'datetime',
    },
    colors: [red],
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: 'topRight',
        offsetX: 0,
        offsetY: 60,
      },
    }
  }

  var sparkOptions3 = {
    chart: {
      group: 'sparklines',
      type: 'line',
      height: 60,
      sparkline: {
        enabled: true
      },
    },
    fill: {
      opacity: 1,
    },
    series: [{
      name: 'Sales',
      data: randomizeArray(sparklineData)
    }],
    labels: [...Array(7).keys()].map(n => `2018-09-0${n+1}`),
    yaxis: {
      min: 0
    },
    xaxis: {
      type: 'datetime',
    },
    colors: [green],
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    tooltip: {
      fixed: {
        enabled: true,
        position: 'topRight',
        offsetX: 0,
        offsetY: 60,
      },
    }
  }

  var spark1 = document.querySelector('#spark-1');
  var spark2 = document.querySelector('#spark-2');
  var spark3 = document.querySelector('#spark-3');

  if (spark1 != null) {
    new ApexCharts(spark1, sparkOptions1).render();
  }

  if (spark2 != null) {
    new ApexCharts(spark2, sparkOptions2).render();
  }

  if (spark3 != null) {
    new ApexCharts(spark3, sparkOptions3).render();
  }
}());

// charts orders
(function(){
  var options = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    series: [{
      name: 'Sales',
      data: [31, 40, 28, 51, 42, 109, 100, 89, 43, 32, 24, 11]
    }, {
      name: 'Profit',
      data: [11, 32, 45, 32, 34, 52, 41, 78, 89, 100, 70, 65]
    }],
    colors:[blue, green],
    chart: {
      height: '100%',
      type: 'area',
      toolbar: {
        show: false
      }
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },  
      yaxis: {
        lines: {
          show: false
        }
      },  
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    yaxis: {
      show: false
    },
    xaxis: {
      axisBorder: {
        color: borderColor
      },
      axisTicks: {
        show: false
      },
      tooltip: {
        enabled: false
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.2,
      }
    }
  };

  var chart = document.querySelector('#chart-orders');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// charts planned income
(function(){
  var options = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    series: [{
      name: 'Profit',
      data: [11, 32, 45, 32, 34]
    }],
    colors:[purple],
    chart: {
      height: '100%',
      type: 'area',
      toolbar: {
        show: false
      }
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },  
      yaxis: {
        lines: {
          show: false
        }
      },  
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    yaxis: {
      show: false
    },
    xaxis: {
      axisBorder: {
        color: borderColor
      },
      axisTicks: {
        show: false
      },
      tooltip: {
        enabled: false
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.2,
      }
    },
    annotations: {
      points: [{
        x: "Mar",
        y: 45,
        marker: {
          fillColor: "#9698D6",
          strokeColor: "#9698D6",
          size: 4,
        },
        label: {
          borderColor: purple,
          text: 'Now',
          style: {
            background: purple,
            color: '#fff'
          }
        }
      }]
    }
  };

  var chart = document.querySelector('#chart-planned-income');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// charts your sales
(function(){
  var options = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Mar'],
    series: [{
      name: 'Profit',
      data: [51, 42, 45, 32, 34, 45]
    }],
    colors:[blue],
    chart: {
      height: '100%',
      type: 'area',
      toolbar: {
        show: false
      }
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },  
      yaxis: {
        lines: {
          show: false
        }
      },  
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    yaxis: {
      show: false
    },
    xaxis: {
      axisBorder: {
        color: borderColor
      },
      axisTicks: {
        show: false
      },
      tooltip: {
        enabled: false
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.2,
      }
    }
  };

  var chart = document.querySelector('#chart-your-sales');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// donut
(function(){
  var options = {
    series: [44, 55, 41, 17],
    colors: [blue, yellow, red, green], 
    labels: ['Marketing Channels', 'Offline Channels', 'Direct Sales', 'Other Channels'],
    chart: {
      type: 'donut',
      height: '100%',
      size: '100%'
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value + "%";
        }
      }
    }
  };

  var chart = document.querySelector('#chart-income-breakdown');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// charts income details
(function(){
  var options = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Mar'],
    series: [{
      name: 'Profit',
      data: [26, 28, 32, 31, 25, 24]
    }],
    colors:[green],
    chart: {
      height: '100%',
      type: 'area',
      toolbar: {
        show: false
      }
    },
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },  
      yaxis: {
        lines: {
          show: false
        }
      },  
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    yaxis: {
      show: false
    },
    xaxis: {
      labels: {
        show: false
      },
      axisBorder: {
        color: 'transparent'
      },
      axisTicks: {
        show: false
      },
      tooltip: {
        enabled: false
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.2,
      }
    }
  };

  var chart = document.querySelector('#chart-income-details');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// charts bar
(function(){
  var options = {
    labels: [...Array(7).keys()].map(n => `2018-09-0${n+1}`),
    series: [{
      name: 'Sales',
      data: [31, 40, 28, 51, 42, 109, 100]
    }, {
      name: 'Profit',
      data: [11, 32, 45, 32, 34, 52, 41]
    }],
    colors:[blue, green],
    chart: {
      height: '100%',
      type: 'bar',
      sparkline: {
        enabled: true
      }
    },
    stroke: {
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        endingShape: 'rounded',
        columnWidth: '20%'
      }
    }
  };

  var chart = document.querySelector('#chart-bar');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());

// radial bar
(function(){
  var options = {
    series: [44, 55, 41, 17],
    colors: [blue, yellow, red, green], 
    labels: ['Marketing', 'Offline', 'Direct', 'Other'],
    chart: {
      type: 'radialBar',
      height: '100%',
      size: '100%'
    },
    legend: {
      show: false
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value + "%";
        }
      }
    }
  };

  var chart = document.querySelector('#chart-radial-bar');
  if (chart != null) {
    new ApexCharts(chart, options).render();
  }
}());