# Deep Learning Image Classifier (ml5.js + Express)

This project is a simple web app built with **Node.js**, **Express**, and **ml5.js (MobileNet)** to demonstrate real-time image classification directly in the browser.

## 🚀 Features

### Project 1
- Preloads **6 images** on page load, grouped as:
  - ✅ Correct Classification
  - ❌ False Classification
- Upload or drag & drop up to **3 images** for instant classification
- Uses **MobileNet** model from `ml5.js` (built on TensorFlow.js)
- Displays:
  - File name
  - Preview image
  - Predicted label and confidence
- Includes a clear/reset button to remove uploaded images

## 📁 Folder Structure
project/ ├── public/ │ ├── css/ │ │ ├── index.css │ │ └── ea1.css │ ├── images/ │ │ ├── correct/ │ │ └── false/ │ └── js/ │ └── upload.js ├── routes/ │ └── ea1.js ├── views/ │ ├── index.ejs │ └── ea1.ejs ├── app.js └── README.md

## 🧠 Tech Stack

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [EJS](https://ejs.co/) (templating)
- [ml5.js](https://ml5js.org/) – pre-trained ML models
- [TensorFlow.js](https://www.tensorflow.org/js) under the hood

## 📸 Demo Use Case

You can test the classifier using example images (Mount Fuji, animals, or random objects) to explore how well MobileNet performs, and which types of images it struggles with.

## 🛠️ Setup

```bash
npm install
node app.js