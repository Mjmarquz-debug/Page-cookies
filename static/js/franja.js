document.addEventListener("DOMContentLoaded", () => {
    const franjaTexto = document.getElementById("franja-texto");
    const words = JSON.parse(franjaTexto.dataset.words);
    let index = 0;

    function mostrarPalabra() {
        franjaTexto.textContent = words[index];

        // reset position
        franjaTexto.style.transition = "none";
        franjaTexto.style.transform = `translateX(-${franjaTexto.offsetWidth}px)`;

        // fuerza reflow
        franjaTexto.offsetHeight;

        // calcula distancia a recorrer (ancho contenedor + ancho texto)
        const contenedorWidth = franjaTexto.parentElement.offsetWidth;
        const textoWidth = franjaTexto.offsetWidth;
        const distancia = contenedorWidth + textoWidth;

        // duración proporcional a la distancia para velocidad constante
        const velocidad = 200; // píxeles por segundo
        const duracion = distancia / velocidad; // en segundos

        franjaTexto.style.transition = `transform ${duracion}s linear`;
        franjaTexto.style.transform = `translateX(${contenedorWidth}px)`; // mover hasta fuera de la derecha

        // preparar siguiente palabra cuando termine animación
        setTimeout(() => {
            index = (index + 1) % words.length;
            mostrarPalabra();
        }, duracion * 1000);
    }

    mostrarPalabra();
});
