document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("upload");
  const previewDiv = document.getElementById("img-preview");

  uploadInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;

        // Fill container without overflow
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.display = "block";

        // Clear previous preview and add new image
        previewDiv.innerHTML = "";
        previewDiv.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      previewDiv.innerHTML = "No image selected";
    }
  });
});
