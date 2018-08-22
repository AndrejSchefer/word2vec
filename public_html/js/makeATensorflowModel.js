var model = tf.sequential();
var xs = [];
var ys = [];
var bineryWords = [];
var countWord = [];

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
    $('.status').append('<div class="remove_stop_words state">remove stop words</div>');
    var stop_words = [
        ' wird ',
        ' eine ',
        ' ein ',
        ' den ',
        ' Der ',
        ' der ',
        ' die ',
        ' von ',
        ' vom ',
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

    //$.each(wordTable, function (word, counter){
    //    console.log(word+' '+counter);
    //});

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
    $('.status').append('<div class="remove_stop_words state">Build oneHot</div>');
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
    $('.status').append('<div class="remove_stop_words state">find Neighbor Words</div>');

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
        units: 100, // Number of nodes in the hidden Layer
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
