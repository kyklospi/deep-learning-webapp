document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageUpload');
    const imageWrapper = document.getElementById('imageWrapper');
    const dropZone = document.getElementById('dropZone');
    const clearBtn = document.getElementById('clearBtn');  
    const resultText = document.getElementById('result');
  
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
        container.classList.add('image-container');
    
        const name = document.createElement('p');
        name.textContent = `File: ${fileName}`;
        name.style.fontWeight = 'bold';
    
        const img = document.createElement('img');
        img.src = url;
    
        const resultText = document.createElement('p');
        resultText.textContent = 'Classifying...';
    
        container.appendChild(name);
        container.appendChild(img);
        container.appendChild(resultText);
        parentDiv.appendChild(container);
    
        img.onload = () => {
          if (classifier) {
            classifier.classify(img)
              .then(results => {
                const topResult = results[0];
                resultText.textContent = `Label: ${topResult.label}, Confidence: ${topResult.confidence.toFixed(2)}`;
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

    const handleUploadedImages = (files) => {
        imageWrapper.innerHTML = ''; // Clear old previews
        const selectedFiles = Array.from(files).slice(0, 3); // Show max 3
      
        selectedFiles.forEach((file) => {
            const url = URL.createObjectURL(file);
      
            const container = document.createElement('div');
            container.classList.add('image-container');

            const fileName = document.createElement('p');
            fileName.textContent = `File: ${file.name}`;
            fileName.style.fontWeight = 'bold';
      
            const img = document.createElement('img');
            img.src = url;
      
            const resultText = document.createElement('p');
            resultText.textContent = 'Classifying...';
      
            container.appendChild(fileName);
            container.appendChild(img);
            container.appendChild(resultText);
            imageWrapper.appendChild(container);
      
            img.onload = () => {
                if (classifier) {
                    classifier.classify(img)
                    .then(results => {
                        const topResult = results[0];
                        resultText.textContent = `Label: ${topResult.label}, Confidence: ${topResult.confidence.toFixed(2)}`;
                    })
                    .catch(err => {
                    console.error('Classification error:', err);
                    resultText.textContent = 'Error classifying image.';
                    });
                } else {
                resultText.textContent = 'Model not ready yet.';
                }
            };
        });
    };
    
    fileInput.addEventListener('change', (e) => {
        handleUploadedImages(e.target.files);
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
          handleUploadedImages(e.dataTransfer.files);
        }
    });
    
    // Clear Button
    clearBtn.addEventListener('click', () => {
        imageWrapper.innerHTML = '';
        fileInput.value = ''; // Reset file input
    });
});
  
  