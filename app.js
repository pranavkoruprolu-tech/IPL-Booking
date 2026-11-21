// ---------- Data ----------
const matches = {
  1: { name: "CSK vs MI",  prices: { general: 1500, premium: 3500, vip: 7000 } },
  2: { name: "RCB vs KKR", prices: { general: 2000, premium: 4000, vip: 8000 } },
  3: { name: "MI vs RCB",  prices: { general: 2000, premium: 4500, vip: 9000 } }
};

// ---------- Grab elements ----------
const teamFilter = document.getElementById("teamFilter");
const bookingForm = document.getElementById("bookingForm");
const matchSelect = document.getElementById("match");
const standSelect = document.getElementById("stand");
const ticketsInput = document.getElementById("tickets");
const bookingRecords = document.getElementById("bookingRecords");
const matchList = document.getElementById("matchList");
const viewToggle = document.getElementById("viewToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const toast = document.getElementById("toast");

// ---------- Toast ----------
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}

// ---------- Storage helpers ----------
function getBookings() {
  return JSON.parse(localStorage.getItem("iplBookings")) || [];
}

function saveBookings(bookings) {
  localStorage.setItem("iplBookings", JSON.stringify(bookings));
}

// ---------- Show bookings in the table ----------
function renderBookings() {
  const bookings = getBookings();
  bookingRecords.innerHTML = "";

  if (bookings.length === 0) {
    bookingRecords.innerHTML = '<tr><td colspan="6">No bookings yet.</td></tr>';
    return;
  }

  bookings.forEach(function (b) {
    const row = document.createElement("tr");
    const cells = [b.id, b.match, b.stand, b.qty, "₹" + b.total.toLocaleString("en-IN"), b.name];
    cells.forEach(function (value) {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });
    bookingRecords.appendChild(row);
  });
}

// ---------- Team filter (cards) ----------
teamFilter.addEventListener("change", function () {
  const selected = teamFilter.value;
  document.querySelectorAll(".match-card").forEach(function (card) {
    const teams = card.dataset.teams.split(" ");
    card.style.display = (selected === "all" || teams.includes(selected)) ? "" : "none";
  });
});

// ---------- Grid / List toggle ----------
viewToggle.addEventListener("click", function () {
  matchList.classList.toggle("list-view");
  const isList = matchList.classList.contains("list-view");
  viewToggle.textContent = isList ? "Switch to Grid View" : "Switch to List View";
  showToast(isList ? "List view on" : "Grid view on");
});

// ---------- Hamburger menu ----------
menuToggle.addEventListener("click", function () {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("open");
  });
});

// ---------- Book button pre-selects the match ----------
document.querySelectorAll(".book-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    matchSelect.value = btn.dataset.match;
    updateSummary();
  });
});

// ---------- Live booking summary ----------
function updateSummary() {
  const matchId = matchSelect.value;
  const stand = standSelect.value;
  const qty = parseInt(ticketsInput.value) || 0;

  let price = 0;
  if (matchId && stand) {
    price = matches[matchId].prices[stand];
  }

  document.getElementById("sumMatch").textContent = matchId ? matches[matchId].name : "-";
  document.getElementById("sumStand").textContent = stand ? stand.toUpperCase() : "-";
  document.getElementById("sumPrice").textContent = "₹" + price.toLocaleString("en-IN");
  document.getElementById("sumQty").textContent = qty;
  document.getElementById("sumTotal").textContent = "₹" + (price * qty).toLocaleString("en-IN");

  if (matchId && stand && qty > 0) {
    showToast("Summary updated: total ₹" + (price * qty).toLocaleString("en-IN"));
  }
}

matchSelect.addEventListener("change", updateSummary);
standSelect.addEventListener("change", updateSummary);
ticketsInput.addEventListener("input", updateSummary);

// ---------- Submit booking ----------
bookingForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const matchId = matchSelect.value;
  const stand = standSelect.value;
  const qty = parseInt(ticketsInput.value);
  const name = document.getElementById("name").value;
  const total = matches[matchId].prices[stand] * qty;
  const bookingId = "IPL" + Date.now().toString().slice(-6);

  const bookings = getBookings();
  bookings.push({
    id: bookingId,
    match: matches[matchId].name,
    stand: stand.toUpperCase(),
    qty: qty,
    total: total,
    name: name
  });
  saveBookings(bookings);

  renderBookings();
  bookingForm.reset();
  updateSummary();
  showToast("Booking confirmed! ID: " + bookingId);
});

// ---------- Run on page load ----------
renderBookings();
updateSummary();