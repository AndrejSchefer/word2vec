function dimensionReduction(data) {
    var opt = {};
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    // initialize data
    tsne.initDataDist(data);

    for (var k = 0; k < 1000; k++) {
        tsne.step(); // every time you call this, solution gets better
    }

    return tsne.getSolution(); // Y is an array of 2-D points that you can plot

}
function buildWord2VecChart(model) {

    async function myTensorTable(myDiv, myOutTensor, myCols, myTitle) {
        const myOutput = await myOutTensor.data()

        x = 0;
        y = 0;
        cord = [];
        cord[y] = [];
        for (myCount = 0; myCount <= myOutTensor.size - 1; myCount++) {
            cord[y][x] = myOutput[myCount];
            x++;
            if (myCount % myCols == myCols - 1) {
                x = 0;
                y++;
                cord[y] = [];
            }
        }
        return cord;
    }

    // Get Weights from the HiddenLayer
    w = myTensorTable('test', model.getWeights()[0], 100, 'v ').then(function (data) {

        // Dimension Reduction with t-SNE
        var Y = dimensionReduction(data);

        x = 0;
        var w2b = [];
        for (i in bineryWords) {
            w2b[i] = [];
            w2b[i]['x'] = 0;
            w2b[i]['y'] = 0;

            for (var index = 0, max = Y[x].length; index < max; index++) {
                if (data[x][index] !== undefined) {
                    w2b[i]['x'] = Y[x][0];
                    w2b[i]['y'] = Y[x][1];
                }
            }
            x++;
        }

        return w2b;
    });

    //c = ['#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'];
    scatterChartData = [];
    w.then(function (data) {
        for (i in data) {
            var hue = Math.floor(Math.random() * (360 - 240 + 1)) + 240;
            var light = Math.floor(Math.random() * (70 - 25 + 1)) + 25;
            var color = 'hsl(' + hue + ', 60%, ' + light + '%)';
            x = data[i]['x'];
            y = data[i]['y'];
            scatterChartData.push({
                label: i,
                borderColor: '#000',
                //backgroundColor: c[cx++],
                backgroundColor: color,
                data: [{
                        x: x,
                        y: y,
                        r: 13,
                        keepTooltipOpen: true
                    }]
            });
        }

        console.log(scatterChartData);
        var ctx = document.getElementById('canvas').getContext('2d');
        Chart.Bubble(ctx, {
            data: {
                datasets: scatterChartData
            },
            options: {
                title: {
                    display: true,
                    text: 'word2vac Charts'
                }
            }
        });
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
    });
}



function train() {

    $('.status').append('<div class="learn state">Learn</div>');

    var ctxLoss = document.getElementById('lossfunction').getContext('2d');
    configLoss = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                    label: 'My First dataset',
                    borderColor: "red",
                    data: [],
                    fill: false
                }]
        },
        options: {
            scales: {
                xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Month'
                        }
                    }],
                yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
            }
        }
    };
    console.log(configLoss);

    var lossChart = new Chart(ctxLoss, configLoss);


    var n = 100;
    var labls = 0;
    var losses = [];


    jQuery.whileAsync({
        delay: 100,
        bulk: 0,
        test: function () {
            return n > 0
        },
        loop: async function (index, value) {
            const response = await model.fit(tf.tensor2d(xs), tf.tensor2d(ys), {
                shuffle: true,
                epochs: 1000 //$('#epoch').val()
            });


   //         configLoss.data.datasets[0].data.push(response.history.loss[0]);
            configLoss.data.datasets[0].data.push(response.history.loss[0]*100);
            configLoss.data.labels.push(labls);
            labls++;
            lossChart.update();

            //$('.loss').append('<div>' + response.history.loss[0] + '</div>');
            //losses.push(response.history.loss[0]);
            //lossChart.addData([n], n);
            //lossChart.data.datasets.data.push(n); //.data.datasets.push(response.history.loss[0]);
            //lossChart.data.labels.push(n); //.data.datasets.push(response.history.loss[0]);
            //lossChart.update();
            n--;
        },
        end: function () {
            $('.status').append('<div class="learncomplete state">learn complete </div>');
            buildWord2VecChart(model);
        }
    });
}


$('.learn').click(function () {
    buildAModule();
    train();
});
