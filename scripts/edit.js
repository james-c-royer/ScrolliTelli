document.addEventListener("DOMContentLoaded", () => {
  const editorContainer = document.getElementById("editor-container");
  const exportBtn = document.getElementById("export-btn");

  const storedImage = localStorage.getItem("uploadedImage");
  const numSections = parseInt(localStorage.getItem("numImages")) || 1;

  if (!storedImage) {
    editorContainer.innerHTML = '<div style="padding: 40px; text-align: center;">No image found – go back and upload one.</div>';
    return;
  }

  const sections = [];

  // Create section editors
  for (let i = 0; i < numSections; i++) {
    const sectionData = createSectionEditor(i, storedImage);
    sections.push(sectionData);
    editorContainer.appendChild(sectionData.element);
  }

  // Export functionality
  exportBtn.addEventListener("click", () => {
    exportToHTML(sections, storedImage);
  });
});

function createSectionEditor(index, imageSrc) {
  const sectionDiv = document.createElement("div");
  sectionDiv.className = "section-editor";
  sectionDiv.innerHTML = `
    <div class="section-header">Section ${index + 1}</div>
    <div class="editor-content">
      <div class="image-editor">
        <div class="canvas-container" id="canvas-container-${index}">
          <div class="canvas-wrapper" id="canvas-wrapper-${index}">
            <img src="${imageSrc}" class="base-image" id="base-img-${index}" alt="Section ${index + 1} image">
            <canvas class="blur-canvas" id="blur-canvas-${index}"></canvas>
            <canvas class="draw-canvas" id="draw-canvas-${index}"></canvas>
          </div>
        </div>
        <div class="canvas-controls">
          <button class="btn btn-primary btn-sm" id="circle-btn-${index}">Draw Circle</button>
          <button class="btn btn-primary btn-sm" id="rect-btn-${index}">Draw Rectangle</button>
          <button class="btn btn-warning btn-sm" id="clear-btn-${index}">Clear Shape</button>
        </div>
        <div class="blur-control">
          <label for="blur-amount-${index}">Blur Strength:</label>
          <input type="range" id="blur-amount-${index}" min="0" max="20" value="2" step="0.5">
          <span class="blur-value" id="blur-value-${index}">2px</span>
        </div>
      </div>
      <div class="text-editor">
        <h4>Text Content</h4>
        <textarea class="text-input" id="text-input-${index}" placeholder="Enter the text that will be revealed as users scroll through this section..."></textarea>
      </div>
    </div>
  `;

  const baseImg = sectionDiv.querySelector(`#base-img-${index}`);
  const blurCanvas = sectionDiv.querySelector(`#blur-canvas-${index}`);
  const drawCanvas = sectionDiv.querySelector(`#draw-canvas-${index}`);
  const textInput = sectionDiv.querySelector(`#text-input-${index}`);
  const blurAmount = sectionDiv.querySelector(`#blur-amount-${index}`);

  let currentShape = null;
  let isDrawing = false;
  let startX, startY;
  let drawMode = null;

  baseImg.onload = () => {
    // Get the actual rendered dimensions of the image
    const imgWidth = baseImg.width;
    const imgHeight = baseImg.height;

    // Set canvas dimensions to match the actual displayed image
    blurCanvas.width = imgWidth;
    blurCanvas.height = imgHeight;
    drawCanvas.width = imgWidth;
    drawCanvas.height = imgHeight;

    // Also set the canvas display size to match
    blurCanvas.style.width = imgWidth + 'px';
    blurCanvas.style.height = imgHeight + 'px';
    drawCanvas.style.width = imgWidth + 'px';
    drawCanvas.style.height = imgHeight + 'px';

    applyBlur();
  };

  const circleBtn = sectionDiv.querySelector(`#circle-btn-${index}`);
  const rectBtn = sectionDiv.querySelector(`#rect-btn-${index}`);
  const clearBtn = sectionDiv.querySelector(`#clear-btn-${index}`);

  circleBtn.addEventListener("click", () => {
    drawMode = "circle";
    circleBtn.classList.add("active");
    rectBtn.classList.remove("active");
  });

  rectBtn.addEventListener("click", () => {
    drawMode = "rectangle";
    rectBtn.classList.add("active");
    circleBtn.classList.remove("active");
  });

  clearBtn.addEventListener("click", () => {
    currentShape = null;
    const ctx = drawCanvas.getContext("2d");
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    applyBlur();
  });

  blurAmount.addEventListener("input", () => {
    applyBlur();
  });

  drawCanvas.addEventListener("mousedown", (e) => {
    if (!drawMode) return;
    isDrawing = true;
    const rect = drawCanvas.getBoundingClientRect();
    startX = (e.clientX - rect.left) * (drawCanvas.width / rect.width);
    startY = (e.clientY - rect.top) * (drawCanvas.height / rect.height);
  });

  drawCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    const rect = drawCanvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) * (drawCanvas.width / rect.width);
    const currentY = (e.clientY - rect.top) * (drawCanvas.height / rect.height);

    const ctx = drawCanvas.getContext("2d");
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (drawMode === "circle") {
      const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    } else if (drawMode === "rectangle") {
      const width = currentX - startX;
      const height = currentY - startY;
      ctx.rect(startX, startY, width, height);
    }

    ctx.stroke();
  });

  drawCanvas.addEventListener("mouseup", (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const rect = drawCanvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) * (drawCanvas.width / rect.width);
    const endY = (e.clientY - rect.top) * (drawCanvas.height / rect.height);

    if (drawMode === "circle") {
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      currentShape = {
        type: "circle",
        x: startX,
        y: startY,
        radius: radius
      };
    } else if (drawMode === "rectangle") {
      currentShape = {
        type: "rectangle",
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY
      };
    }

    applyBlur();
    drawCanvas.getContext("2d").clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  });

  function applyBlur() {
    const ctx = blurCanvas.getContext("2d");
    const blur = blurAmount.value;

    ctx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);

    if (!currentShape) {
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(baseImg, 0, 0, blurCanvas.width, blurCanvas.height);
      return;
    }

    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(baseImg, 0, 0, blurCanvas.width, blurCanvas.height);

    ctx.globalCompositeOperation = "destination-out";
    ctx.filter = "none";

    if (currentShape.type === "circle") {
      ctx.beginPath();
      ctx.arc(currentShape.x, currentShape.y, currentShape.radius, 0, 2 * Math.PI);
      ctx.fill();
    } else if (currentShape.type === "rectangle") {
      ctx.fillRect(currentShape.x, currentShape.y, currentShape.width, currentShape.height);
    }

    ctx.restore();
  }

  return {
    element: sectionDiv,
    getData: () => ({
      shape: currentShape,
      text: textInput.value,
      blurAmount: blurAmount.value,
      // Store the canvas dimensions when the shape was created
      canvasWidth: blurCanvas.width,
      canvasHeight: blurCanvas.height
    })
  };
}

function exportToHTML(sections, imageSrc) {
  const sectionsData = sections.map(section => section.getData());

  // Prompt user for presentation title
  const presentationTitle = prompt("Enter a name for your presentation:", "My ScrolliTelli Story");
  const finalTitle = presentationTitle && presentationTitle.trim() ? presentationTitle.trim() : "ScrolliTelli Presentation";

  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(finalTitle)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      scroll-behavior: auto;
    }
    
    body {
      font-family: Arial, sans-serif;
      background-color: #000;
      color: white;
      overflow-x: hidden;
    }
    
    .scroll-container {
      position: relative;
    }
    
    .image-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 66.666%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
      background-color: #000;
    }
    
    .image-wrapper {
      position: relative;
      width: 90%;
      max-width: 100%;
      max-height: 90vh;
    }
    
    .image-wrapper img,
    .image-wrapper canvas {
      display: block;
      width: 100%;
      height: auto;
      max-height: 90vh;
      object-fit: contain;
    }
    
    .blur-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .blur-canvas.active {
      opacity: 1;
    }
    
    .text-sections {
      position: relative;
      z-index: 10;
      pointer-events: none;
      margin-left: 66.666%;
      width: 33.333%;
    }
    
    .text-section {
      min-height: 80vh;
      display: flex;
      align-items: center;
      padding: 40px 30px;
      pointer-events: auto;
    }
    
    .text-content {
      width: 100%;
      background: rgba(0, 0, 0, 0.85);
      padding: 30px;
      border-radius: 8px;
      font-size: 18px;
      line-height: 1.8;
      white-space: pre-wrap;
      backdrop-filter: blur(10px);
    }
    
    .transition-spacer {
      height: 80vh;
      pointer-events: none;
    }
    
    @media (max-width: 1024px) {
      .image-container {
        width: 100%;
        height: 50vh;
      }
      
      .image-wrapper {
        width: 80%;
      }
      
      .text-sections {
        margin-left: 0;
        width: 100%;
        margin-top: 50vh;
      }
      
      .text-content {
        width: 90%;
        margin: 0 auto;
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="scroll-container">
    <div class="image-container">
      <div class="image-wrapper">
        <img src="${imageSrc}" alt="Story image" id="base-image">
`;

  sectionsData.forEach((data, index) => {
    htmlContent += `        <canvas id="canvas-${index}" class="blur-canvas"></canvas>\n`;
  });

  htmlContent += `      </div>
    </div>
    
    <div class="text-sections">
`;

  sectionsData.forEach((data, index) => {
    htmlContent += `      <div class="text-section" data-section="${index}">
        <div class="text-content">${escapeHtml(data.text)}</div>
      </div>
`;
    if (index < sectionsData.length - 1) {
      htmlContent += `      <div class="transition-spacer" data-transition="${index}"></div>\n`;
    }
  });

  htmlContent += `    </div>
  </div>
  
  <script>
    // Slow down scroll speed
    let scrollTimeout;
    const scrollSmoothness = 0.15; // Lower = slower scrolling
    
    window.addEventListener('wheel', function(e) {
      e.preventDefault();
      
      clearTimeout(scrollTimeout);
      
      const delta = e.deltaY * scrollSmoothness;
      window.scrollBy({
        top: delta,
        behavior: 'auto'
      });
    }, { passive: false });
    
    // Touch scrolling for mobile
    let touchStartY = 0;
    window.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchmove', function(e) {
      const touchY = e.touches[0].clientY;
      const delta = (touchStartY - touchY) * scrollSmoothness;
      window.scrollBy({
        top: delta,
        behavior: 'auto'
      });
      touchStartY = touchY;
    }, { passive: true });
    
    const sectionsData = ${JSON.stringify(sectionsData)};
    const baseImage = document.getElementById('base-image');
    const canvases = [];
    
    // Initialize all canvases
    sectionsData.forEach((data, index) => {
      const canvas = document.getElementById('canvas-' + index);
      canvases.push(canvas);
    });
    
    baseImage.onload = () => {
      sectionsData.forEach((data, index) => {
        const canvas = canvases[index];
        // Use the actual rendered image dimensions
        const renderWidth = baseImage.width;
        const renderHeight = baseImage.height;
        
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!data.shape) {
          ctx.filter = 'blur(' + data.blurAmount + 'px)';
          ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        } else {
          // Calculate scale factors from editor canvas to export canvas
          const scaleX = renderWidth / data.canvasWidth;
          const scaleY = renderHeight / data.canvasHeight;
          
          ctx.save();
          ctx.filter = 'blur(' + data.blurAmount + 'px)';
          ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
          
          ctx.globalCompositeOperation = 'destination-out';
          ctx.filter = 'none';
          
          if (data.shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(
              data.shape.x * scaleX, 
              data.shape.y * scaleY, 
              data.shape.radius * scaleX, 
              0, 
              2 * Math.PI
            );
            ctx.fill();
          } else if (data.shape.type === 'rectangle') {
            ctx.fillRect(
              data.shape.x * scaleX, 
              data.shape.y * scaleY, 
              data.shape.width * scaleX, 
              data.shape.height * scaleY
            );
          }
          
          ctx.restore();
        }
      });
    };
    
    // Handle scroll-based image transitions
    function updateActiveSection() {
      const windowHeight = window.innerHeight;
      const sections = document.querySelectorAll('.text-section');
      const spacers = document.querySelectorAll('.transition-spacer');
      
      // Find which section or spacer is currently most prominent in viewport
      let activeSection = 0;
      let maxScore = -Infinity;
      
      // Score each text section based on its position
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        // Calculate how centered this section is in the viewport
        const sectionCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        const score = -distance; // Closer to center = higher score
        
        // Only consider sections that are at least partially visible
        if (rect.bottom > 0 && rect.top < windowHeight) {
          if (score > maxScore) {
            maxScore = score;
            activeSection = index;
          }
        }
      });
      
      // Check spacers - they get priority if they're in the middle of viewport
      spacers.forEach((spacer, index) => {
        const rect = spacer.getBoundingClientRect();
        const spacerCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        
        // If spacer center is near viewport center, transition to next section
        if (Math.abs(spacerCenter - viewportCenter) < windowHeight * 0.3) {
          activeSection = index + 1;
        }
      });
      
      // Update active canvas
      canvases.forEach((canvas, index) => {
        if (index === activeSection) {
          canvas.classList.add('active');
        } else {
          canvas.classList.remove('active');
        }
      });
    }
    
    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('resize', () => {
      // Recalculate canvas dimensions when window resizes
      sectionsData.forEach((data, index) => {
        const canvas = canvases[index];
        const renderWidth = baseImage.width;
        const renderHeight = baseImage.height;
        
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!data.shape) {
          ctx.filter = 'blur(' + data.blurAmount + 'px)';
          ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        } else {
          // Calculate scale factors from editor canvas to current canvas
          const scaleX = renderWidth / data.canvasWidth;
          const scaleY = renderHeight / data.canvasHeight;
          
          ctx.save();
          ctx.filter = 'blur(' + data.blurAmount + 'px)';
          ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
          
          ctx.globalCompositeOperation = 'destination-out';
          ctx.filter = 'none';
          
          if (data.shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(
              data.shape.x * scaleX, 
              data.shape.y * scaleY, 
              data.shape.radius * scaleX, 
              0, 
              2 * Math.PI
            );
            ctx.fill();
          } else if (data.shape.type === 'rectangle') {
            ctx.fillRect(
              data.shape.x * scaleX, 
              data.shape.y * scaleY, 
              data.shape.width * scaleX, 
              data.shape.height * scaleY
            );
          }
          
          ctx.restore();
        }
      });
      updateActiveSection();
    });
    
    // Initialize - show first section's canvas
    if (canvases.length > 0) {
      canvases[0].classList.add('active');
    }
    updateActiveSection();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scrollitelli-presentation';
  a.download = filename + '.html';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}