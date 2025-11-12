document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("upload");
  const previewDiv = document.getElementById("img-preview");
  const nextPage = document.getElementById("finalize-btn");
  const numImgsInput = document.getElementById("num-imgs");
  let fileUploaded = false;
  let uploadedImage;


  uploadInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
      previewDiv.innerHTML = "No image selected";

    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        uploadedImage = e.target.result;
        img.src = e.target.result;

        // Fill container without overflow
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.display = "block";

        // Clear previous preview and add new image
        previewDiv.innerHTML = "";
        previewDiv.appendChild(img);

        // Store image in localStorage
        localStorage.setItem("uploadedImage", uploadedImage);
      };
      reader.readAsDataURL(file);
      fileUploaded = true;
    }
  });

  nextPage.addEventListener("click", function () {
    const numImages = parseInt(numImgsInput.value);

    if (!fileUploaded) {
      alert("Error: no image has been uploaded. Please upload an image.");
    } else if (!numImages || numImages < 1) {
      alert("Error: please enter a valid number of images (at least 1).");
    } else {
      // Store the number of images
      localStorage.setItem("numImages", numImages);
      window.location.href = "edit_pages.html";
    }
  });

});