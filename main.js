document.querySelector('.main').classList.add('show');

const getInputImage = () => {
    const canvas = document.getElementById('input');
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const detectFace = () => {
    const classfier = new cv.CascadeClassifier();
    classfier.load('../../test/data/haarcascade_frontalface_default.xml');
    const img = cv.matFromArray(getInputImage(), 24);
    const imgGray = new cv.Mat();
    const imgColor = new cv.Mat();
    cv.cvtColor(img, imgGray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
    cv.cvtColor(img, imgColor, cv.ColorConversionCodes.COLOR_RGBA2RGB.value, 0);
    const faces = new cv.RectVector();
    const s1 = [0, 0];
    const s2 = [0, 0];
    classfier.detectMultiScale(imgGray, faces, 1.1, 3, 0, s1, s2);

    for (let i = 0; i < faces.size(); i += 1) {
        const rect = faces.get(i);
        const { x, y, width, height } = rect;
        const p1 = [x, y];
        const p2 = [x + width, y + height];
        const color = new cv.Scalar(255, 0, 0);
        cv.rectangle(imgColor, p1, p2, color, 2, 8, 0);
        rect.delete();
        color.delete();
    }
    renderImage(imgColor, 'output');
    img.delete();
    imgColor.delete();
    faces.delete();
    imgGray.delete();
}

const renderImage = (mat, id) => {
    const data = mat.data();
    const channels = mat.channels();
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = mat.cols;
    canvas.height = mat.rows;
    imgdata = ctx.createImageData(mat.cols, mat.rows);
    for (let i = 0, j = 0; i < data.length; i += channels, j += 4) {
        imgdata.data[j] = data[i];
        imgdata.data[j + 1] = data[i + 1 % channels];
        imgdata.data[j + 2] = data[i + 2 % channels];
        imgdata.data[j + 3] = 255;
    }
    ctx.putImageData(imgdata, 0, 0);
}

const onImageSelect = (e) => {
    const canvas = document.getElementById('input');
    const width = 600;
    const height = 400;
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(e.target.files[0]);
    const img = new Image();
    img.onload = () => {
        const scale = Math.min((width / img.width), (height / img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
        detectFace();
    }
    img.src = url;
}

const input = document.querySelector('input');
input.addEventListener('change', onImageSelect, false);

