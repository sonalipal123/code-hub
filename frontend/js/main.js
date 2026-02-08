const token = localStorage.getItem("authToken");
const currentPath = window.location.pathname;

if (!token && currentPath !== "/index.html" && currentPath !== "/") {
  // Agar token nahi hai, matlab user logged out hai
  window.location.href = "/";
}

// 2. Logout Logic 
document.addEventListener("DOMContentLoaded", () => {
  // Class 'logoutBtn' wale saare buttons dhundo
  const logoutButtons = document.querySelectorAll(".logoutBtn");

  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Token delete karein 
      localStorage.removeItem("authToken");

      // User ko home/login page par bhejein
      window.location.href = "/";
    });
  });
});

// --- NEW: FORGOT PASSWORD TOGGLE LOGIC ---
  const forgotLink = document.getElementById('forgotLink');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const authFormsContainer = document.getElementById('authFormsContainer');
const resetContainer = document.getElementById('resetContainer');
  

if (forgotLink && backToLoginBtn) {
  // Show Reset Form
  forgotLink.addEventListener("click", (e) => {
    e.preventDefault();
    authFormsContainer.style.display = "none";
    resetContainer.style.display = "block";
  });

  // Back to Login
  backToLoginBtn.addEventListener("click", () => {
    authFormsContainer.style.display = "block";
    resetContainer.style.display = "none";
    // Clear messages
    document.getElementById("resetMsg").style.display = "none";
    document.getElementById("resetSuccessMsg").style.display = "none";
  });
}


  // HANDLE PASSWORD RESET SUBMIT 
  const resetForm = document.getElementById('resetForm');
  if(resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(resetForm);
      const data = Object.fromEntries(formData);
      const msgEl = document.getElementById('resetMsg');
      const successEl = document.getElementById('resetSuccessMsg');

      msgEl.style.display = 'none';
      successEl.style.display = 'none';

      try {
        const res = await fetch('api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          successEl.textContent = "Password updated successfully! Please login.";
          successEl.style.color = 'green';
          successEl.style.display = 'block';
          resetForm.reset();
          
          // 2 second baad wapas login par bhejo
          setTimeout(() => {
             backToLoginBtn.click();
          }, 2000);
        } else {
          msgEl.textContent = result.message || "Failed to update password.";
          msgEl.style.display = 'block';
        }
      } catch (err) {
        msgEl.textContent = "Server error. Try again later.";
        msgEl.style.display = 'block';
      }
    });
  }

const LANGUAGES = [
  {
    name: "C Programs",
    page: "/code/c-programs",
    iconClass: "devicon-c-plain",
    intro:
      "C is a powerful procedural programming language used for system software, basic programs, and understanding how memory works. It is great for learning fundamentals like variables, loops, functions, and pointers. You can start with C to build a strong foundation in programming concepts.",
  },
  {
    name: "C++ Programs",
    page: "/code/cpp-programs",
    iconClass: "devicon-cplusplus-plain",
    intro:
      "C++ extends C with Object-Oriented Programming (OOP). It is widely used for competitive programming, desktop software, game engines, and high-performance applications. Learning C++ helps you understand OOP concepts like classes, inheritance and polymorphism, which are essential for modern software development.",
  },
  {
    name: "JavaScript Programs",
    page: "/code/js-programs",
    iconClass: "devicon-javascript-plain",
    intro:
      "JavaScript is the language of the browser. It makes websites interactive with events, animations, DOM updates, APIs and dynamic logic. It is also used in backend development with Node.js. Learning JavaScript opens doors to web development and full-stack programming. It is a popular choice for frontend and backend development.",
  },
  {
    name: "Python Programs",
    page: "/code/python-programs",
    iconClass: "devicon-python-plain",
    intro:
      "Python is simple and easy to read. It is used for automation, scripting, websites, data science, AI, machine learning, and beginner-friendly projects. Its clear syntax makes it great for learning programming concepts quickly. Python has a vast ecosystem of libraries and frameworks that make development faster and easier.",
  },
  {
    name: "Java Programs",
    page: "/code/java-programs",
    iconClass: "devicon-java-plain",
    intro:
      "Java is a versatile, object-oriented programming language used for building cross-platform applications, Android apps, web applications and enterprise software. It has a strong emphasis on portability, performance and security. Learning Java provides a solid foundation in OOP concepts and prepares you for careers in software development.",
  },
  {
    name: "HTML",
    page: "/code/html-syntaxes",
    iconClass: "devicon-html5-plain",
    intro:
      "HTML is the standard markup language used to structure web pages. It defines elements like headings, paragraphs, images and links. Learning HTML is the first step toward building websites and understanding how the web works.",
  },
  {
    name: "CSS Classes",
    page: "/code/css-classes",
    iconClass: "devicon-css3-plain",
    intro:
      "CSS is used to style and design web pages. It controls colors, layouts, spacing, animations and responsiveness. Mastering CSS helps you create visually appealing and modern websites.",
  },
  {
    name: "AngularJS Programs",
    page: "/code/angular-js-programs",
    iconClass: "devicon-angularjs-plain",
    intro:
      "AngularJS is a JavaScript framework used to build dynamic single-page applications. It provides features like two-way data binding, components and routing, making web development faster and more structured.",
  },
];

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildList() {
  const container = document.getElementById("langList");
  container.innerHTML = "";
  LANGUAGES.forEach((lang, idx) => {
    const item = document.createElement("div");
    item.className = "list-group-item mb-2";

    // clickable TITLE only
    const title = document.createElement("a");
    title.href = lang.page;
    title.className = "lang-title";
    const iconHtml = lang.iconClass
      ? `<i class="${escapeHtml(
          lang.iconClass
        )}" style="font-size:25px; margin-right:12px;"></i>`
      : `<span style="display:inline-block; width:22px; text-align:center; margin-right:8px;">💻</span>`;

    title.innerHTML = `${iconHtml}${escapeHtml(lang.name)}`;

    // NON-clickable intro text
    const intro = document.createElement("div");
    intro.className = "lang-intro";
    intro.textContent = lang.intro;

    item.appendChild(title);
    item.appendChild(intro);
    container.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", buildList);

const authButtons = document.querySelectorAll(".authBtn");

// open modal
authButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modalEl = document.getElementById("authModal");
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  });
});

// helper: show messages
function showMsg(elId, text) {
  const el = document.getElementById(elId);
  el.style.display = "block";
  el.textContent = text;
  setTimeout(() => {
    el.style.display = "none";
  }, 3500);
}

async function handleAuth(formId, apiEndpoint) {
  const form = document.getElementById(formId);
  const msgElement = document.getElementById(
    formId === "loginForm" ? "loginMsg" : "signupMsg"
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    msgElement.style.display = "none";
    msgElement.textContent = "";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // SUCCESS!
        const token = result.token;

        // 1. Store the token
        localStorage.setItem("authToken", token);

        // 2. Redirect to the desired page
        window.location.href = "/code.html"; // <--- THIS IS THE REDIRECT
      } else {
        // Authentication failed (e.g., wrong password, email exists)
        msgElement.textContent = result.message || "An error occurred";
        msgElement.style.display = "block";
      }
    } catch (error) {
      msgElement.textContent = "Network error or server unavailable.";
      msgElement.style.display = "block";
    }
  });
}

// Attach handlers
handleAuth("loginForm", "/api/login");
handleAuth("signupForm", "/api/signup");

