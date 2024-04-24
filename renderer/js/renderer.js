//module

const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError("please select an image");
    return;
  }

  //Get Image original Dimension
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedirect(), "imageResizer");
}

//sendingg the Image to hte main
function sendImage(e) {
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertError("please upload ann Image");
    return;
  }

  if (width === "" || height === "") {
    alertError("please give the width and height");
    return;
  }

  //sending to the main using IPC
  ipc2way.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

//catch the image done Event
ipc2way.on("image-done", () => {
  alertSuccess(`Image Resixed to ${widthInput.value} X ${heightInput.value}`);
});

//check the Image format
function isFileImage(file) {
  const imageFormat = ["image/gif", "image/png", "image/jpeg"];
  return file && imageFormat.includes(file["type"]);
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);

///toast meassage fucntion
function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: { background: "red", color: "white", textAlign: "center" },
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: { background: "green", color: "white", textAlign: "center" },
  });
}
