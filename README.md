# Deep Learning Webapp (ml5.js + Express)

This project is a simple web app built with **Node.js**, **Express**, and **ml5.js** to demonstrate deep learning projects for educational purpose. The real-time image classification is using machine learning models directly in the browser. The Feed-Forward Neural Network (FFNN) is to perform regression tasks. The model learns a complex nonlinear function with and without Gaussian noise, and visualizes the results for training, testing, and prediction scenarios.


## 🚀 Features

### Project 1 Image Classifier with MobileNet
- Preloads **6 images** on page load, grouped as:
  - ✅ Correct Classification: 3 images
  - ❌ False Classification: 3 images
- Upload or drag & drop up to **3 images** for instant classification
- Uses **MobileNet** model from `ml5.js` (built on TensorFlow.js)
- Displays:
  - File name
  - Preview image
  - Predicted label and confidence
- Includes a clear/reset button to remove uploaded images

### Project 2 Feed-Forward Neural Network for Regression with TensorFlow
- Implements a deep neural network (DNN) with ReLU activations
- Trains and tests on synthetically generated data based on a custom ground truth polynomial
  - Clean data (200 epochs)
  - Noisy data (300 epochs - best model)
  - Noisy data (1000 epochs - overfitted model)
  - Input layer: 1 neuron
  - Hidden layers: 2 × 100 neurons, ReLU activation
  - Output layer: 1 neuron, linear activation
  - Loss function: Mean Squared Error (MSE)
  - Optimizer: Adam with learning rate 0.01
- Adds configurable Gaussian noise for testing robustness
- Visualizes results using Chart.js
- Demonstrates overfitting, underfitting, and ideal training conditions:
  - Interactive plots for clean and noisy data

## 🧠 Tech Stack

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [EJS](https://ejs.co/) (templating)
- [ml5.js](https://ml5js.org/) – pre-trained ML models
- [TensorFlow.js](https://www.tensorflow.org/js)

## 📸 Demo Use Case

For image classification, you can test the classifier using example images (Mount Fuji, animals, or random objects) to explore how well MobileNet performs, and which types of images it struggles with.

## 🛠️ Setup

```bash
npm install
node app.js