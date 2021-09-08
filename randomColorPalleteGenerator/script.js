let charSet = "0123456789abcdef";
let colors = [];
let colorCodes = slt(".colorCodes");

let numOfColors = {
  number: 5,
  selectDOM: slt("#numColors"),
  display: slt(".colorNumDisp"),
};

numOfColors.selectDOM.onchange = () => {
  numOfColors.number = Number(numOfColors.selectDOM.value);
  numOfColors.display.innerText = numOfColors.selectDOM.value;
};

function slt(selector) {
  return document.querySelector(selector);
}

for (let i = 0; i < 10; i++) {
  let domElt = slt(".color" + String(i));
  domElt.onclick = () => {
    lock(i);
  };
  colors[i] = {
    DOM: domElt,
    code: "#000000",
    locked: false,
  };
  colors[i].assign = (code) => {
    if (!colors[i].locked) {
      colors[i].code = code;
      colors[i].DOM.style.backgroundColor = code;
    }
  };
}

function execute() {
  codesAsText = "";

  for (let i = 0; i < numOfColors.number; i++) {
    colors[i].DOM.style.display = "inline-flex";

    if (!colors[i].locked) {
      code = generate();
      colors[i].assign(code);
    }

    codesAsText += colors[i].code + (i == numOfColors.number - 1 ? "" : ", ");
  }

  for (let i = numOfColors.number; i < 10; i++) {
    colors[i].DOM.style.display = "none";
  }

  colorCodes.innerText = codesAsText;
}

function lock(index) {
  if (!colors[index].locked) {
    colors[index].locked = true;
    colors[index].DOM.innerHTML = `
        <svg
        xmlns:svg="http://www.w3.org/2000/svg"
        xmlns="http://www.w3.org/2000/svg"
        width="37.458344mm"
        height="47.688248mm"
        viewBox="0 0 37.458344 47.688247"
        version="1.1"
        id="svg8">
        
        <g
            transform="translate(-80.678561,-49.483263)"
            id="layer1">
            <path
            id="rect853"
            style="opacity:1;fill:#ffffff;
                fill-opacity:1;stroke:#888888;
                stroke-width:1.17201;stroke-linecap:square;
                stroke-miterlimit:4;stroke-dasharray:none;
                stroke-opacity:1"
            d="m 99.444112,50.069268 c -7.511198,-1.16e-4 
                -13.600255,6.088941 -13.60014,13.600138
                v 7.213627 H 81.264566 V 96.585505 H 
                117.5509 V 70.883033 h -4.50706 v -7.213627
                c 1.1e-4,-7.511036 -6.08869,-13.600024
                -13.599728,-13.600138 z m -0.04465,4.514914
                c 0.01488,-3.8e-5 0.02977,-3.8e-5 0.04465,0 
                5.017628,2.3e-5 9.085198,4.067603 9.085228,9.085224 
                v 7.213627 H 90.358886 v -7.213627 c 
                -3.6e-5,-5.000236 4.040401,-9.060628 
                9.040576,-9.085224 z"
            />
        </g>
        </svg>
    `;
  } else {
    colors[index].locked = false;
    colors[index].DOM.innerText = "";
  }
}

function generate() {
  let result = "#";
  for (let i = 0; i < 6; i++) {
    let char = charSet[Math.floor(Math.random() * 16)];
    result += char;
  }
  return result;
}

function tip(show = true) {
  if (show) slt("aside").style.display = "flex";
  else slt("aside").style.display = "none";
}

execute();
