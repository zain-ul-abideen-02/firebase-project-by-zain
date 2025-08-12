
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAjUJZyLk9RxcUC5n_vrxTq0cRXMylLmAs",
      authDomain: "fire-base-project-e25ab.firebaseapp.com",
      projectId: "fire-base-project-e25ab",
      appId: "1:495616776229:web:f8c9da94e3b8aaea9b47cc"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const signupCard = document.getElementById("signupCard");
    const loginCard = document.getElementById("loginCard");

    
    window.showLogin = function () {
      signupCard.classList.add("d-none");
      loginCard.classList.remove("d-none");
    };

    
    window.showSignup = function () {
      loginCard.classList.add("d-none");
      signupCard.classList.remove("d-none");
    };
    
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("signupEmail").value.trim().toLowerCase();
      const password = document.getElementById("signupPassword").value;

      createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Signup Successful!',
            text: 'You can now log in.',
            timer: 2000,
            showConfirmButton: false
          });
          showLogin();
          signupForm.reset();
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Signup Error',
            text: error.message,
          });
        });
    });

    
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value;

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            if (email === "zain@gmail.com") {
              window.location.href = "admin.html";
            } else {
              window.location.href = "user.html";
            }
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Login Error',
            text: error.message,
          });
        });
    });