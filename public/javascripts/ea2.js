
const N = 100
const VARIANCE = 0.05

function groundTruth(x) {
    return 0.5 * (x+0.8) * (x+1.8) * (x-0.2) * (x-0.3) * (x-1.9) + 1;
}

function addGaussianNoise(y, stdDev = Math.sqrt(VARIANCE)) {
    return y + tf.randomNormal([1], 0, stdDev).arraySync()[0];
}

// Generate N=100 evenly distributed random values x in the interval [-2,2]
function generateData(noise = false) {
    const xValues = Array.from({ length: N }, () => Math.random() * 4 - 2);
    xValues.sort((a, b) => a - b);
    const yValues = xValues.map(x => groundTruth(x));

    // Combine and mix the values randomly
    const combined = xValues.map((x,i) => ({x, y: yValues[i] }));
    tf.util.shuffle(combined);

    // Divide values into 2 data sets
    const trainSize = N / 2;
    const trainData = combined.slice(0, trainSize);
    const testData = combined.slice(trainSize);

    const addNoiseIfNeeded = ({ x, y }) => ({ x, y: noise ? addGaussianNoise(y) : y });

    return {
        train: trainData.map(addNoiseIfNeeded),
        test: testData.map(addNoiseIfNeeded)
    };
}

// Save data
function saveDataToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Load data
function loadDataFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function buildModel() {
    const model = tf.sequential();
    // Activation function ReLU with 100 Neurons
    model.add(tf.layers.dense({ units: 100, activation: 'relu', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 100, activation: 'relu'}));
    // 1 Neuron Activation function: linear output
    model.add(tf.layers.dense({ units: 1 }));
    // Adam Learning rate = 0.01 and optimizer
    model.compile({ optimizer: tf.train.adam(0.01), loss: 'meanSquaredError' });
    return model;
}

// Training function
async function trainModel(model, trainData, epochs) {
    const xTrain = tf.tensor2d(trainData.map(p => [p.x]));
    const yTrain = tf.tensor2d(trainData.map(p => [p.y]));

    const history = await model.fit(xTrain, yTrain, {
        batchSize: 32,
        epochs,
        shuffle: true
    });

    const finalLoss = history.history.loss.pop().toFixed(4);

    xTrain.dispose();
    yTrain.dispose();
    return finalLoss;
}

// Save/load model in browser
async function saveModel(name, model) {
    await model.save(`localstorage://${name}`);
}

async function loadModel(name) {
    return await tf.loadLayersModel(`localstorage://${name}`);
}

function createChart(canvasId, dataPoints, predictions = null, labelY = 'y') {
    const ctx = document.getElementById(canvasId);
    const config = {
        type: 'scatter',
        data: {
            datasets: [
                dataPoints.train && dataPoints.train.length && {
                    label: 'Train',
                    data: dataPoints.train,
                    backgroundColor: 'blue'
                },
                dataPoints.test && dataPoints.test.length && {
                    label: 'Test',
                    data: dataPoints.test,
                    backgroundColor: 'green'
                },
                predictions && predictions.length && {
                    type: 'line',
                    label: 'Prediction',
                    data: predictions,
                    borderColor: 'red',
                    fill: false,
                    showLine: true,
                    tension: 0.1
                }
            ].filter(Boolean)
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'x' } },
                y: { title: { display: true, text: labelY } }
            }
        }
    };
    new Chart(ctx, config);
}

async function run() {
    const cleanData = generateData(false);
    const noisyData = generateData(true);

    createChart('chartClean', cleanData);
    createChart('chartNoisy', noisyData);

    // Train model on clean data
    const cleanModel = buildModel();
    await trainModel(cleanModel, cleanData.train, 200);
    plotPrediction(cleanModel, cleanData, 'chartCleanTrain', true);
    plotPrediction(cleanModel, cleanData, 'chartCleanTest', false);
    
    // Best model on noisy data (small Epochs)
    const bestModel = buildModel();
    await trainModel(bestModel, noisyData.train, 300);
    plotPrediction(bestModel, noisyData, 'chartBestTrain', true);
    plotPrediction(bestModel, noisyData, 'chartBestTest', false);

    // Overfit model (large Epochs)
    const overfitModel = buildModel();
    await trainModel(overfitModel, noisyData.train, 1000);
    plotPrediction(overfitModel, noisyData, 'chartOverfitTrain', true);
    plotPrediction(overfitModel, noisyData, 'chartOverfitTest', false);
}

async function plotPrediction(model, dataset, canvasId, isTrain) {
    // Smooth X-Values for a clean curve
    const smoothX = Array.from({ length: 200 }, (_, i) => -2 + i * (4 / 199));
    const xSmoothTensor = tf.tensor2d(smoothX.map(x => [x]));
    const ySmoothPred = await model.predict(xSmoothTensor).array();
    const predictionLine = smoothX.map((x, i) => ({ x, y: ySmoothPred[i][0] }));

    // Real Datapoints (Train or Test)
    const points = isTrain ? dataset.train : dataset.test;
    const chartData = isTrain ? { train: points, test: [] } : { train: [], test: points };

    // Prediction on real Datenpoints for Loss calculation
    const xRealTensor = tf.tensor2d(points.map(p => [p.x]));
    const yReal = tf.tensor1d(points.map(p => p.y));
    const yPred = await model.predict(xRealTensor).array();
    const yPredTensor = tf.tensor1d(yPred.map(p => p[0]));

    // Loss calculation
    const loss = tf.losses.meanSquaredError(yReal, yPredTensor).arraySync().toFixed(4);

    // Create diagram
    createChart(canvasId, chartData, predictionLine);

    // Insert Loss under Chart
    const lossElement = document.createElement('div');
    lossElement.innerText = `MSE Loss: ${loss}`;
    document.getElementById(canvasId).parentElement.appendChild(lossElement);

    // Clean-up
    xSmoothTensor.dispose();
    xRealTensor.dispose();
    yReal.dispose();
    yPredTensor.dispose();
}

window.addEventListener('DOMContentLoaded', () => {
    run();
});

