document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageUpload');
    const imageWrapper = document.getElementById('imageWrapper');
    const uploadedImageWrapper = document.getElementById('uploadedImageWrapper')
    const dropZone = document.getElementById('dropZone');
    const clearBtn = document.getElementById('clearBtn');  
  
    let classifier;
  
    // Load the MobileNet classifier
    classifier = ml5.imageClassifier('MobileNet')
    console.log("Model loaded!");
    preloadGroupedImages();

    function preloadGroupedImages() {
        const groups = {
            correct: ['mount-fuji-mural.jpeg', 'mount-fuji-temple-sakura.jpeg', 'mount-fuji-without-snow.jpeg'],
            false: ['mount-fuji-autumn.jpeg', 'mount-fuji-blur.jpeg', 'mount-fuji-far.jpeg']
        };
    
        // Clear wrapper and set group titles
        imageWrapper.innerHTML = '';
    
        for (const [groupName, imageList] of Object.entries(groups)) {
            const groupTitle = document.createElement('h3');
            groupTitle.textContent = groupName === 'correct' ? '✅ Correct Classification' : '❌ False Classification';
            imageWrapper.appendChild(groupTitle);
    
            const groupContainer = document.createElement('div');
            groupContainer.classList.add('group-container');
    
            imageList.forEach((imgName) => {
                const imgPath = `/images/${groupName}/${imgName}`;
                handleImageFromURL(imgPath, imgName, groupContainer);
            });
    
            imageWrapper.appendChild(groupContainer);
        }
    }

    function handleImageFromURL(url, fileName, parentDiv) {
        const container = document.createElement('div');
        
        // Create the name element above the image
        const name = document.createElement('p');
        name.textContent = `File: ${fileName}`;
        name.style.fontWeight = 'bold';
        name.style.textAlign = 'center'; // Center the file name
        
        const img = document.createElement('img');
        img.src = url;
        
        // Create the result text element below the image
        const resultText = document.createElement('p');
        resultText.textContent = 'Classifying...';
        resultText.style.textAlign = 'center'; // Center the result text
    
        // Create a container for the image and chart side by side
        const imageChartContainer = document.createElement('div');
        imageChartContainer.classList.add('image-and-chart-container'); // This will be the flex container
        
        // Create a container for the image
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        imageContainer.appendChild(name);
        imageContainer.appendChild(img);
        imageContainer.appendChild(resultText);
        
        // Create a container for the chart
        const chartContainer = document.createElement('div');
        chartContainer.classList.add('chart-container');
        
        // Append the image container and chart container to the flex container
        imageChartContainer.appendChild(imageContainer);
        imageChartContainer.appendChild(chartContainer);
        
        // Append everything to the parent div
        container.appendChild(imageChartContainer);
        parentDiv.appendChild(container);
    
        // Classify the image and create a chart once the image is loaded
        img.onload = () => {
            if (classifier) {
                classifier.classify(img)
                    .then(results => {
                        const topResult = results[0];
                        resultText.textContent = `Top Result: ${topResult.label}, Confidence: ${topResult.confidence.toFixed(2)}`;

                        let labels = [];
                        results.forEach((element) => {
                            labels.push(element.label);
                        });
                        let confidences = [];
                        results.forEach((element) => {
                            confidences.push(element.confidence * 100);
                        });
                        
                        // Create a chart for the image with the label and confidence
                        createImageChart(chartContainer, labels, confidences);
                    })
                    .catch(err => {
                        resultText.textContent = 'Error classifying image.';
                        console.error(err);
                    });
            } else {
                resultText.textContent = 'Model not ready yet.';
            }
        };
    }                   

    const handleUploadedImage = (file) => {
        uploadedImageWrapper.innerHTML = '';

        const container = document.createElement('div');
        container.classList.add('base-upload-container')
        const url = URL.createObjectURL(file);

        const fileName = document.createElement('p');
        fileName.textContent = `File: ${file.name}`;
        fileName.style.fontWeight = 'bold';
      
        const img = document.createElement('img');
        img.src = url;
      
        const resultText = document.createElement('p');
        resultText.textContent = 'Classifying...';

        // Create a container for the image and chart side by side
        const imageChartContainer = document.createElement('div');
        imageChartContainer.classList.add('uploaded-image-and-chart-container'); // This will be the flex container
      
        // Create a container for the image
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('uploaded-image-container');
        imageContainer.appendChild(fileName);
        imageContainer.appendChild(img);
        imageContainer.appendChild(resultText);

        // Create a container for the chart
        const chartContainer = document.createElement('div');
        chartContainer.classList.add('uploaded-chart-container');
      
        // Append the image container and chart container to the flex container
        imageChartContainer.appendChild(imageContainer);
        imageChartContainer.appendChild(chartContainer);

        // Append everything to the parent div
        container.appendChild(imageChartContainer);
        uploadedImageWrapper.appendChild(container);            
      
        img.onload = () => {
            if (classifier) {
                classifier.classify(img)
                .then(results => {
                    const topResult = results[0];
                    resultText.textContent = `Top Result: ${topResult.label}, Confidence: ${topResult.confidence.toFixed(2)}`;

                    let labels = [];
                    results.forEach((element) => {
                        labels.push(element.label);
                    });
                    let confidences = [];
                    results.forEach((element) => {
                        confidences.push(element.confidence * 100);
                    });

                    // Create a chart for the image with the label and confidence
                    createImageChart(chartContainer, labels, confidences);
                })
                .catch(err => {
                    console.error('Classification error:', err);
                    resultText.textContent = 'Error classifying image.';
                });
            } else {
                resultText.textContent = 'Model not ready yet.';
            }
        };
    };
    
    fileInput.addEventListener('change', (e) => {
        handleUploadedImage(e.target.files[0]);
    });
    
      // Drag & Drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files) {
          handleUploadedImage(e.dataTransfer.files[0]);
        }
    });
    
    // Clear Button
    clearBtn.addEventListener('click', () => {
        uploadedImageWrapper.innerHTML = '';
        fileInput.value = ''; // Reset file input
    });

    // Function to create bar chart using Chart.js
    function createImageChart(chartContainer, labels, confidences) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        chartContainer.appendChild(canvas);
    
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: confidences,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Confidence (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#333',
                        padding: { bottom: 30 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.raw.toFixed(2) + '%';
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',       // Anchor at the end of the bar
                        align: 'start',      // Align above the bar
                        offset: -20,         // Move it slightly above
                        formatter: function(value) {
                            return value.toFixed(1) + '%';
                        },
                        color: '#000',
                        font: {
                            weight: 'normal'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 10
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
    
});
  