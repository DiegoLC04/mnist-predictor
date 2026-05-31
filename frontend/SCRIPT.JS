const ctx = canvas.getContext("2d");

let drawing = false;

ctx.fillStyle = "black";
ctx.fillRect(0,0,280,280);

ctx.strokeStyle = "white";
ctx.lineWidth = 20;
ctx.lineCap = "round";

canvas.addEventListener("mousedown", () => {
    drawing = true;
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

function draw(e){

    if(!drawing) return;

    const rect = canvas.getBoundingClientRect();

    ctx.lineTo(
        e.clientX - rect.left,
        e.clientY - rect.top
    );

    ctx.stroke();
    ctx.beginPath();

    ctx.moveTo(
        e.clientX - rect.left,
        e.clientY - rect.top
    );
}

document
.getElementById("clearBtn")
.addEventListener("click",()=>{

    ctx.fillStyle="black";
    ctx.fillRect(0,0,280,280);

    document.getElementById("resultado").innerHTML =
        "Dibuja un número";

    document.getElementById("barras").innerHTML="";
});

document
.getElementById("predictBtn")
.addEventListener("click", ()=>{

    canvas.toBlob(async(blob)=>{

        try {

            const formData = new FormData();
            formData.append("file", blob, "numero.png");

            const response = await fetch(
             "http://localhost:8000/predict",  
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            document.getElementById("resultado").innerHTML =
                `Predicción: ${data.clase}<br>Confianza: ${data.probabilidad}%`;

            let html = "";

            for(let i = 0; i < 10; i++){
                const valor = data.probabilidades[i];
                html += `
                <div class="barra">
                    <span>${i}</span>
                    <div class="progress"
                        style="width:${valor * 2}px; max-width:200px">
                    </div>
                    <span>${valor}%</span>
                </div>`;
            }

            document.getElementById("barras").innerHTML = html;

        } catch(err) {
            document.getElementById("resultado").innerHTML =
                "Error: " + err.message;
        }

    }, "image/png");
});