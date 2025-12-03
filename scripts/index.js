document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("upload");
  const previewDiv = document.getElementById("img-preview");
  const finalizeBtn = document.getElementById("finalize-btn");
  const numImgsInput = document.getElementById("num-imgs");

  let fileUploaded = false;
  let uploadedImage;

  // Initially disable the button
  finalizeBtn.classList.add("disabled");
  finalizeBtn.style.pointerEvents = "none";
  finalizeBtn.style.opacity = "0.5";

  uploadInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
      previewDiv.innerHTML = "No image selected";
      fileUploaded = false;

      // Disable button
      finalizeBtn.classList.add("disabled");
      finalizeBtn.style.pointerEvents = "none";
      finalizeBtn.style.opacity = "0.5";

    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        uploadedImage = e.target.result;
        img.src = uploadedImage;

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.display = "block";

        previewDiv.innerHTML = "";
        previewDiv.appendChild(img);
      };
      reader.readAsDataURL(file);
      fileUploaded = true;

      // Enable button
      finalizeBtn.classList.remove("disabled");
      finalizeBtn.style.pointerEvents = "auto";
      finalizeBtn.style.opacity = "1";
    }
  });

  finalizeBtn.addEventListener("click", function (e) {
    const numImages = parseInt(numImgsInput.value);

    if (!fileUploaded) {
      e.preventDefault();
      alert("Error: no image has been uploaded. Please upload an image.");
      return false;
    } else if (!numImages || numImages < 1) {
      e.preventDefault();
      alert("Error: please enter a valid number of images (at least 1).");
      return false;
    } else {
      // Store an array of images (all copies of the uploaded image)
      const imageArray = Array(numImages).fill(uploadedImage);
      localStorage.setItem("images", JSON.stringify(imageArray));

      // Allow navigation to proceed
      return true;
    }
  });

});
