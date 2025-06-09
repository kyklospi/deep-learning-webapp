let model, wordIndex = {}, indexWord = {}, totalWords, seqLength = 20;
let autoMode = false, autoInterval;
let chart;

document.getElementById('predictBtn').onclick = async () => {
  showSpinner();
  await trainModel();
  await predictWords();
  hideSpinner();
};

document.getElementById('continueBtn').onclick = async () => {
  showSpinner();
  await continueWithWord();
  hideSpinner();
};

document.getElementById('autoBtn').onclick = () => {
  autoMode = true;
  autoInterval = setInterval(async () => {
    if (!autoMode) return;
    await continueWithWord();
  }, 500);
};

document.getElementById('stopBtn').onclick = () => {
  autoMode = false;
  clearInterval(autoInterval);
};

document.getElementById('resetBtn').onclick = () => {
  document.getElementById('inputText').value = '';
  document.getElementById('predictions').innerHTML = '';
  document.getElementById('perplexity').innerHTML = '';
  if (chart) chart.destroy();
};

async function trainModel() {
    const seqLength = 20;
    const rawText = document.getElementById('inputText').value.toLowerCase();
    const words = rawText.trim().split(/\s+/);
    const vocab = [...new Set(words)];

    wordIndex = Object.fromEntries(vocab.map((w, i) => [w, i + 1]));
    indexWord = Object.fromEntries(Object.entries(wordIndex).map(([k, v]) => [v, k]));
    totalWords = vocab.length + 1;

    const sequences = [];
    for (let i = 0; i < words.length - seqLength; i++) {
        const inputSeq = words.slice(i, i + seqLength).map(w => wordIndex[w] || 0);
        const label = wordIndex[words[i + seqLength]] || 0;
        sequences.push({ input: inputSeq, label });
    }

    if (sequences.length < 1) {
        alert("Not enough text to train.");
        return;
    }

    const xs = tf.tensor2d(sequences.map(s => s.input));
    const ys = tf.oneHot(sequences.map(s => s.label), totalWords);

    model = tf.sequential();
    model.add(tf.layers.embedding({ inputDim: totalWords, outputDim: 100, inputLength: seqLength }));
    model.add(tf.layers.lstm({ units: 100, returnSequences: true }));
    model.add(tf.layers.lstm({ units: 100 }));
    model.add(tf.layers.dense({ units: totalWords, activation: 'softmax' }));

    model.compile({
        loss: 'categoricalCrossentropy',
        optimizer: tf.train.adam(0.01),
        metrics: ['accuracy']
    });

    initChart();

    await model.fit(xs, ys, {
        epochs: 10,
        batchSize: 32,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                updateChart(epoch + 1, logs.loss, logs.acc);
            }
        }
    });

    await evaluateTopK(sequences);

    const evalLoss = await model.evaluate(xs, ys);
    const loss = (await evalLoss[0].data())[0];
    const perplexity = Math.exp(loss);

    document.getElementById('perplexity').textContent = `Perplexity: ${perplexity.toFixed(2)}`;
}

function padSequence(seq, maxLen) {
  const padded = Array(maxLen).fill(0);
  padded.splice(-seq.length, seq.length, ...seq);
  return padded;
}

async function predictWords() {
  const inputText = document.getElementById('inputText').value.toLowerCase();
  const tokens = inputText.trim().split(/\s+/);
  if (tokens.length < seqLength || !model) return;

  const sequence = tokens.slice(-seqLength).map(w => wordIndex[w] || 0);
  const paddedSeq = padSequence(sequence, seqLength);
  const input = tf.tensor([paddedSeq]);
  const prediction = model.predict(input);
  const probs = await prediction.data();

  const results = [...probs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([i, prob]) => ({
      word: indexWord[i] || '[UNK]',
      prob
    }));

  renderPredictions(results);
}

async function continueWithWord() {
  const inputText = document.getElementById('inputText').value;
  const tokens = inputText.trim().split(/\s+/);
  if (tokens.length < seqLength) return;

  const sequence = tokens.slice(-seqLength).map(w => wordIndex[w] || 0);
  const paddedSeq = padSequence(sequence, seqLength);
  const input = tf.tensor([paddedSeq]);
  const prediction = model.predict(input);
  const probs = await prediction.data();
  const topIndex = probs.indexOf(Math.max(...probs));
  const topWord = indexWord[topIndex] || '[UNK]';

  document.getElementById('inputText').value += ' ' + topWord;

  if (!autoMode) {
    await predictWords();
  }
}

function renderPredictions(predictions) {
  const container = document.getElementById('predictions');
  container.innerHTML = '';
  predictions.forEach(p => {
    const btn = document.createElement('button');
    btn.textContent = `${p.word} (${(p.prob * 100).toFixed(2)}%)`;
    btn.onclick = () => {
      document.getElementById('inputText').value += ' ' + p.word;
      predictWords();
    };
    container.appendChild(btn);
  });
}

function initChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Loss',
          borderColor: 'red',
          data: [],
          fill: false
        },
        {
          label: 'Accuracy',
          borderColor: 'green',
          data: [],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        x: { title: { display: true, text: 'Epoch' } },
        y: { beginAtZero: true }
      }
    }
  });
}

function updateChart(epoch, loss, acc) {
  chart.data.labels.push(epoch);
  chart.data.datasets[0].data.push(loss);
  chart.data.datasets[1].data.push(acc);
  chart.update();
}

async function evaluateTopK(sequences, kVals = [1, 5, 10, 20, 100]) {
  const total = sequences.length;
  const correctCounts = {};
  kVals.forEach(k => correctCounts[k] = 0);

  for (let i = 0; i < total; i++) {
    const { input, label } = sequences[i];
    const padded = padSequence(input, seqLength);
    const inputTensor = tf.tensor([padded]);

    const prediction = model.predict(inputTensor);
    const probs = await prediction.data();
    prediction.dispose();
    inputTensor.dispose();

    const sortedIndices = Array.from(probs)
      .map((p, i) => [i, p])
      .sort((a, b) => b[1] - a[1])
      .map(pair => pair[0]);

    kVals.forEach(k => {
      if (sortedIndices.slice(0, k).includes(label)) {
        correctCounts[k]++;
      }
    });
  }

  // Calculate accuracy
  const topKAccuracies = kVals.map(k => ({
    k,
    accuracy: (correctCounts[k] / total * 100).toFixed(2)
  }));
  
  renderTopKChart(topKAccuracies);
}

function renderTopKChart(data) {
  const ctx = document.getElementById('topkChart').getContext('2d');

  if (window.topkChartInstance) window.topkChartInstance.destroy();

  window.topkChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => `Top-${d.k}`),
      datasets: [{
        label: 'Accuracy (%)',
        data: data.map(d => d.accuracy),
        backgroundColor: '#5969b6'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Accuracy (%)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Top-k Accuracy Evaluation'
        }
      }
    }
  });
}

function showSpinner() {
  document.getElementById('loadingSpinner').style.display = 'block';
}

function hideSpinner() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

