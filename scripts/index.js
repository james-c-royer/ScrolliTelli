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
        img.src = uploadedImage;

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.display = "block";

        previewDiv.innerHTML = "";
        previewDiv.appendChild(img);

        // ⛔️ OLD: localStorage.setItem("uploadedImage", uploadedImage);
        // We no longer store a single image.
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

      // ✅ NEW: Store an array of images (all copies of the uploaded image)
      const imageArray = Array(numImages).fill(uploadedImage);
      localStorage.setItem("images", JSON.stringify(imageArray));

      window.location.href = "edit_pages.html";
    }
  });

});
