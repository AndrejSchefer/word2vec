async function train() {
    //console.log('Train');
    await $('.status').append('Learn');

    //await $('.loss').append('')
    for (var i = 1; i < 10; i++) {
        
        const response = await model.fit(tf.tensor2d(xs), tf.tensor2d(ys), {
            shuffle: true,
            epochs: 200, //$('#epoch').val()
        });
        
        //console.log(response.history.loss[0]);
        ///$('.loss').append('<div>' + response.history.loss[0] + '</div>');
        await $('.loss').append(response.history.loss[0] + '<br />');
       
    }
}

$('.learn').click(function () {

    $('.status').html('Learn');
    buildAModule();
    $('.status').html('Learn');

    train().then(function () {
        console.log("training complete");
        $('.status').html('training complete');

        async function myTensorTable(myDiv, myOutTensor, myCols, myTitle) {

            const myOutput = await myOutTensor.data()
        
            x = 1;
            y = 0;
            cord = [];
            cord[y] = [];
            for (myCount = 0; myCount <= myOutTensor.size - 1; myCount++) {
                cord[y][x] = myOutput[myCount];
                x++;
                if (myCount % myCols == myCols - 1) {
                    x = 1;
                    y++;
                    cord[y] = [];
                }
            }
            return cord;
        }
        
        // Get Weights from the HiddenLayer 
        
        w = myTensorTable('test', model.getWeights()[0], 2, 'v ').then(function (data) {
            //console.log(data);
            x = 0;
            var w2b = [];
            for (i in bineryWords) {
                w2b[i] = [];
                w2b[i]['x'] = 0;
                w2b[i]['y'] = 0;

                for (var index = 0, max = data[x].length; index < max; index++) {
                    if (data[x][index] !== undefined) {
                        w2b[i]['x'] = data[x][1];
                        w2b[i]['y'] = data[x][2];
                    }
                }
                x++;
            }

            return w2b;
        });

        c = ['#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'];
        scatterChartData = [];
        w.then(function (data) {
            //console.log(data);
            cx = 0;
            for (i in data) {
                x = data[i]['x'];
                y = data[i]['y'];
                scatterChartData.push({
                    label: i,
                    borderColor: '#000',
                    backgroundColor: c[cx++],
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
    });
});