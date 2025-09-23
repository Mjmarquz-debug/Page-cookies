from flask import Flask, render_template, request, redirect, url_for, jsonify
import stripe
import logging
from logging import FileHandler
from flask import Flask, session
import os
import traceback
from dotenv import load_dotenv

load_dotenv("key.env") 

app = Flask(__name__)

app.config['STRIPE_PUBLIC_KEY'] = os.getenv("STRIPE_PUBLIC_KEY")
app.config['STRIPE_SECRET_KEY'] = os.getenv("STRIPE_SECRET_KEY")

stripe.api_key = app.config['STRIPE_SECRET_KEY']


@app.route("/checkout")
def checkout():
    public_key = app.config['STRIPE_PUBLIC_KEY']
    return render_template("checkout.html", public_key=app.config['STRIPE_PUBLIC_KEY'], words=words)

@app.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.get_json()
    cart = data.get("cart", [])

    # Preparamos line_items para Stripe
    line_items = []
    for item in cart:
        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {"name": item["name"]},
                "unit_amount": int(item["price"] * 100),  # en centavos
            },
            "quantity": item.get("quantity", 1),
        })

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=url_for("success", _external=True, _scheme="http"),
            cancel_url=url_for("cancel", _external=True, _scheme="http"),
        )
        return jsonify({"id": session.id})
    except Exception as e:
        return jsonify(error=str(e)), 500
    
@app.route("/success")
def success():
    return redirect(url_for("index"))

@app.route("/cancel")
def cancel():
    return redirect(url_for("index"))

    
@app.route("/agregar/<producto>")
def add(producto):
    if "carrito" not in session:
        session["carrito"] = []
    session["carrito"].append(producto)
    return "Product added"

@app.route("/carrito")
def view_cart():
    return {"cart": session.get("cart", [])}
# Global variables
words = [
    "Welcome to SweetsLema",
    "Cookies made with love",
    "New flavors every week",
    "Enjoy new creations",
    "Follow us on social media",
    "Thank you for your support!"
]

coleccion = [
    {"nombre": "Crunchy", "imagen": "img/CRUNCHY.png"},
    {"nombre": "New York Style", "imagen": "img/NEWYORK.png"},
    {"nombre": "All Flavors", "imagen": "img/ALL_FLAVORS.png"}
]


@app.route("/")
def index():
    return render_template("index.html", words=words, coleccion=coleccion, public_key=app.config['STRIPE_PUBLIC_KEY'])


@app.route("/cajaDe4Galletas")
def cajaDe4Galletas():
    return render_template("cajaDe4Galletas.html", words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])

@app.route("/cajaDe6Galletas")
def cajaDe6Galletas():
    return render_template("cajaDe6Galletas.html", words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])

@app.route("/cajaDe8Galletas")
def cajaDe8Galletas():
    return render_template("cajaDe8Galletas.html", words=words, coleccion=coleccion, public_key=app.config['STRIPE_PUBLIC_KEY'])

@app.route('/crunchy')
def crunchy():
    return render_template('crunchy.html', words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])

@app.route('/new_york_style')
def new_york_style():
    return render_template('new-york-style.html', words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])

@app.route('/all_flavors')
def all_flavors():
    return render_template('all-flavors.html', words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])

# Página de productos
@app.route("/products")
def products():
    productosPagina = [
        {"id": 1, "nombre": "Brownhat", "imagen": "img/chocosombrero.png", "precio": 5.0},
        {"id": 2, "nombre": "Orekies", "imagen": "img/oreo.png", "precio": 6.80},
        {"id": 3, "nombre": "Chochisma", "imagen": "img/choco.png", "precio": 4.50},
]
    return render_template("products.html", productosPagina=productosPagina, words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])

# Otras páginas
@app.route("/cuidado-galletas")
def cuidadogalletas():
    return render_template("cuidado-galletas.html", words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])

@app.route("/about")
def about():
    return render_template("about.html", words=words, public_key=app.config['STRIPE_PUBLIC_KEY'])
# ---- Main ----

if __name__ == "__main__":
    file_handler = FileHandler('errorlog.txt')
    file_handler.setLevel(logging.WARNING)
    app.logger.addHandler(file_handler)
    app.run(debug=True)