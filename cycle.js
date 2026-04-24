// ===== SWITCH ONGLETS AUTH =====
function switchAuthTab(tab) {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const tabs = document.querySelectorAll(".auth-tab");

    tabs.forEach(t => t.classList.remove("active"));

    if (tab === "login") {
        loginForm.classList.add("active");
        signupForm.classList.remove("active");
        tabs[0].classList.add("active");
    } else {
        signupForm.classList.add("active");
        loginForm.classList.remove("active");
        tabs[1].classList.add("active");
    }
}

// ===== INSCRIPTION =====
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const lastPeriod = document.getElementById("signup-lastPeriod").value;
        const periodLength = parseInt(document.getElementById("signup-periodLength").value);
        const cycle = parseInt(document.getElementById("signup-cycle").value);

        if (!name || !email || !password || !lastPeriod) {
            alert("Merci de remplir tous les champs.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.find(u => u.email === email)) {
            alert("Un compte existe déjà avec cet email.");
            return;
        }

        const newUser = { name, email, password, cycle, lastPeriod, periodLength };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        showDashboard();
    });
}

// ===== CONNEXION =====
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
            showDashboard();
        } else {
            alert("Email ou mot de passe incorrect.");
        }
    });
}

// ===== AFFICHER DASHBOARD =====
function showDashboard() {
    const authSection = document.getElementById("auth-section");
    const dashboard = document.getElementById("dashboard");
    const navbar = document.getElementById("main-navbar");

    if (authSection) authSection.style.display = "none";
    if (navbar) navbar.style.display = "flex";
    if (dashboard) {
        dashboard.classList.remove("hidden");

        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user) return;

        document.getElementById("user-name").innerText = user.name;
        document.getElementById("cycle-length").innerText = "Cycle de " + user.cycle + " jours";

        if (user.lastPeriod) {
            const result = calculateCycleData(
                user.lastPeriod,
                parseInt(user.cycle),
                parseInt(user.periodLength) || 5
            );

            document.getElementById("current-phase").innerText = result.phase;
            document.getElementById("day-of-cycle").innerText = "Jour " + result.day + " du cycle";
            document.getElementById("days-until").innerText = result.nextPeriod;
            document.getElementById("ovulation-date").innerText = result.ovulation;
        }
    }
}

// ===== CALCUL DU CYCLE =====
function calculateCycleData(lastPeriod, cycleLength, periodLength) {
    const lastDate = new Date(lastPeriod);
    const today = new Date();

    const diff = Math.max(
        0,
        Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
    );

    const nextPeriodDate = new Date(lastDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    let phase = "";
    if (diff < periodLength) {
        phase = "🔴 Menstruation";
    } else if (diff < cycleLength / 2 - 2) {
        phase = "🌱 Phase folliculaire";
    } else if (diff >= cycleLength / 2 - 2 && diff <= cycleLength / 2 + 2) {
        phase = "✨ Ovulation";
    } else {
        phase = "🌙 Phase lutéale";
    }

    return {
        nextPeriod: nextPeriodDate.toLocaleDateString("fr-FR"),
        ovulation: ovulationDate.toLocaleDateString("fr-FR"),
        phase,
        day: diff + 1
    };
}

// ===== DÉCONNEXION =====
function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

// ===== AUTO-LOGIN =====
window.addEventListener("DOMContentLoaded", function () {
    try {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (user && user.email) {
            showDashboard();
        }
    } catch (e) {
        localStorage.removeItem("currentUser");
    }
});
