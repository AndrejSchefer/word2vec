
function scatter(scatterChartData) {
    console.log(scatterChartData);
}

function getText() {
    text = $('.text').text();
    var rowText = text.split(".");
    var corpus = [];
    for (var i = 0, max = rowText.length; i < max; i++) {
        corpus[i] = rowText[i].replace(/(\r\n\t|\n|\r\t)/gm, "");
    }

    return corpus;
}

function remove_stop_words(corpus) {
    var stop_words = [
        ' eine ',
        ' ein ',
        ' den ',
        ' Der ',
        ' der ',
        ' in ',
        ' vor ',
        ' vor ',
        ' des ',
        ' aber ',
        ' in ',
        ' den ',
        ' ist ', 
        ' a ', 
        'will', ' be ', ' im', ' der', ' / ', ' mit ', ' aus ', ' dem ', ' und', ' auf ', ' unter '];
    var results = [];
    for (var i = 0; i < corpus.length; i++) {
        var res = corpus[i];
        for (var j = 0; j < stop_words.length; j++) {
            res = res.replace(stop_words[j], ",");
            res = res.replace(",", " ");
        }
        dataW = [];
        $.each(res.split(" "), function (e, v) {
            if (v !== "") {
                dataW.push(v);
            }
        });
        results.push(dataW);
    }
    return results;
}

function makeLabels(sentences) {
    // Y - Achse
    var y_achse = 1;
    var data = [];
    for (var y = 0; y < sentences.length; y++) {
        var x_achse = 1;
        for (var x = 0; x < sentences[y].length; x++) {
            data[sentences[y][x]] = []
            data[sentences[y][x]][0] = y_achse;
            data[sentences[y][x]][1] = x_achse;
            x_achse++
        }
        y_achse++;
    }
    return data;
}

function uniquWord(corpus) {
    var word = [];
    var x = 0;
    for (var i = 0; i < corpus.length; i++) {
        for (var j = 0; j < corpus[i].length; j++) {
            if (word.indexOf(corpus[i][j]) === -1) {
                word[x] = corpus[i][j];
                x++;
            }
        }
    }
    return word;
}

function oneHot(words) {
    var data = [];
    var x = 1;
    $.each(words, function (key, value) {
        data[value] = [];
        data[value]['text'] = value;
        data[value]['tens'] = [];
        for (var i = 1; i <= words.length; i++) {
            if (i === x) {
                data[value]['tens'].push(1);
            } else {
                data[value]['tens'].push(0);
            }
        }
        var table = '<tr><td>' + data[value]['text'] + '</td><td> ' + data[value]['tens'] + '</td></tr>';
        $('.oneHot').append(table);
        x++;
    });
    return data;
}

function findNeighborWords(sentences, bineryWords) {
    //console.log(sentences);    
    var data = [];
    x = 0;
    for (var i = 0; i < sentences.length; i++) {
        for (var idx = 0; idx < sentences[i].length; idx++) {
            word = sentences[i][idx];
            for (var index = 0; index < sentences[i].length; index++) {
                neighbor = sentences[i][index];
                if (word !== neighbor) {
                    data[x] = [];
                    var table = '<tr><td>' + word + '</td><td>' + bineryWords[word]['tens'] + '</td><td>' + neighbor + '</td><td> ' + bineryWords[neighbor]['tens'] + '</td></tr>';
                    $('.data').append(table);
                    data[x]['word'] = word;
                    data[x]['wordEncode'] = bineryWords[word]['tens'];
                    data[x]['neighbor'] = neighbor;
                    data[x]['neighborEncode'] = bineryWords[neighbor]['tens'];
                    //console.log(data[next]);
                    x++;
                }
            }
        }
    }
    //console.log(data);
    return data;
}

var model = tf.sequential();
var xs = [];
var ys = [];
var bineryWords = [];        
function buildAModule() {
    var corpus = getText();
    var sentences = remove_stop_words(corpus);
    var words = uniquWord(sentences);
    bineryWords = oneHot(words);

    var encodeNumberLength = 0;
    /*
     * $.each(bineryWords, function (key, value) {
     console.log(key);
     });
     */
    var fnw = findNeighborWords(sentences, bineryWords);
    console.log(fnw);
    encodeNumberLength = fnw[0]['wordEncode'].length;
    const hidden = tf.layers.dense({
        units: 2, // Number of nodes in the hidden Layer
        inputShape: [encodeNumberLength], // Input Layer with 2 nodes
        activation: "softmax"
    });

    model.add(hidden);

    const output = tf.layers.dense({
        units: encodeNumberLength,
        activation: "softmax"
    });
    model.add(output);
    model.compile({
        loss: 'meanSquaredError',
        optimizer: 'sgd'
    });
    $.each(fnw, function (key, value) {
        xs.push(fnw[key]['wordEncode']);
        ys.push(fnw[key]['neighborEncode']);
    });
}
async function train() {
    console.log('Train');
    for (var i = 1; i < 100; i++) {
        $('.loss').append('test ' + i);
        const response = await model.fit(tf.tensor2d(xs), tf.tensor2d(ys), {
            shuffle: true,
            epochs: 2000 //$('#epoch').val()
        });
        console.log(i);
        console.log(response.history.loss[0]);
        $('.loss').append('<div>' + response.history.loss[0] + '</div>');
    }
}

$('.learn').click(function () {
    
    $('.status').html('Learn');
    buildAModule();
    $('.status').html('Learn');

    train().then(function () {
        console.log("training complete");
        $('.status').html('training complete');

        //var outputPredict = model.predict(tf.tensor2d([[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]));

        async function myTensorTable(myDiv, myOutTensor, myCols, myTitle) {

            const myOutput = await myOutTensor.data()
            var wordCord = [];
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

        c = ['#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8']
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
                        text: 'Chart.js Scatter Chart'
                    },
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