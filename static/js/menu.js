document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
    });

    const menuLinks = menu.querySelectorAll("a");
    menuLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        menu.classList.remove("active");

        if (link.classList.contains("cart-button")) {
          e.preventDefault();
          const cartWindow = document.querySelector(".cart-container");
          if (cartWindow) cartWindow.classList.toggle("active");
        }
      });
    });
  }

  // Botón cerrar carrito
  const closeCartBtn = document.querySelector(".close-cart");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      const cartWindow = document.querySelector(".cart-container");
      if (cartWindow) cartWindow.classList.remove("active");
    });
  }
});