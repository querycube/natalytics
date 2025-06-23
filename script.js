/* =========================================================
   script.js – COMPLETE, ready to copy-paste
   ========================================================= */

/* ----------  Firebase CDN imports  ---------- */
import { initializeApp }  from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

/* ----------  Firebase config  ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBMPuy70t-4-kWtFLC7wymbwdkxDc5ZxSY",
  authDomain: "natalytics-902ea.firebaseapp.com",
  projectId: "natalytics-902ea",
  storageBucket: "natalytics-902ea.appspot.com",   // ← सही bucket
  messagingSenderId: "203283848398",
  appId: "1:203283848398:web:bf55c3792194fa9992849f",
  measurementId: "G-KHDERQCE87"
};

/* ----------  Initialise Firebase  ---------- */
const app        = initializeApp(firebaseConfig);
const auth       = getAuth(app);
const googleProv = new GoogleAuthProvider();

/* =========================================================
   DOM Ready — सारे event-handlers और helpers
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  /* IDs आपकी HTML से मैच करने चाहिए ↓ */
  const loginForm      = document.getElementById("form-login");
  const signupForm     = document.getElementById("form-signup");
  const authModal      = document.getElementById("authModal");
  const menuBtn        = document.getElementById("menuBtn");
  const menu           = document.getElementById("menu");
  const studentDetails = document.getElementById("studentDetails");
  const profileIcon    = document.getElementById("profileIcon");

  /* ----------  helpers (पहले define)  ---------- */
  function closeAuthModal() {
    authModal.classList.add("hidden");
    loginForm.reset();
    signupForm.reset();
    switchTab("login");            // पहली टैब default
  }
  window.closeAuthModal = closeAuthModal;

  function fillProfile(user) {
    const name = user.displayName || user.email.split("@")[0];
    document.getElementById("stuName").textContent  = name;
    document.getElementById("stuClass").textContent = "—";
    document.getElementById("stuRoll").textContent  = user.uid.slice(0, 8);
    profileIcon.textContent = name[0].toUpperCase();
  }
  function clearProfile() {
    document.getElementById("stuName").textContent  = "Guest";
    document.getElementById("stuClass").textContent = "";
    document.getElementById("stuRoll").textContent  = "";
    profileIcon.textContent = "G";
  }

  /* ----------  Login (email / password)  ---------- */
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeAuthModal();
    } catch (err) { alert(err.message); }
  });

  /* ----------  Signup (email / password)  ---------- */
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = signupForm.querySelector('input[placeholder="Full Name"]').value.trim();
    const email    = signupForm.querySelector('input[type="email"]').value.trim();
    const password = signupForm.querySelector('input[type="password"]').value;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) await updateProfile(user, { displayName: fullName });
      closeAuthModal();
    } catch (err) { alert(err.message); }
  });

  /* ----------  Google login / signup  ---------- */
  window.googleLogin  =
  window.googleSignup = async function () {
    try { await signInWithPopup(auth, googleProv); closeAuthModal(); }
    catch (err) { alert(err.message); }
  };

  /* ----------  Logout  ---------- */
  window.handleLogout = async function () {
    try { await signOut(auth); }
    catch (err) { alert(err.message); }
  };

  /* ----------  Auth-state listener  ---------- */
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fillProfile(user);
      document.getElementById("menu-login-btn")?.classList.add("hidden");
      document.getElementById("menu-logout-btn")?.classList.remove("hidden");
    } else {
      clearProfile();
      document.getElementById("menu-login-btn")?.classList.remove("hidden");
      document.getElementById("menu-logout-btn")?.classList.add("hidden");
    }
    onAuthStateChanged(auth, (user) => {
  if (user) {
    fillProfile(user);

    /* 👋 wave animation */
    const pIcon = document.getElementById("profileIcon");
    pIcon.classList.add("wave");               // CSS ripple चालू
    setTimeout(() => pIcon.classList.remove("wave"), 900); // 0.8 s बाद साफ़
  } else {
    clearProfile();
  }
});

  });

  /* =========================================================
     आपका बाकी UI logic (hamburger, tabs, backdrop clicks)
     ========================================================= */

  /* Modal toggle */
  window.toggleModal = function () {
    authModal.classList.toggle("hidden");
  };

  /* Hamburger */
  menuBtn?.addEventListener("click", () => menu.classList.toggle("hidden"));

  /* Profile dropdown */
  window.toggleStudentDetails = function () {
    studentDetails.classList.toggle("hidden");
  };

  /* Tab switch (login / signup) */
  window.switchTab = function (tab) {
    const slider     = document.getElementById("form-slider");
    const tabLogin   = document.getElementById("tab-login");
    const tabSignup  = document.getElementById("tab-signup");
    const formLogin  = document.getElementById("form-login");
    const formSignup = document.getElementById("form-signup");

    if (tab === "login") {
      slider.style.transform = "translateX(0%)";
      tabLogin.classList.add("active");  tabLogin.classList.remove("inactive");
      tabSignup.classList.remove("active"); tabSignup.classList.add("inactive");
      formLogin.style.backgroundColor  = "var(--navy)";
      formSignup.style.backgroundColor = "transparent";
    } else {
      slider.style.transform = "translateX(-50%)";
      tabSignup.classList.add("active"); tabSignup.classList.remove("inactive");
      tabLogin.classList.remove("active"); tabLogin.classList.add("inactive");
      formSignup.style.backgroundColor = "var(--green)";
      formLogin.style.backgroundColor  = "transparent";
    }
  };

  /* Click-outside close handlers */
  document.addEventListener("click", (e) => {
    const modalBox = document.querySelector(".modal-box");

    /* profile box */
    if (!profileIcon.contains(e.target) && !studentDetails.contains(e.target)) {
      studentDetails.classList.add("hidden");
    }

    /* mobile menu */
    if (window.innerWidth < 768 && !menuBtn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add("hidden");
    }

    /* modal */
    if (!authModal.classList.contains("hidden") &&
        !modalBox.contains(e.target) &&
        ![...document.querySelectorAll(".login-btn")].some(btn => btn.contains(e.target))) {
      authModal.classList.add("hidden");
    }
  });

  /* ESC key closes everything */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      studentDetails.classList.add("hidden");
      menu.classList.add("hidden");
      authModal.classList.add("hidden");
    }
  });

  /* Page-load: default to login tab */
  switchTab("login");


/* =========  Firebase-Auth Logic END  ========= */



  // 🍔 Hamburger toggle
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("menu").classList.toggle("hidden");
  });

  // 🔐 Auth modal toggle
  window.toggleModal = function () {
    document.getElementById("authModal").classList.toggle("hidden");
  };

  // 🔁 Login/Signup tab switch with complementary background
  window.switchTab = function (tab) {
    const slider = document.getElementById("form-slider");
    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");
    const formLogin = document.getElementById("form-login");
    const formSignup = document.getElementById("form-signup");

    if (tab === "login") {
      slider.style.transform = "translateX(0%)";

      // Tabs UI
      tabLogin.classList.add("active");
      tabLogin.classList.remove("inactive");
      tabSignup.classList.remove("active");
      tabSignup.classList.add("inactive");

      // Complementary background
      formLogin.style.backgroundColor = "var(--navy)";
      formSignup.style.backgroundColor = "transparent";
    } else {
      slider.style.transform = "translateX(-50%)";

      tabSignup.classList.add("active");
      tabSignup.classList.remove("inactive");
      tabLogin.classList.remove("active");
      tabLogin.classList.add("inactive");

      formSignup.style.backgroundColor = "var(--green)";
      formLogin.style.backgroundColor = "transparent";
    }
  };

  // 👤 Profile dropdown toggle
  window.toggleStudentDetails = function () {
    document.getElementById("studentDetails").classList.toggle("hidden");
  };


  // 🔗 From hamburger menu: login/signup
  window.handleMenuLogin = function () {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("authModal").classList.remove("hidden");
  };

  // ✅ Click Outside: close modal, menu, or profile
  document.addEventListener("click", function (e) {
    const profileIcon = document.getElementById("profileIcon");
    const studentDetails = document.getElementById("studentDetails");
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    const modalBox = document.querySelector(".modal-box");

    // 👤 Close student box
    if (!profileIcon.contains(e.target) && !studentDetails.contains(e.target)) {
      studentDetails.classList.add("hidden");
    }

    // 🍔 Close menu
    // 🍔 Close menu only on mobile
if (
  window.innerWidth < 768 &&
  !menuBtn.contains(e.target) &&
  !menu.contains(e.target)
) {
  menu.classList.add("hidden");
}


    // 🔐 Close modal if clicked outside
    const modal = document.getElementById("authModal");
    if (
      modal &&
      !modal.classList.contains("hidden") &&
      !modalBox.contains(e.target) &&
      ![...document.querySelectorAll(".login-btn")].some(btn => btn.contains(e.target))
    ) {
      modal.classList.add("hidden");
    }
  });

  // ⎋ ESC closes all
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.getElementById("studentDetails").classList.add("hidden");
      document.getElementById("menu").classList.add("hidden");
      document.getElementById("authModal").classList.add("hidden");
    }
  });

  // 🎁 BONUS: Default to login tab + background
  window.switchTab("login");
});

  // Add Firebase logout or logic here later
