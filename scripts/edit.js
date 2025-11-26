document.addEventListener("DOMContentLoaded", () => {
  const editorContainer = document.getElementById("editor-container");
  const exportBtn = document.getElementById("export-btn");

  // Load the array of images created on index.js
  const imageArray = JSON.parse(localStorage.getItem("images") || "[]");
  const numSections = imageArray.length;

  if (!imageArray || imageArray.length === 0) {
    editorContainer.innerHTML =
      '<div style="padding: 40px; text-align: center;">No images found – go back and upload one.</div>';
    return;
  }

  const sections = [];

  // Create section editors – each section gets its own image
  for (let i = 0; i < numSections; i++) {
    const sectionData = createSectionEditor(i, imageArray[i]);
    sections.push(sectionData);
    editorContainer.appendChild(sectionData.element);
  }

  // Export functionality – now uses per-section images
  exportBtn.addEventListener("click", () => {
    exportToHTML(sections);
  });
});

function createSectionEditor(index, imageSrc) {
  const sectionDiv = document.createElement("div");
  sectionDiv.className = "section-editor";
  sectionDiv.innerHTML = `
    <div class="section-header">Section</div>
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
          <button class="btn btn-secondary btn-sm" id="replace-btn-${index}">Replace Image</button>
          <input type="file" accept="image/*" id="replace-input-${index}" style="display:none;">
        </div>
        <div class="blur-control">
          <label for="blur-amount-${index}">Blur Strength:</label>
          <input type="range" id="blur-amount-${index}" min="0" max="20" value="2" step="0.5">
          <span class="blur-value" id="blur-value-${index}"></span>
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

  const circleBtn = sectionDiv.querySelector(`#circle-btn-${index}`);
  const rectBtn = sectionDiv.querySelector(`#rect-btn-${index}`);
  const clearBtn = sectionDiv.querySelector(`#clear-btn-${index}`);

  const replaceBtn = sectionDiv.querySelector(`#replace-btn-${index}`);
  const replaceInput = sectionDiv.querySelector(`#replace-input-${index}`);

  let currentShape = null;
  let isDrawing = false;
  let startX, startY;
  let drawMode = null;

  // Track this section's current image (used in export)
  let currentImage = imageSrc;

  baseImg.onload = () => {
    const imgWidth = baseImg.width;
    const imgHeight = baseImg.height;

    blurCanvas.width = imgWidth;
    blurCanvas.height = imgHeight;
    drawCanvas.width = imgWidth;
    drawCanvas.height = imgHeight;

    blurCanvas.style.width = imgWidth + "px";
    blurCanvas.style.height = imgHeight + "px";
    drawCanvas.style.width = imgWidth + "px";
    drawCanvas.style.height = imgHeight + "px";

    applyBlur();
  };

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
      const radius = Math.sqrt(
        Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
      );
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
      const radius = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );
      currentShape = {
        type: "circle",
        x: startX,
        y: startY,
        radius: radius,
      };
    } else if (drawMode === "rectangle") {
      currentShape = {
        type: "rectangle",
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
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
      ctx.fillRect(
        currentShape.x,
        currentShape.y,
        currentShape.width,
        currentShape.height
      );
    }

    ctx.restore();
  }

  // Replace Image functionality
  replaceBtn.addEventListener("click", () => {
    replaceInput.click();
  });

  replaceInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      currentImage = reader.result; // update section's image value

      // Update global image array in localStorage
      const imageArray = JSON.parse(localStorage.getItem("images") || "[]");
      imageArray[index] = currentImage;
      localStorage.setItem("images", JSON.stringify(imageArray));

      // Update DOM image
      baseImg.src = currentImage;

      baseImg.onload = () => {
        const imgWidth = baseImg.width;
        const imgHeight = baseImg.height;

        blurCanvas.width = imgWidth;
        blurCanvas.height = imgHeight;
        drawCanvas.width = imgWidth;
        drawCanvas.height = imgHeight;

        blurCanvas.style.width = imgWidth + "px";
        blurCanvas.style.height = imgHeight + "px";
        drawCanvas.style.width = imgWidth + "px";
        drawCanvas.style.height = imgHeight + "px";

        applyBlur();
      };
    };
    reader.readAsDataURL(file);
  });

  return {
    element: sectionDiv,
    getData: () => ({
      image: currentImage,
      shape: currentShape,
      text: textInput.value,
      blurAmount: blurAmount.value,
      canvasWidth: blurCanvas.width,
      canvasHeight: blurCanvas.height,
    }),
  };
}

function exportToHTML(sections) {
  const sectionsData = sections.map((section) => section.getData());

  // Prompt user for presentation title
  const presentationTitle = prompt(
    "Enter a name for your presentation:",
    "My ScrolliTelli Story"
  );
  const finalTitle =
    presentationTitle && presentationTitle.trim()
      ? presentationTitle.trim()
      : "ScrolliTelli Presentation";

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
      height: 60vh;
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
        <img src="${sectionsData[0]?.image || ""}" alt="Story image" id="base-image">
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
    const scrollSmoothness = 0.15;
    
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
    
    sectionsData.forEach((data, index) => {
      const canvas = document.getElementById('canvas-' + index);
      canvases.push(canvas);
    });

    // Preload per-section images
    const sectionImages = sectionsData.map(data => {
      const img = new Image();
      img.src = data.image || "";
      return img;
    });

    function renderCanvasForSection(index) {
      const data = sectionsData[index];
      const img = sectionImages[index];
      const canvas = canvases[index];
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d');

      const renderWidth = img.width || baseImage.width;
      const renderHeight = img.height || baseImage.height;

      if (!renderWidth || !renderHeight) return;

      canvas.width = renderWidth;
      canvas.height = renderHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!data.shape) {
        ctx.filter = 'blur(' + data.blurAmount + 'px)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        const scaleX = renderWidth / data.canvasWidth;
        const scaleY = renderHeight / data.canvasHeight;

        ctx.save();
        ctx.filter = 'blur(' + data.blurAmount + 'px)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
    }

    // Render all canvases after images load
    sectionImages.forEach((img, index) => {
      if (img.complete) {
        renderCanvasForSection(index);
      } else {
        img.onload = () => renderCanvasForSection(index);
      }
    });

    function updateActiveSection() {
  const spacers = document.querySelectorAll(".transition-spacer");
  const imageContainer = document.querySelector(".image-container");

  const imageRect = imageContainer.getBoundingClientRect();
  const imageMid = imageRect.top + imageRect.height / 2;

  let activeSection = 0;
  const threshold = 0; // tweak if you want to shift the transition a bit

  // Active section = number of spacers whose bottom is above the image midpoint
  spacers.forEach((spacer, index) => {
    const rect = spacer.getBoundingClientRect();
    const spacerBottom = rect.top + rect.height;

    if (spacerBottom < imageMid - threshold) {
      activeSection = index + 1;
    }
  });

  // Activate correct blur canvas
  canvases.forEach((canvas, index) => {
    if (index === activeSection) {
      canvas.classList.add("active");
    } else {
      canvas.classList.remove("active");
    }
  });

  // Swap base image to match active section
  if (sectionsData[activeSection] && sectionsData[activeSection].image) {
    baseImage.src = sectionsData[activeSection].image;
  }
}
    
    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('resize', () => {
      sectionImages.forEach((img, index) => renderCanvasForSection(index));
      updateActiveSection();
    });

    if (canvases.length > 0) {
      canvases[0].classList.add('active');
    }
    if (sectionsData[0] && sectionsData[0].image) {
      baseImage.src = sectionsData[0].image;
    }
    updateActiveSection();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const filename =
    finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "scrollitelli-presentation";
  a.download = filename + ".html";
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
