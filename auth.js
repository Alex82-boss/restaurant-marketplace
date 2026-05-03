import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ─── If already logged in, redirect away from login page ───────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) return; // stay on login page

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const role = snap.data().role;
  redirectByRole(role);
});

// ─── Redirect based on role ─────────────────────────────────────────────────
function redirectByRole(role) {
  if (role === "rep")        window.location.href = "dashboard.html";
  else if (role === "admin") window.location.href = "admin.html";
  else                       window.location.href = "marketplace.html";
}

// ─── Tab switching ───────────────────────────────────────────────────────────
let selectedRole = "customer";

window.switchTab = (tab) => {
  const loginPanel  = document.getElementById("loginPanel");
  const signupPanel = document.getElementById("signupPanel");
  const tabLogin    = document.getElementById("tabLogin");
  const tabSignup   = document.getElementById("tabSignup");

  if (tab === "login") {
    loginPanel.style.display  = "block";
    signupPanel.style.display = "none";
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
  } else {
    loginPanel.style.display  = "none";
    signupPanel.style.display = "block";
    tabLogin.classList.remove("active");
    tabSignup.classList.add("active");
  }
};

// ─── Login method toggle (email / phone) ────────────────────────────────────
window.switchLoginMethod = (method) => {
  const emailForm = document.getElementById("loginEmailForm");
  const phoneForm = document.getElementById("loginPhoneForm");
  const emailBtn  = document.getElementById("loginEmailBtn");
  const phoneBtn  = document.getElementById("loginPhoneBtn");

  if (method === "email") {
    emailForm.style.display = "block";
    phoneForm.style.display = "none";
    emailBtn.classList.add("active");
    phoneBtn.classList.remove("active");
  } else {
    emailForm.style.display = "none";
    phoneForm.style.display = "block";
    emailBtn.classList.remove("active");
    phoneBtn.classList.add("active");
  }
};

// ─── Signup method toggle ────────────────────────────────────────────────────
window.switchSignupMethod = (method) => {
  const emailForm = document.getElementById("signupEmailForm");
  const phoneForm = document.getElementById("signupPhoneForm");
  const emailBtn  = document.getElementById("signupEmailBtn");
  const phoneBtn  = document.getElementById("signupPhoneBtn");

  if (method === "email") {
    emailForm.style.display = "block";
    phoneForm.style.display = "none";
    emailBtn.classList.add("active");
    phoneBtn.classList.remove("active");
  } else {
    emailForm.style.display = "none";
    phoneForm.style.display = "block";
    emailBtn.classList.remove("active");
    phoneBtn.classList.add("active");
  }
};

// ─── Role selection ──────────────────────────────────────────────────────────
window.selectRole = (role) => {
  selectedRole = role;

  // Update both email and phone role buttons
  ["roleCustomer","roleRep","roleCustomerPhone","roleRepPhone"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("active");
  });

  if (role === "customer") {
    document.getElementById("roleCustomer")?.classList.add("active");
    document.getElementById("roleCustomerPhone")?.classList.add("active");
  } else {
    document.getElementById("roleRep")?.classList.add("active");
    document.getElementById("roleRepPhone")?.classList.add("active");
  }
};

// ─── Email Login ─────────────────────────────────────────────────────────────
window.loginWithEmail = async () => {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("loginError");
  errEl.textContent = "";

  if (!email || !password) {
    errEl.textContent = "Please fill in all fields.";
    return;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    redirectByRole(snap.data()?.role || "customer");
  } catch (err) {
    errEl.textContent = friendlyError(err.code);
  }
};

// ─── Email Sign Up ───────────────────────────────────────────────────────────
window.signupWithEmail = async () => {
  const name     = document.getElementById("signupName").value.trim();
  const email    = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const errEl    = document.getElementById("signupError");
  errEl.textContent = "";

  if (!name || !email || !password) {
    errEl.textContent = "Please fill in all fields.";
    return;
  }
  if (password.length < 6) {
    errEl.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Save user profile + role to Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role: selectedRole,       // "customer" or "rep"
      createdAt: new Date().toISOString()
    });

    redirectByRole(selectedRole);
  } catch (err) {
    errEl.textContent = friendlyError(err.code);
  }
};

// ─── Phone OTP ───────────────────────────────────────────────────────────────
let confirmationResult = null;

window.sendPhoneOTP = async (context) => {
  const phoneInput = context === "login"
    ? document.getElementById("loginPhone")
    : document.getElementById("signupPhone");
  const recaptchaId = context === "login" ? "loginRecaptcha" : "signupRecaptcha";
  const errEl = document.getElementById(`${context}Error`);
  errEl.textContent = "";

  const phone = phoneInput.value.trim();
  if (!phone) {
    errEl.textContent = "Please enter a phone number.";
    return;
  }

  try {
    // Set up invisible reCAPTCHA (required by Firebase)
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaId, {
        size: "invisible"
      });
    }

    confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);

    // Show OTP input
    const otpBox = document.getElementById(`${context}OTPBox`);
    if (otpBox) otpBox.style.display = "block";
    phoneInput.disabled = true;
    errEl.textContent = "OTP sent! Check your messages.";
    errEl.style.color = "#22c55e";
  } catch (err) {
    errEl.textContent = friendlyError(err.code);
    errEl.style.color = "";
  }
};

window.verifyPhoneOTP = async (context) => {
  const otp   = document.getElementById(`${context}OTP`).value.trim();
  const errEl = document.getElementById(`${context}Error`);
  errEl.textContent = "";

  if (!otp) {
    errEl.textContent = "Please enter the OTP.";
    return;
  }

  try {
    const cred = await confirmationResult.confirm(otp);

    if (context === "signup") {
      // Save new phone user to Firestore
      const name = document.getElementById("signupNamePhone").value.trim();
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        phone: cred.user.phoneNumber,
        role: selectedRole,
        createdAt: new Date().toISOString()
      });
      redirectByRole(selectedRole);
    } else {
      // Login — fetch existing role
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      redirectByRole(snap.data()?.role || "customer");
    }
  } catch (err) {
    errEl.textContent = "Invalid OTP. Please try again.";
  }
};

// ─── Friendly error messages ─────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/user-not-found":       "No account found with this email.",
    "auth/wrong-password":       "Incorrect password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/too-many-requests":    "Too many attempts. Please try again later.",
    "auth/invalid-phone-number": "Please enter a valid phone number with country code.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
