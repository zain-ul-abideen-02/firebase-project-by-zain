import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  initializeFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjUJZyLk9RxcUC5n_vrxTq0cRXMylLmAs",
  authDomain: "fire-base-project-e25ab.firebaseapp.com",
  projectId: "fire-base-project-e25ab",
  appId: "1:495616776229:web:f8c9da94b47cc"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });
const auth = getAuth();

const itemsCol = collection(db, "items");
const itemsRow = document.getElementById("itemsRow");
const basketCount = document.getElementById("basketCount");
const cartContainer = document.getElementById("cartContainer");
const cartItemsDiv = document.getElementById("cartItems");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const totalPriceDiv = document.getElementById("totalPrice");
const successAnimation = document.getElementById("successAnimation");

let cart = {};
let itemsMap = {};
let currentUser = null;

const cartDocRef = () => doc(db, "carts", currentUser.uid);

document.getElementById("basketIcon").addEventListener("click", () => {
  cartContainer.style.display = cartContainer.style.display === "none" ? "block" : "none";
});

function updateBasketCount() {
  const totalQty = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  basketCount.textContent = totalQty;
  placeOrderBtn.disabled = totalQty === 0;
}

function updateTotalPrice() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
  totalPriceDiv.textContent = `$${total.toFixed(2)}`;
}

function saveCartToFirestore() {
  if (!currentUser) return;
  setDoc(cartDocRef(), cart);
}

function renderCart() {
  cartItemsDiv.innerHTML = "";
  Object.entries(cart).forEach(([id, item]) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
          <span title="${item.name}">${item.name} - $${item.price}</span>
          <div>
            <button class="qty-btn" data-id="${id}" data-action="decrease" aria-label="Decrease quantity of ${item.name}">-</button>
            <span class="mx-2" aria-live="polite" aria-atomic="true">${item.qty}</span>
            <button class="qty-btn" data-id="${id}" data-action="increase" aria-label="Increase quantity of ${item.name}">+</button>
          </div>
        `;
    cartItemsDiv.appendChild(div);
  });

  cartItemsDiv.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      if (action === "increase") {
        cart[id].qty += 1;
      } else if (action === "decrease") {
        cart[id].qty -= 1;
        if (cart[id].qty <= 0) delete cart[id];
      }

      updateBasketCount();
      updateTotalPrice();
      renderCart();
      saveCartToFirestore();
    });
  });

  updateTotalPrice();
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;

    const cartSnap = await getDoc(cartDocRef());
    if (cartSnap.exists()) {
      cart = cartSnap.data() || {};
    } else {
      cart = {};
    }
    updateBasketCount();
    renderCart();

    onSnapshot(cartDocRef(), (docSnap) => {
      if (docSnap.exists()) {
        cart = docSnap.data() || {};
        updateBasketCount();
        renderCart();
      }
    });
  } else {
    currentUser = null;
    cart = {};
    updateBasketCount();
    renderCart();
  }
});

onSnapshot(itemsCol, (snapshot) => {
  itemsRow.innerHTML = "";
  itemsMap = {};

  snapshot.forEach((docSnap) => {
    const item = docSnap.data();
    const id = docSnap.id;
    itemsMap[id] = item;

    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";
    col.innerHTML = `
          <div class="card h-100 d-flex flex-column justify-content-between">
            <img src="${item.imgURL}" class="card-img-top" alt="${item.name}" />
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <p class="card-text">${item.desc}</p>
              <p class="fw-bold">$${item.price}</p>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <button class="btn add-to-cart-btn w-100" data-id="${id}">Add to Cart</button>
            </div>
          </div>
        `;

    itemsRow.appendChild(col);
  });

  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!currentUser) {
        alert("Please login to add items to cart.");
        return;
      }

      const id = btn.getAttribute("data-id");
      if (!cart[id]) {
        cart[id] = {
          ...itemsMap[id],
          qty: 1
        };
      } else {
        cart[id].qty += 1;
      }

      updateBasketCount();
      renderCart();
      saveCartToFirestore();
    });
  });
});

placeOrderBtn.addEventListener("click", () => {
  if (Object.keys(cart).length > 0) {
    successAnimation.classList.add("show");
    setTimeout(() => successAnimation.classList.remove("show"), 1500);

    alert("Your order has been placed!");
    cart = {};
    updateBasketCount();
    renderCart();
    saveCartToFirestore();
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    currentUser = null;
    cart = {};
    updateBasketCount();
    renderCart();
    window.location.href = "index.html";
  }).catch((error) => {
    alert("Error logging out: " + error.message);
  });
});
