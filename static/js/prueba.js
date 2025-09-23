document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let lastScrollY = window.scrollY;
  let scrollDirection = "down";

  /*PRODUCTOS*/
  (function initProductos() {
    const productos = document.querySelectorAll(".producto");
    if (!productos.length) return;

    productos.forEach(p => {
      p.classList.add("slide-down");
      p.dataset.animated = "false";
    });

    let lastY = window.scrollY;

    const io = new IntersectionObserver((entries) => {
      const down = window.scrollY > lastY; 
      lastY = window.scrollY;

      entries.forEach(entry => {
        const el = entry.target;

        if (entry.isIntersecting) {
          if (down) {
            el.classList.remove("active");
            void el.offsetWidth;
            el.classList.add("active");
            el.dataset.animated = "true";
          }
        } else {
          if (entry.boundingClientRect.bottom < 0) {
            el.classList.remove("active");
            el.dataset.animated = "false";
          }
        }
      });
    }, { threshold: 0.3 });

    productos.forEach(el => io.observe(el));
  })();

  /*BOXES*/
    (function initBoxes() {
      const boxes = document.querySelectorAll(".boxes");
      if (!boxes.length) return;
      boxes.forEach((box, index) => {
        box.dataset.animated = "false";
        box.classList.add(index % 2 === 0 ? "slide-right" : "slide-left");
        box.style.opacity = 0;
        box.style.transition = `transform 0.5s ease, opacity 0.2s ease`;
        box.style.transform =
          index % 2 === 0 ? "translateX(600px)" : "translateX(-600px)";
      }); // ✅ aquí cerramos bien el forEach

      window.addEventListener(
        "scroll",
        () => {
          const scrollingDown = window.scrollY > lastScrollY;
          lastScrollY = window.scrollY;

          if (!scrollingDown) return;

          boxes.forEach((box, index) => {
            const rect = box.getBoundingClientRect();
            const visibleAmount =
              Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            const visibleRatio = visibleAmount / rect.height;

            if (visibleRatio >= 0.5 && box.dataset.animated === "false") {
              const baseDelay = index * 10;
              const delay = index === 0 ? baseDelay + 150 : baseDelay;
              setTimeout(() => {
                box.style.transform = "translate(0, 0)";
                box.style.opacity = 1;
                box.dataset.animated = "true";
              }, delay);
            }

            if (rect.top > window.innerHeight) {
              box.dataset.animated = "false";
              if (box.classList.contains("slide-right")) {
                box.style.transform = "translateX(400px)";
              } else if (box.classList.contains("slide-left")) {
                box.style.transform = "translateX(-400px)";
              } else {
                box.style.transform = "translateY(100px)";
              }
              box.style.opacity = 0;
            }
          });
        },
        { passive: true }
      );
    })();

  /* CARRITO */
      const cartBtn       = document.getElementById("cart-btn");
      const cartPanel     = document.getElementById("cart-panel");
      const cartOverlay   = document.getElementById("cart-overlay");
      const cerrarCart    = document.getElementById("cerrar-cart");
      const checkoutCart  = document.getElementById("checkout-cart");
      const cartItemsList = document.getElementById("cart-items");
      const emptyCartMsg  = document.getElementById("empty-cart-msg");

      if (!cartBtn || !cartPanel || !cartOverlay || !cerrarCart || !checkoutCart || !cartItemsList || !emptyCartMsg) return;

      const saveCart = () => localStorage.setItem("cart", JSON.stringify(cart));
      const openCart = () => { cartPanel.classList.add("active"); cartOverlay.classList.add("active"); };
      const closeCart = () => { cartPanel.classList.remove("active"); cartOverlay.classList.remove("active"); };

      const renderCart = () => {
        cartItemsList.innerHTML = "";
        emptyCartMsg.style.display = cart.length === 0 ? "flex" : "none";

        cart.forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `
            <img src="${item.img || ''}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;margin-right:8px;">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <div class="cart-item-controls" style="float:right; display:inline-flex; align-items:center; margin: 0px; padding: 0px;">
              <button type="button" class="decrease" data-id="${item.id}"></button>
              <span style="margin:0px;">${item.quantity}</span>
              <button type="button" class="increase" data-id="${item.id}"></button>
              <button type="button" class="remove" data-id="${item.id}"></button>
            </div>
          `;
          cartItemsList.appendChild(li);
        });
      };

      cartItemsList.addEventListener("click", e => {
        const btn = e.target.closest("button");
        if (!btn || !cartItemsList.contains(btn)) return;

        const id = String(btn.dataset.id);
        const productIndex = cart.findIndex(p => String(p.id) === id);
        if (productIndex === -1) return;

        const product = cart[productIndex];

        if (btn.classList.contains("increase")) product.quantity++;
        else if (btn.classList.contains("decrease")) {
          if (product.quantity > 1) product.quantity--;
          else cart.splice(productIndex, 1);
        } else if (btn.classList.contains("remove")) cart.splice(productIndex, 1);

        saveCart();
        renderCart();
      });

      window.addToCart = (id, name, price, img) => {
        id = String(id);
        let existing = cart.find(p => String(p.id) === id);
        if (existing) {
          existing.quantity++;
        } else {
          cart.push({ id: id || name, name, price, quantity: 1, type: "product", img });
        }
        saveCart();
        renderCart();
        openCart();
      };

      cartBtn.addEventListener("click", openCart);
      cerrarCart.addEventListener("click", closeCart);
      cartOverlay.addEventListener("click", closeCart);

      renderCart();

      /*BOXES AUTOMÁTICAS*/
      const boxes = document.querySelectorAll(".box");
      boxes.forEach(box => {
        const maxCookies = Number(box.dataset.box);
        const boxName = box.dataset.name;
        const boxPrice = Number(box.dataset.price);

        box.querySelectorAll(".input-cantidad").forEach(input => {
          input.value = 0;

          const updateBox = () => {
            const total = Array.from(box.querySelectorAll(".input-cantidad"))
              .reduce((sum, i) => sum + (parseInt(i.value) || 0), 0);

            let existingBox = cart.find(p => String(p.id) === boxName);

            if (total === maxCookies) {
              const imgSrc = box.dataset.img || "";
              if (existingBox) existingBox.quantity++;
              else cart.push({ id: boxName, name: boxName, price: boxPrice, quantity: 1, img: imgSrc });

              saveCart();
              renderCart();
              openCart();
              box.querySelectorAll(".input-cantidad").forEach(i => i.value = 0);
            } else if (total > maxCookies) {
              alert(`No puedes agregar más de ${maxCookies} galletas en esta caja`);
              input.value = Math.max(0, (parseInt(input.value) || 0) - 1);
            } else if (total === 0 && existingBox) {
              existingBox.quantity--;
              if (existingBox.quantity <= 0) cart = cart.filter(p => String(p.id) !== boxName);
              saveCart();
              renderCart();
            }
          };

          const btnMas = input.parentElement.querySelector(".btn-mas");
          const btnMenos = input.parentElement.querySelector(".btn-menos");

          if (btnMas) btnMas.addEventListener("click", () => { input.value = (parseInt(input.value) || 0) + 1; updateBox(); });
          if (btnMenos) btnMenos.addEventListener("click", () => { input.value = Math.max(0, (parseInt(input.value) || 0) - 1); updateBox(); });
        });
      });

  /*ANIMACIONES DE TEXTOS*/
      const textos = document.querySelectorAll(
        ".banner-envio-titulo, .banner-envio-subtitulo, .banner-envio-boton-free, .carrito-titulo, .carrito-subtitulo, .boton-al-lado, .banner-crunchy, .boton-crunchy, .boton-centrado, .banner-crunchy-titulo"
      );

        window.addEventListener("scroll", () => {
      if (window.scrollY > lastScrollY) {
        scrollDirection = "down";
      } else {
        scrollDirection = "up";
      }
      lastScrollY = window.scrollY;
    });

    window.addEventListener("resize", () => {
      boxes.forEach((box, index) => {
        if (box.dataset.animated === "false") {
          const offset = window.innerWidth * (index % 2 === 0 ? 0.5 : -0.5);
          box.style.transform = `translateX(${offset}px)`;
        }
      });
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.classList.contains("box") &&
            window.innerWidth === 1366
          ) {
            entry.target.classList.remove("active");
            return;
          }

          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          } else if (scrollDirection === "up") {
            entry.target.classList.remove("active");
          }
        });
      },
      { threshold: 0.1 }
    );
    textos.forEach((el) => observer.observe(el));

      document.querySelectorAll(".producto, .crunchy, .new_york_style").forEach(producto => {
      const header = producto.querySelector("h1, h3");
      if (!header) return; // salta si no hay encabezado
      const name = header.innerText.trim();

      const priceEl = producto.querySelector("p");
      if (!priceEl) return; // salta si no hay precio
      const price = parseFloat(priceEl.innerText.replace("$", "").trim()) || 0;

      const imgEl = producto.querySelector("img");
      const img = imgEl ? imgEl.src : "";

      const addBtn = producto.querySelector(".add-to-cart");
      if (!addBtn) return;

      addBtn.addEventListener("click", () => {
        let existing = cart.find(p => p.name === name);
        if (existing) {
          existing.quantity++;
        } else {
          cart.push({ id: name, name, price, quantity: 1, type: "product", img });
        }

        saveCart();
        renderCart();
        openCart();
    });
  });
}); 
