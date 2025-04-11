# Deep Learning Webapp (ml5.js + Express)

This project is a simple web app built with **Node.js**, **Express**, and **ml5.js** to demonstrate real-time image classification using machine learning models directly in the browser.

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

## 📁 Folder Structure
deep-learning-webapp/
├── public/
│   ├── css/
│   │   ├── index.css            # Styles for homepage
│   │   └── ea1.css              # Styles for image classification page
│   ├── images/
│   │   ├── correct/             # Preloaded images for correct classification
│   │   └── false/               # Preloaded images for false classification
│   └── javascripts/
│       └── ea1.js            # ML5 image handling logic
│
├── routes/
│   └── ea1.js                   # Express route for /ea1
│
├── views/
│   ├── index.ejs                # Homepage template
│   └── ea1.ejs                  # Upload + classifier interface
│
├── .gitignore                   # Ignored files/folders
├── app.js                       # Main Express app
├── package.json                 # Project metadata & dependencies
├── package-lock.json            # Exact versions of installed packages
└── README.md                    # Project documentation

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