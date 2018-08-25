$(document).ready(function () {

    var model = tf.sequential();
    var xs = [];
    var ys = [];
    var bineryWords = [];
    var countWord = [];

    function scatter(scatterChartData) {
        console.log(scatterChartData);
    }

    function tableVisible() {
        $('.tableOpen').on('click', function () {
            var table = $(this).attr('table');
            //alert(table);

            if ($(this).attr('status') == 'close') {
                $('.' + table + ' table').show()
                $(this).attr('status', 'open');
            } else {
                $('.' + table + ' table').hide()
                $(this).attr('status', 'close');
            }
            
        return false;
        });
    }
    function getText() {
        var text = $('.text').val();
        var rowText = text.split(".");
        var corpus = [];
        for (var i = 0, max = rowText.length; i < max; i++) {
            corpus[i] = rowText[i].replace(/(\r\n\t|\n|\r\t)/gm, "");
        }

        return corpus;
    }

    function remove_stop_words(corpus) {
        $('.status').append('<div class="remove_stop_words state">remove stop words</div>');
    
        var stop_words = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"];
        var results = [];
        for (var i = 0; i < corpus.length; i++) {
            var res = corpus[i];
            for (var j = 0; j < stop_words.length; j++) {
                res = res.replace(' '+stop_words[j]+' ', ",");
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
                data[sentences[y][x]] = [];
                data[sentences[y][x]][0] = y_achse;
                data[sentences[y][x]][1] = x_achse;
                x_achse++;
            }
            y_achse++;
        }
        return data;
    }

    function countWords(corpus) {
        $('.status').append('<div class="remove_stop_words state">Count words</div>');

        var wordTable = [];
        for (var i = 0; i < corpus.length; i++) {
            for (var j = 0; j < corpus[i].length; j++) {

                if (wordTable[corpus[i][j]] === 1 || wordTable[corpus[i][j]] !== undefined) {
                    wordTable[corpus[i][j]] = wordTable[corpus[i][j]] + 1;
                } else {
                    wordTable[corpus[i][j]] = 1;
                }

            }
        }

        console.log(wordTable);
        return wordTable;
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
        $('.status').append('<div class="oneHot state"><h1>Build oneHot <a class="tableOpen" status="close" table="oneHot" href="#"><i class="fa fa-table" table="oneHot" aria-hidden="true"></i> </a> </h1> <table class="table table-striped"></table></div>');
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
            $('.oneHot table').append(table);
            x++;
        });
        
        tableVisible();
        
        return data;
    }

    function findNeighborWords(sentences, bineryWords) {
        //console.log(sentences);
        $('.status').append('<div class="findNeighborWords state"><h1>find Neighbor Words <a class="tableOpen" status="close" table="findNeighborWords" href="#"><i class="fa fa-table" table="findNeighborWords" aria-hidden="true"></i> </a></h1> <table class="table table-striped"></table></div>');

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
                        $('.findNeighborWords table').append(table);
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

        tableVisible();
        return data;
    }

    hiddenUnits = parseInt($('#hiddenUnits').val());
    activation = $('#activation').val();

    function buildAModule() {

        var encodeNumberLength = 0;
        var corpus = getText();
        var sentences = remove_stop_words(corpus);
        countWord = countWords(sentences);
        var words = uniquWord(sentences);
        bineryWords = oneHot(words);

        var fnw = findNeighborWords(sentences, bineryWords);

        $('.status').append('<div class="remove_stop_words state">Build the Model</div>');

        encodeNumberLength = fnw[0]['wordEncode'].length;
        const hidden = tf.layers.dense({
            units: hiddenUnits, // Number of nodes in the hidden Layer
            inputShape: [encodeNumberLength], // Input Layer with 2 nodes
            activation: activation
        });

        model.add(hidden);

        const output = tf.layers.dense({
            units: encodeNumberLength,
            activation: activation            
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



    function train(epochs) {

        $('.status').append('<div class="learn state">Learn</div>');

        var ctxLoss = document.getElementById('lossfunction').getContext('2d');
        configLoss = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                        label: 'LossFunktion',
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
                                labelString: 'Epochs'
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
        console.log('epochs: '+epochs);

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
                    epochs: epochs 
                });

                configLoss.data.datasets[0].data.push(response.history.loss[0] * 100);
                configLoss.data.labels.push(labls);
                labls++;
                lossChart.update();

                n--;
            },
            end: function () {
                $('.status').append('<div class="learncomplete state">learn complete </div>');
                buildWord2VecChart(model);
            }
        });
    }

    $('.learn').click(function () {
        $('.status').html('');
        buildAModule();
        train($('#epochs').val());
    });

});