'use strict';

// Directive for pie charts, pass in title and data only    
app.directive('hcCustomChart', function () {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            title: '@',
            data: '='
        },
        link: function (scope, element) {
					Highcharts.chart(element[0], {
	        chart: {
	            zoomType: 'x'
	        },
	        title: {
	            text: 'USD to EUR exchange rate over time'
	        },
	        subtitle: {
	            text: document.ontouchstart === undefined ?
	                    'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
	        },
	        xAxis: {
	            type: 'datetime'
	        },
	        yAxis: {
	            title: {
	                text: 'Score'
	            }
	        },
	        legend: {
	            enabled: true
	        },
	        plotOptions: {
	            area: {
	                fillColor: {
	                    linearGradient: {
	                        x1: 0,
	                        y1: 0,
	                        x2: 0,
	                        y2: 1
	                    },
	                    stops: [
	                        [0, Highcharts.getOptions().colors[0]],
	                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
	                    ]
	                },
	                marker: {
	                    radius: 2
	                },
	                lineWidth: 1,
	                states: {
	                    hover: {
	                        lineWidth: 1
	                    }
	                },
	                threshold: null
	            }
	        },

	        series: [{
	            type: 'area',
	            name: title,
	            data: data,
	            pointStart: Date.UTC(2010, 0, 1),
            	pointInterval: 3600 * 1000 // one hour
	        }]
	    });
	  }
  };
})