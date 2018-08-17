var ctx = document.getElementById("canvas").getContext("2d");

var bubbleChartData = {
    datasets: [{
            type: 'bubble',
            label: "set1",
            data: [{
                    x: 10,
                    y: 10,
                    r: 50
                }, {
                    x: 20,
                    y: 5,
                    r: 40
                }],
            backgroundColor: "rgba(26,179,148,0.6)", //green

        }, {
            type: 'bubble',
            label: "set2",
            data: [{
                    x: 14,
                    y: 30,
                    r: 60,
                    //Here is the plugin.
                    keepTooltipOpen: true
                }, {
                    x: 2,
                    y: 5,
                    r: 30
                }],
            backgroundColor: "rgba(255,100,100,0.6)", //red
        }]};

var bubbleChartOptions = {
    scales: {
        yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Y'
                }
            }],
        xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'X'
                }
            }]
    },
    onClick: handleClick
};

var keepTooltipOpenPlugin = {

    beforeRender: function (chart) {

        // We are looking for bubble which owns "keepTooltipOpen" parameter.
        var datasets = chart.data.datasets;
        chart.pluginTooltips = [];
        for (i = 0; i < datasets.length; i++) {
            for (j = 0; j < datasets[i].data.length; j++) {
                if (datasets[i].data[j].keepTooltipOpen && !chart.getDatasetMeta(i).hidden) {
                    //When we find one, we are pushing all informations to create the tooltip.
                    chart.pluginTooltips.push(new Chart.Tooltip({
                        _chart: chart.chart,
                        _chartInstance: chart,
                        _data: chart.data,
                        _options: chart.options.tooltips,
                        _active: [chart.getDatasetMeta(i).data[j]]
                    }, chart));
                }
            }
        }
    }, // end beforeRender

    afterDatasetsDraw: function (chart, easing) {

        // Draw tooltips
        Chart.helpers.each(chart.pluginTooltips, function (tooltip) {
            tooltip.initialize();
            tooltip.update();
            tooltip.pivot();
            tooltip.transition(easing).draw();
        });


    } // end afterDatasetsDraw
}

Chart.pluginService.register(keepTooltipOpenPlugin);

var myBubbleChart = new Chart(ctx, {
    type: 'bubble',
    data: bubbleChartData,
    options: bubbleChartOptions
});

function handleClick(evt) {
    var activeElement = myBubbleChart.getElementAtEvent(evt);
    if (activeElement.length > 0) {
        var values = myBubbleChart.data.datasets[activeElement[0]._datasetIndex].data[activeElement[0]._index];
        if (values.keepTooltipOpen)
            values.keepTooltipOpen = false;
        else
            values.keepTooltipOpen = true;
    }
}
;
