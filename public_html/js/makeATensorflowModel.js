var model = tf.sequential();
var xs = [];
var ys = [];
var bineryWords = [];

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
        ' wird ',
        ' eine ',
        ' ein ',
        ' den ',
        ' Der ',
        ' er ',
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
