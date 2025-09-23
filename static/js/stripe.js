document.addEventListener("DOMContentLoaded", () => {
  console.log("👉 Clave pública Stripe:", window.STRIPE_PUBLIC_KEY);

  if (!window.STRIPE_PUBLIC_KEY) {
    console.error("❌ No se cargó la clave pública de Stripe");
    return;
  }

  // Inicializamos Stripe con la clave pública
  const stripe = Stripe(window.STRIPE_PUBLIC_KEY);

  const checkoutBtn = document.getElementById("checkout-cart");
  if (!checkoutBtn) {
    console.error("❌ No se encontró el botón #checkout-cart");
    return;
  }

  checkoutBtn.addEventListener("click", async () => {
    console.log("🛒 Creando sesión de pago...");

    // 👉 Aquí traes el carrito guardado en localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: cart }), //
    });

    const session = await response.json();
    console.log("✅ Respuesta del backend:", session);

    if (session.id) {
      stripe.redirectToCheckout({ sessionId: session.id });
    } else {
      console.error("❌ Error en backend:", session);
    }
  });
});