import { register, login, logout, getProfile, getStoredToken } from "./api/auth.js";
import { getCategories, createCategory, updateCategory, deleteCategory } from "./api/categories.js";
import { getMenuItems, createMenuItem, updateMenuItem, updateMenuItemAvailability, deleteMenuItem } from "./api/menu.js";
import { createOrder, getOrders, cancelOrder, updateOrderStatus } from "./api/orders.js";
import { getTables, createTable, updateTable, updateTableAvailability, deleteTable } from "./api/tables.js";
import { createReservation, getReservations, cancelReservation, updateReservationStatus } from "./api/reservations.js";
import { animate, inView } from "motion";

function getStoredCart() {
  try {
    const entries = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!Array.isArray(entries)) return new Map();
    return new Map(entries.filter(([id, value]) =>
      Number.isInteger(Number(id)) &&
      value?.item &&
      Number.isInteger(value.quantity) &&
      value.quantity > 0
    ).map(([id, value]) => [Number(id), value]));
  } catch {
    return new Map();
  }
}

// ================= Application State =================
const state = {
  user: null,
  categories: [],
  menuItems: [],
  selectedCategoryId: "",
  searchQuery: "",
  cart: getStoredCart(), // menuItemId -> { item, quantity }
  orders: [],
  tables: [],
  selectedBookingTableId: null,
  reservations: [],
  adminReservations: [],
  adminOrders: [],
  activeView: "menu", // "menu" | "bookTable" | "orders" | "reservations" | "admin"
  adminSubTab: "tables", // "tables" | "reservations" | "orders"
  authModalMode: "login"
};

const modalTransitionTokens = new WeakMap();

// ================= DOM Elements =================
// Header & Navigation
const brandLogo = document.getElementById("brandLogo");
const authWidget = document.getElementById("authWidget");
const navMenuBtn = document.getElementById("navMenuBtn");
const navBookTableBtn = document.getElementById("navBookTableBtn");
const navOrdersBtn = document.getElementById("navOrdersBtn");
const navReservationsBtn = document.getElementById("navReservationsBtn");
const navAdminBtn = document.getElementById("navAdminBtn");
const managementNavLabel = document.getElementById("managementNavLabel");
const navCartBtn = document.getElementById("navCartBtn");
const primaryNav = document.getElementById("primaryNav");
const mobileNavToggle = document.getElementById("mobileNavToggle");
const cartCountBadge = document.getElementById("cartCountBadge");
const toastContainer = document.getElementById("toastContainer");

// Sections
const menuSection = document.getElementById("menuSection");
const bookTableSection = document.getElementById("bookTableSection");
const ordersSection = document.getElementById("ordersSection");
const reservationsSection = document.getElementById("reservationsSection");
const adminSection = document.getElementById("adminSection");

// Menu & Cart
const heroBookTableBtn = document.getElementById("heroBookTableBtn");
const storyBookTableBtn = document.getElementById("storyBookTableBtn");
const experienceBookTableBtn = document.getElementById("experienceBookTableBtn");
const categoryButtonsContainer = document.getElementById("categoryButtonsContainer");
const menuSearchInput = document.getElementById("menuSearchInput");
const itemsCountLabel = document.getElementById("itemsCountLabel");
const menuGrid = document.getElementById("menuGrid");
const menuLoadingSpinner = document.getElementById("menuLoadingSpinner");
const menuErrorBanner = document.getElementById("menuErrorBanner");
const menuErrorMessage = document.getElementById("menuErrorMessage");
const retryMenuBtn = document.getElementById("retryMenuBtn");
const menuEmptyNotice = document.getElementById("menuEmptyNotice");
const cartItemsList = document.getElementById("cartItemsList");
const cartSubtotalText = document.getElementById("cartSubtotalText");
const cartTotalText = document.getElementById("cartTotalText");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const authNotice = document.getElementById("authNotice");

// Book a Table
const viewMyBookingsQuickBtn = document.getElementById("viewMyBookingsQuickBtn");
const bookingDateTimeInput = document.getElementById("bookingDateTimeInput");
const selectedTableDisplay = document.getElementById("selectedTableDisplay");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");
const bookingAuthNotice = document.getElementById("bookingAuthNotice");
const bookingTablesLoading = document.getElementById("bookingTablesLoading");
const bookingTablesEmpty = document.getElementById("bookingTablesEmpty");
const tablesGrid = document.getElementById("tablesGrid");

// My Orders
const ordersStatusFilter = document.getElementById("ordersStatusFilter");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");
const ordersLoadingSpinner = document.getElementById("ordersLoadingSpinner");
const ordersNotLoggedIn = document.getElementById("ordersNotLoggedIn");
const ordersEmptyState = document.getElementById("ordersEmptyState");
const ordersList = document.getElementById("ordersList");
const ordersLoginBtn = document.getElementById("ordersLoginBtn");
const goToMenuBtn = document.getElementById("goToMenuBtn");

// My Reservations
const newReservationBtn = document.getElementById("newReservationBtn");
const reservationsLoadingSpinner = document.getElementById("reservationsLoadingSpinner");
const reservationsNotLoggedIn = document.getElementById("reservationsNotLoggedIn");
const reservationsEmptyState = document.getElementById("reservationsEmptyState");
const reservationsList = document.getElementById("reservationsList");
const reservationsLoginBtn = document.getElementById("reservationsLoginBtn");
const bookTableNowBtn = document.getElementById("bookTableNowBtn");

// Admin Sub-tabs & Panels
const adminTabTables = document.getElementById("adminTabTables");
const adminTabReservations = document.getElementById("adminTabReservations");
const adminTabOrders = document.getElementById("adminTabOrders");
const adminTabMenu = document.getElementById("adminTabMenu");
const adminTabCategories = document.getElementById("adminTabCategories");
const adminMenuPanel = document.getElementById("adminMenuPanel");
const adminCategoriesPanel = document.getElementById("adminCategoriesPanel");
const adminTablesPanel = document.getElementById("adminTablesPanel");
const adminReservationsPanel = document.getElementById("adminReservationsPanel");
const adminOrdersPanel = document.getElementById("adminOrdersPanel");
const createTableForm = document.getElementById("createTableForm");
const adminTableNumberInput = document.getElementById("adminTableNumberInput");
const adminTableCapacityInput = document.getElementById("adminTableCapacityInput");
const adminTablesTableBody = document.getElementById("adminTablesTableBody");
const refreshAdminTablesBtn = document.getElementById("refreshAdminTablesBtn");
const adminReservationsFilter = document.getElementById("adminReservationsFilter");
const adminReservationsList = document.getElementById("adminReservationsList");
const refreshAdminOrdersBtn = document.getElementById("refreshAdminOrdersBtn");
const adminOrdersList = document.getElementById("adminOrdersList");
const managementTitle = document.getElementById("managementTitle");
const managementRoleBadge = document.getElementById("managementRoleBadge");
const managementDescription = document.getElementById("managementDescription");
const menuItemForm = document.getElementById("menuItemForm");
const menuItemId = document.getElementById("menuItemId");
const menuItemName = document.getElementById("menuItemName");
const menuItemPrice = document.getElementById("menuItemPrice");
const menuItemCategory = document.getElementById("menuItemCategory");
const menuItemDescription = document.getElementById("menuItemDescription");
const menuItemAvailable = document.getElementById("menuItemAvailable");
const menuItemFormTitle = document.getElementById("menuItemFormTitle");
const menuItemSubmitBtn = document.getElementById("menuItemSubmitBtn");
const menuItemCancelEditBtn = document.getElementById("menuItemCancelEditBtn");
const refreshAdminMenuBtn = document.getElementById("refreshAdminMenuBtn");
const adminMenuItemsTableBody = document.getElementById("adminMenuItemsTableBody");
const createCategoryForm = document.getElementById("createCategoryForm");
const categoryNameInput = document.getElementById("categoryNameInput");
const adminCategoriesList = document.getElementById("adminCategoriesList");

// Edit Table Modal
const editTableModal = document.getElementById("editTableModal");
const closeEditTableModalBtn = document.getElementById("closeEditTableModalBtn");
const editTableForm = document.getElementById("editTableForm");
const editTableId = document.getElementById("editTableId");
const editTableNumber = document.getElementById("editTableNumber");
const editTableCapacity = document.getElementById("editTableCapacity");

// Auth Modal
const authModal = document.getElementById("authModal");
const closeAuthModalBtn = document.getElementById("closeAuthModalBtn");
const authForm = document.getElementById("authForm");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const nameFieldGroup = document.getElementById("nameFieldGroup");
const authNameInput = document.getElementById("authNameInput");
const authEmailInput = document.getElementById("authEmailInput");
const authPasswordInput = document.getElementById("authPasswordInput");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authErrorMessage = document.getElementById("authErrorMessage");
const quickFillCustomerBtn = document.getElementById("quickFillCustomerBtn");
const quickFillStaffBtn = document.getElementById("quickFillStaffBtn");
const quickFillAdminBtn = document.getElementById("quickFillAdminBtn");
const demoLoginControls = document.getElementById("demoLoginControls");

// ================= Utilities =================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const isError = type === "error";

  toast.className = `pointer-events-auto px-4 py-3 rounded-xl shadow-lg border text-sm flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${
    isError ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
  }`;

  toast.innerHTML = `
    <span>${isError ? "⚠️" : "✓"}</span>
    <span class="font-medium">${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function transitionModal(modal, isOpen) {
  const token = (modalTransitionTokens.get(modal) || 0) + 1;
  modalTransitionTokens.set(modal, token);
  const panel = modal.firstElementChild;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!isOpen && reducedMotion) {
    modal.classList.add("hidden");
    return;
  }

  if (isOpen) {
    modal.classList.remove("hidden");
  }

  if (reducedMotion) return;

  const animation = isOpen
    ? { opacity: [0, 1], y: [14, 0], scale: [0.985, 1] }
    : { opacity: [1, 0], y: [0, 10], scale: [1, 0.99] };

  animate(panel, animation, {
    duration: isOpen ? 0.28 : 0.2,
    ease: [0.22, 0.61, 0.36, 1]
  }).then(() => {
    if (!isOpen && modalTransitionTokens.get(modal) === token) {
      modal.classList.add("hidden");
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PREPARING":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "READY":
      return "bg-teal-100 text-teal-800 border-teal-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function closeMobileNavigation() {
  primaryNav.classList.remove("is-open");
  mobileNavToggle.setAttribute("aria-expanded", "false");
  mobileNavToggle.setAttribute("aria-label", "Open navigation");
}

function initializeMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  inView(".reveal-on-scroll", (element) => {
    animate(
      element,
      { opacity: [0, 1], y: [26, 0] },
      { duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }
    );
  });
}

// ================= View Navigation =================
function switchView(viewName) {
  const isManagementUser = state.user && (state.user.role === "STAFF" || state.user.role === "ADMIN");
  if (viewName === "admin" && !isManagementUser) {
    viewName = "menu";
  } else if (isManagementUser && viewName !== "admin") {
    viewName = "admin";
  }

  state.activeView = viewName;

  // Hide all sections
  menuSection.classList.add("hidden");
  bookTableSection.classList.add("hidden");
  ordersSection.classList.add("hidden");
  reservationsSection.classList.add("hidden");
  adminSection.classList.add("hidden");

  // Reset nav styles
  [navMenuBtn, navBookTableBtn, navOrdersBtn, navReservationsBtn].forEach((btn) => {
    btn.className = "nav-link";
  });
  if (isManagementUser) {
    document.querySelectorAll("[data-customer-nav]").forEach((element) => element.classList.add("hidden"));
  }
  navAdminBtn.className = "nav-link";
  if (!isManagementUser) navAdminBtn.classList.add("hidden");

  if (viewName === "menu") {
    menuSection.classList.remove("hidden");
    navMenuBtn.className = "nav-link is-active";
  } else if (viewName === "bookTable") {
    bookTableSection.classList.remove("hidden");
    navBookTableBtn.className = "nav-link is-active";
    initBookingFormDefaultDate();
    loadTablesForBooking();
  } else if (viewName === "orders") {
    ordersSection.classList.remove("hidden");
    navOrdersBtn.className = "nav-link is-active";
    loadOrders();
  } else if (viewName === "reservations") {
    reservationsSection.classList.remove("hidden");
    navReservationsBtn.className = "nav-link is-active";
    loadReservations();
  } else if (viewName === "admin") {
    adminSection.classList.remove("hidden");
    navAdminBtn.className = "nav-link is-active";
    loadAdminData();
  }
  closeMobileNavigation();
  const activeSection = document.getElementById(`${viewName}Section`);
  if (activeSection && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animate(activeSection, { opacity: [0.72, 1], y: [8, 0] }, { duration: 0.35, ease: "easeOut" });
  }
}

function switchAdminSubTab(tabName) {
  state.adminSubTab = tabName;
  adminMenuPanel.classList.add("hidden");
  adminCategoriesPanel.classList.add("hidden");
  adminTablesPanel.classList.add("hidden");
  adminReservationsPanel.classList.add("hidden");
  adminOrdersPanel.classList.add("hidden");

  [adminTabMenu, adminTabCategories, adminTabTables, adminTabReservations, adminTabOrders].forEach((btn) => {
    btn.className = "px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900";
  });

  if (tabName === "menu") {
    adminMenuPanel.classList.remove("hidden");
    adminTabMenu.className = "px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs";
    loadAdminMenu();
  } else if (tabName === "categories") {
    adminCategoriesPanel.classList.remove("hidden");
    adminTabCategories.className = "px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs";
    loadAdminCategories();
  } else if (tabName === "tables") {
    adminTablesPanel.classList.remove("hidden");
    adminTabTables.className = "px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs";
    loadAdminTables();
  } else if (tabName === "reservations") {
    adminReservationsPanel.classList.remove("hidden");
    adminTabReservations.className = "px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs";
    loadAdminReservations();
  } else if (tabName === "orders") {
    adminOrdersPanel.classList.remove("hidden");
    adminTabOrders.className = "px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs";
    loadAdminOrders();
  }
}

// ================= Auth Management =================
function updateAuthWidget() {
  const isStaffOrAdmin = state.user && (state.user.role === "STAFF" || state.user.role === "ADMIN");

  document.querySelectorAll("[data-customer-nav]").forEach((element) => {
    element.classList.toggle("hidden", Boolean(isStaffOrAdmin));
  });
  if (isStaffOrAdmin) {
    navAdminBtn.classList.remove("hidden");
    managementNavLabel.textContent = state.user.role === "ADMIN" ? "⚙️ Admin Dashboard" : "⚙️ Staff Dashboard";
    managementTitle.textContent = state.user.role === "ADMIN" ? "Admin Dashboard" : "Staff Dashboard";
    managementRoleBadge.textContent = state.user.role;
    managementDescription.textContent = state.user.role === "ADMIN"
      ? "Manage menu, tables, reservations, and restaurant orders."
      : "Manage menu availability, tables, reservations, and restaurant orders.";
    if (state.activeView !== "admin") {
      state.adminSubTab = state.user.role === "ADMIN" ? "menu" : "orders";
      switchView("admin");
    }
  } else {
    navAdminBtn.classList.add("hidden");
    managementNavLabel.textContent = "⚙️ Management";
    if (state.activeView === "admin") {
      switchView("menu");
    }
  }

  if (state.user) {
    const roleBadgeColor = state.user.role === "ADMIN"
      ? "bg-purple-100 text-purple-800"
      : state.user.role === "STAFF"
      ? "bg-blue-100 text-blue-800"
      : "bg-emerald-100 text-emerald-800";

    authWidget.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-900 leading-tight">${escapeHtml(state.user.name)}</p>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${roleBadgeColor}">${state.user.role}</span>
        </div>
        <button id="logoutBtn" class="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors">
          Sign Out
        </button>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      logout();
      state.user = null;
      updateAuthWidget();
      updateCartUI();
      updateBookingAuthUI();
      showToast("Signed out successfully.");
      if (state.activeView === "orders") loadOrders();
      if (state.activeView === "reservations") loadReservations();
      if (state.activeView === "admin") switchView("menu");
    });

    authNotice.textContent = `Ordering as ${state.user.name}`;
    authNotice.className = "text-center text-xs text-emerald-600 font-medium mt-2";
  } else {
    authWidget.innerHTML = `
      <button id="openAuthModalBtn" class="text-xs py-1.5 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors shadow-xs">
        Sign In
      </button>
    `;

    document.getElementById("openAuthModalBtn").addEventListener("click", () => {
      openAuthModal("login");
    });

    authNotice.textContent = "Sign in to place your order.";
    authNotice.className = "text-center text-xs text-slate-400 mt-2";
  }

  updateBookingAuthUI();
}

function updateBookingAuthUI() {
  if (state.user) {
    bookingAuthNotice.textContent = `Booking as ${state.user.name}`;
    bookingAuthNotice.className = "text-center text-xs text-emerald-600 font-medium";
  } else {
    bookingAuthNotice.textContent = "Sign in to confirm your table reservation.";
    bookingAuthNotice.className = "text-center text-xs text-slate-400";
  }
}

function openAuthModal(mode = "login") {
  state.authModalMode = mode;
  authErrorMessage.classList.add("hidden");
  authErrorMessage.textContent = "";

  if (mode === "login") {
    demoLoginControls.classList.remove("hidden");
    tabLogin.className = "flex-1 text-center py-1.5 font-bold text-sm border-b-2 border-amber-600 text-amber-600";
    tabRegister.className = "flex-1 text-center py-1.5 font-semibold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800";
    nameFieldGroup.classList.add("hidden");
    authSubmitBtn.textContent = "Sign In";
  } else {
    demoLoginControls.classList.add("hidden");
    tabRegister.className = "flex-1 text-center py-1.5 font-bold text-sm border-b-2 border-amber-600 text-amber-600";
    tabLogin.className = "flex-1 text-center py-1.5 font-semibold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800";
    nameFieldGroup.classList.remove("hidden");
    authSubmitBtn.textContent = "Create Account";
  }

  transitionModal(authModal, true);
  authEmailInput.focus();
}

function closeAuthModal() {
  transitionModal(authModal, false);
}

// ================= Menu & Ordering =================
async function loadCategories() {
  try {
    const categories = await getCategories();
    state.categories = categories;

    categoryButtonsContainer.innerHTML = `
      <button data-category-id="" class="category-btn active px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-amber-600 text-white transition-colors">
        All Dishes
      </button>
    `;

    categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.dataset.categoryId = String(cat.id);
      btn.className = "category-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors";
      btn.textContent = cat.name;
      categoryButtonsContainer.appendChild(btn);
    });

    categoryButtonsContainer.querySelectorAll(".category-btn").forEach((button) => {
      button.addEventListener("click", () => {
        categoryButtonsContainer.querySelectorAll(".category-btn").forEach((b) => {
          b.className = "category-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors";
        });
        button.className = "category-btn active px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-amber-600 text-white transition-colors";

        state.selectedCategoryId = button.dataset.categoryId;
        loadMenuItems();
      });
    });
  } catch (error) {
    categoryButtonsContainer.innerHTML = `<span class="text-xs text-red-600">${escapeHtml(error.message)}</span>`;
  }
}

async function loadMenuItems() {
  menuLoadingSpinner.classList.remove("hidden");
  menuErrorBanner.classList.add("hidden");
  menuEmptyNotice.classList.add("hidden");
  menuGrid.innerHTML = "";
  itemsCountLabel.textContent = "Loading...";

  try {
    const items = await getMenuItems({
      categoryId: state.selectedCategoryId || undefined,
      search: state.searchQuery || undefined
    });

    state.menuItems = items;
    menuLoadingSpinner.classList.add("hidden");

    if (!items || items.length === 0) {
      menuEmptyNotice.classList.remove("hidden");
      itemsCountLabel.textContent = "0 dishes found";
      return;
    }

    itemsCountLabel.textContent = `${items.length} delicious options`;
    renderMenuGrid(items);
  } catch (error) {
    menuLoadingSpinner.classList.add("hidden");
    menuErrorBanner.classList.remove("hidden");
    menuErrorMessage.textContent = error.message;
    itemsCountLabel.textContent = "Unable to load menu";
  }
}

function getMenuImage(item, index) {
  const itemDescription = `${item.name} ${item.category?.name || ""}`.toLowerCase();
  const imageByType = [
    { match: /steak|beef|ribeye/, id: "photo-1546833999-b9f581a1996d" },
    { match: /pasta|noodle|risotto|ravioli/, id: "photo-1473093295043-cdd812d0e601" },
    { match: /salad|vegetarian|vegan|greens|vegetable/, id: "photo-1512621776951-a57141f2eefd" },
    { match: /dessert|cake|chocolate|sweet|tart/, id: "photo-1488477181946-6428a0291777" },
    { match: /seafood|fish|salmon|shrimp|prawn/, id: "photo-1519708227418-c8fd9a32b7a2" },
    { match: /pizza|flatbread/, id: "photo-1513104890138-7c749659a591" },
    { match: /burger|sandwich/, id: "photo-1568901346375-23c9450c58cd" },
    { match: /coffee|espresso|cold brew/, id: "photo-1461023058943-07fcbe16d735" },
    { match: /lemonade|juice|tea|drink|beverage/, id: "photo-1470337458703-46ad1756a187" },
    { match: /chicken|poultry/, id: "photo-1532550907401-a500c9a57435" }
  ];
  const match = imageByType.find(({ match: pattern }) => pattern.test(itemDescription));
  const imageId = match?.id || [
    "photo-1504674900247-0877df9cc836",
    "photo-1547592180-85f173990554",
    "photo-1547592166-23ac45744acd"
  ][index % 3];

  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=900&q=84`;
}

function renderMenuGrid(items) {
  menuGrid.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "food-card";

    const isAvailable = item.isAvailable;
    const categoryName = item.category ? item.category.name : "Specialty";

    card.innerHTML = `
      <div class="food-image-wrap">
        <img src="${getMenuImage(item, index)}" alt="${escapeHtml(item.name)} prepared at Gourmet Haven" loading="lazy" decoding="async" />
      </div>
      <div class="food-card-content">
        <div class="food-topline">
          <span class="food-category">${escapeHtml(categoryName)}</span>
          <span class="food-availability ${isAvailable ? "" : "is-sold-out"}">${isAvailable ? "Available today" : "Currently unavailable"}</span>
        </div>
        <h4>${escapeHtml(item.name)}</h4>
        <p class="food-description">
          ${escapeHtml(item.description || "Freshly made to order with authentic seasonal ingredients.")}
        </p>
        <div class="food-bottomline">
          <span class="food-price">${formatPrice(item.price)}</span>
        <button
          class="add-to-cart-btn"
          data-item-id="${item.id}"
          ${!isAvailable ? "disabled" : ""}
        >
          <span aria-hidden="true">+</span> Add to bag
        </button>
        </div>
      </div>
    `;

    const addBtn = card.querySelector(".add-to-cart-btn");
    if (isAvailable) {
      addBtn.addEventListener("click", () => addToCart(item));
    }

    menuGrid.appendChild(card);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animate(card, { opacity: [0, 1], y: [16, 0] }, { duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 0.61, 0.36, 1] });
    }
  });
}

function addToCart(item) {
  const current = state.cart.get(item.id);
  if (current) {
    current.quantity += 1;
  } else {
    state.cart.set(item.id, { item, quantity: 1 });
  }
  updateCartUI();
  showToast(`Added "${item.name}" to cart`);
}

function updateCartItemQuantity(itemId, delta) {
  const current = state.cart.get(itemId);
  if (!current) return;
  current.quantity += delta;
  if (current.quantity <= 0) {
    state.cart.delete(itemId);
  }
  updateCartUI();
}

function clearCart() {
  state.cart.clear();
  updateCartUI();
}

function updateCartUI() {
  localStorage.setItem("cart", JSON.stringify(Array.from(state.cart.entries())));
  const items = Array.from(state.cart.values());
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  if (totalItemsCount > 0) {
    cartCountBadge.textContent = totalItemsCount;
    cartCountBadge.classList.remove("hidden");
  } else {
    cartCountBadge.classList.add("hidden");
  }

  if (items.length === 0) {
    cartItemsList.innerHTML = `
      <div id="cartEmptyState" class="cart-empty-state py-8 text-center text-slate-400">
        <span class="empty-plate-mark" aria-hidden="true"></span>
        <p class="text-sm font-medium text-slate-600">Your bag is taking a breather.</p>
        <p class="text-xs text-slate-400 mt-1">Choose something from the menu to begin.</p>
      </div>
    `;
    cartSubtotalText.textContent = "$0.00";
    cartTotalText.textContent = "$0.00";
    submitOrderBtn.disabled = true;
    submitOrderBtn.className = "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2";
    clearCartBtn.classList.add("hidden");
    return;
  }

  clearCartBtn.classList.remove("hidden");
  cartItemsList.innerHTML = "";
  let subtotal = 0;

  items.forEach(({ item, quantity }) => {
    const itemTotal = Number(item.price) * quantity;
    subtotal += itemTotal;

    const row = document.createElement("div");
    row.className = "cart-item-row py-2.5 flex items-center justify-between gap-2 text-sm";
    row.innerHTML = `
      <div class="flex-1 min-w-0 pr-2">
        <p class="cart-item-name font-semibold text-slate-800 text-xs truncate">${escapeHtml(item.name)}</p>
        <p class="cart-item-unit text-[11px] text-slate-400">${formatPrice(item.price)} each</p>
      </div>
      <div class="cart-quantity flex items-center gap-1.5">
        <button class="qty-btn-minus w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center" aria-label="Remove one ${escapeHtml(item.name)}">
          -
        </button>
        <span class="w-6 text-center text-xs font-semibold text-slate-800">${quantity}</span>
        <button class="qty-btn-plus w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center" aria-label="Add one ${escapeHtml(item.name)}">
          +
        </button>
      </div>
      <span class="cart-item-total font-bold text-slate-900 text-xs w-14 text-right">${formatPrice(itemTotal)}</span>
    `;

    row.querySelector(".qty-btn-minus").addEventListener("click", () => updateCartItemQuantity(item.id, -1));
    row.querySelector(".qty-btn-plus").addEventListener("click", () => updateCartItemQuantity(item.id, 1));

    cartItemsList.appendChild(row);
  });

  cartSubtotalText.textContent = formatPrice(subtotal);
  cartTotalText.textContent = formatPrice(subtotal);

  submitOrderBtn.disabled = false;
  submitOrderBtn.className = "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2";
}

async function handleOrderSubmission() {
  if (!state.user) {
    showToast("Please sign in or create an account to place your order.", "error");
    openAuthModal("login");
    return;
  }
  if (state.user.role !== "CUSTOMER") {
    showToast("Only customer accounts can place orders from the menu.", "error");
    return;
  }

  if (state.cart.size === 0) {
    showToast("Please select dishes from the menu first.", "error");
    return;
  }

  submitOrderBtn.disabled = true;
  submitOrderBtn.textContent = "Placing order...";

  try {
    const payloadItems = Array.from(state.cart.values()).map(({ item, quantity }) => ({
      menuItemId: item.id,
      quantity
    }));

    const newOrder = await createOrder(payloadItems);
    showToast(`Order placed successfully! (#${newOrder.id} - ${formatPrice(newOrder.totalAmount)})`);
    clearCart();
    switchView("orders");
  } catch (error) {
    showToast(error.message, "error");
    submitOrderBtn.disabled = false;
    submitOrderBtn.textContent = "Place Order";
  }
}

// ================= Table Booking =================
function initBookingFormDefaultDate() {
  // Set default datetime to tomorrow at 19:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  // Format to YYYY-MM-DDTHH:mm
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const hours = String(tomorrow.getHours()).padStart(2, "0");
  const minutes = String(tomorrow.getMinutes()).padStart(2, "0");

  bookingDateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  bookingDateTimeInput.min = new Date().toISOString().slice(0, 16);
}

async function loadTablesForBooking() {
  if (!state.user) {
    bookingTablesLoading.classList.add("hidden");
    tablesGrid.innerHTML = `
      <div class="col-span-full py-12 text-center bg-slate-50 rounded-xl p-6 border border-slate-200">
        <p class="text-3xl mb-2">🪑</p>
        <p class="font-bold text-slate-800 text-sm">Please sign in to view available tables</p>
        <p class="text-xs text-slate-500 mt-1 mb-4">You can reserve a table anytime with an account.</p>
        <button id="bookSignInBtn" class="px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-xs hover:bg-amber-700">
          Sign In Now
        </button>
      </div>
    `;
    const btn = document.getElementById("bookSignInBtn");
    if (btn) btn.addEventListener("click", () => openAuthModal("login"));
    confirmBookingBtn.disabled = true;
    confirmBookingBtn.className = "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2";
    return;
  }

  bookingTablesLoading.classList.remove("hidden");
  bookingTablesEmpty.classList.add("hidden");
  tablesGrid.innerHTML = "";

  try {
    const tables = await getTables();
    state.tables = tables;
    bookingTablesLoading.classList.add("hidden");

    if (!tables || tables.length === 0) {
      bookingTablesEmpty.classList.remove("hidden");
      return;
    }

    renderBookingTablesGrid(tables);
  } catch (error) {
    bookingTablesLoading.classList.add("hidden");
    tablesGrid.innerHTML = `<div class="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${escapeHtml(error.message)}</div>`;
    showToast(error.message, "error");
  }
}

function renderBookingTablesGrid(tables) {
  tablesGrid.innerHTML = "";

  tables.forEach((table) => {
    const isSelected = state.selectedBookingTableId === table.id;
    const isAvailable = table.isAvailable;

    const card = document.createElement("div");
    card.className = `reservation-table-card p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
      !isAvailable
        ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
        : isSelected
        ? "bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 shadow-xs"
        : "bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs"
    }`;

    card.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="table-card-number font-extrabold text-base text-slate-900">Table #${table.tableNumber}</span>
        <span class="table-card-status text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
        }">
          ${isAvailable ? "Available" : "Reserved"}
        </span>
      </div>
      <div class="space-y-1 text-xs text-slate-600">
        <p class="table-card-capacity flex items-center gap-1.5 font-medium">
          <span>👥 Capacity:</span>
          <span class="font-bold text-slate-800">${table.capacity} Guests</span>
        </p>
        <p class="text-[11px] text-slate-400">A two-hour dining window</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <span class="table-card-action text-xs font-bold ${isSelected ? "text-amber-700" : "text-slate-500"}">
          ${!isAvailable ? "Unavailable" : isSelected ? "✓ Selected Table" : "Select"}
        </span>
      </div>
    `;

    if (isAvailable) {
      card.addEventListener("click", () => {
        state.selectedBookingTableId = table.id;
        selectedTableDisplay.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <p class="font-bold text-slate-900">Table #${table.tableNumber}</p>
              <p class="text-xs text-slate-500">${table.capacity} Guests capacity</p>
            </div>
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Selected</span>
          </div>
        `;
        confirmBookingBtn.disabled = false;
        confirmBookingBtn.className = "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2";
        renderBookingTablesGrid(state.tables);
      });
    }

    tablesGrid.appendChild(card);
  });
}

async function handleConfirmBooking() {
  if (!state.user) {
    showToast("Please sign in to complete your reservation.", "error");
    openAuthModal("login");
    return;
  }

  if (!state.selectedBookingTableId) {
    showToast("Please select a table first.", "error");
    return;
  }

  const selectedDateStr = bookingDateTimeInput.value;
  if (!selectedDateStr) {
    showToast("Please pick a reservation date and time.", "error");
    return;
  }

  const selectedDate = new Date(selectedDateStr);
  if (!Number.isFinite(selectedDate.getTime()) || selectedDate <= new Date()) {
    showToast("Choose a valid reservation date and time in the future.", "error");
    return;
  }
  const reservationDate = selectedDate.toISOString();

  confirmBookingBtn.disabled = true;
  confirmBookingBtn.textContent = "Confirming your table...";

  try {
    const res = await createReservation({
      tableId: state.selectedBookingTableId,
      reservationDate
    });

    showToast(`Reservation confirmed for Table #${res.table ? res.table.tableNumber : state.selectedBookingTableId}!`);
    state.selectedBookingTableId = null;
    selectedTableDisplay.textContent = "Click a table on the right to select it.";
    confirmBookingBtn.disabled = true;
    confirmBookingBtn.textContent = "Confirm Reservation";
    confirmBookingBtn.className = "w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2";

    // Navigate to My Bookings
    switchView("reservations");
  } catch (error) {
    showToast(error.message, "error");
    confirmBookingBtn.disabled = false;
    confirmBookingBtn.textContent = "Confirm Reservation";
  }
}

// ================= My Reservations View =================
async function loadReservations() {
  if (!state.user) {
    reservationsLoadingSpinner.classList.add("hidden");
    reservationsEmptyState.classList.add("hidden");
    reservationsList.innerHTML = "";
    reservationsNotLoggedIn.classList.remove("hidden");
    return;
  }

  reservationsNotLoggedIn.classList.add("hidden");
  reservationsLoadingSpinner.classList.remove("hidden");
  reservationsEmptyState.classList.add("hidden");
  reservationsList.innerHTML = "";

  try {
    const reservations = await getReservations();
    state.reservations = reservations;
    reservationsLoadingSpinner.classList.add("hidden");

    if (!reservations || reservations.length === 0) {
      reservationsEmptyState.classList.remove("hidden");
      return;
    }

    renderReservationsList(reservations);
  } catch (error) {
    reservationsLoadingSpinner.classList.add("hidden");
    reservationsList.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${escapeHtml(error.message)}</div>`;
    showToast(error.message, "error");
  }
}

function renderReservationsList(reservations) {
  reservationsList.innerHTML = "";

  reservations.forEach((reservation) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3";

    const badgeClass = getStatusBadgeClass(reservation.status);
    const canCancel = reservation.status !== "CANCELLED" && reservation.status !== "COMPLETED";
    const tableNum = reservation.table ? reservation.table.tableNumber : reservation.tableId;
    const capacity = reservation.table ? `${reservation.table.capacity} Guests` : "";

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-slate-900 text-base">Table #${tableNum}</span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${badgeClass}">
              ${reservation.status}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Reserved for <span class="font-bold text-slate-800">${formatDate(reservation.reservationDate)}</span>
          </p>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-500 font-medium">${capacity}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-slate-400">Reservation #${reservation.id}</span>
        ${
          canCancel
            ? `
          <button class="cancel-res-btn px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors" data-res-id="${reservation.id}">
            Cancel Booking
          </button>
        `
            : ""
        }
      </div>
    `;

    const cancelBtn = card.querySelector(".cancel-res-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to cancel this table reservation?")) return;
        try {
          await cancelReservation(reservation.id);
          showToast("Reservation cancelled.");
          loadReservations();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }

    reservationsList.appendChild(card);
  });
}

// ================= My Orders View =================
async function loadOrders() {
  if (!state.user) {
    ordersLoadingSpinner.classList.add("hidden");
    ordersEmptyState.classList.add("hidden");
    ordersList.innerHTML = "";
    ordersNotLoggedIn.classList.remove("hidden");
    return;
  }

  ordersNotLoggedIn.classList.add("hidden");
  ordersLoadingSpinner.classList.remove("hidden");
  ordersEmptyState.classList.add("hidden");
  ordersList.innerHTML = "";

  try {
    const statusFilter = ordersStatusFilter.value || null;
    const orders = await getOrders(statusFilter);
    state.orders = orders;

    ordersLoadingSpinner.classList.add("hidden");

    if (!orders || orders.length === 0) {
      ordersEmptyState.classList.remove("hidden");
      return;
    }

    renderOrdersList(orders);
  } catch (error) {
    ordersLoadingSpinner.classList.add("hidden");
    ordersList.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${escapeHtml(error.message)}</div>`;
    showToast(error.message, "error");
  }
}

function renderOrdersList(orders) {
  ordersList.innerHTML = "";

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all space-y-3";

    const badgeClass = getStatusBadgeClass(order.status);
    const canCancel = order.status !== "CANCELLED" && order.status !== "COMPLETED";

    const itemsHtml = (order.orderItems || [])
      .map(
        (oi) => `
        <div class="flex justify-between items-center text-xs py-1 border-b border-slate-50 last:border-0">
          <span class="text-slate-700">
            <span class="font-bold text-amber-700">${oi.quantity}x</span> ${escapeHtml(oi.menuItem ? oi.menuItem.name : `Item #${oi.menuItemId}`)}
          </span>
          <span class="font-semibold text-slate-600">${formatPrice(Number(oi.price) * oi.quantity)}</span>
        </div>
      `
      )
      .join("");

    orderCard.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">Order #${order.id}</span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${badgeClass}">
              ${order.status}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Placed on ${formatDate(order.createdAt)}
          </p>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400">Total:</span>
          <span class="font-extrabold text-slate-900 text-base ml-1">${formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-3">
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Dishes</p>
        <div class="space-y-0.5">
          ${itemsHtml}
        </div>
      </div>

      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-slate-400">Order Reference #${order.id}</span>
        ${
          canCancel
            ? `
          <button class="cancel-order-btn px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors" data-order-id="${order.id}">
            Cancel Order
          </button>
        `
            : ""
        }
      </div>
    `;

    const cancelBtn = orderCard.querySelector(".cancel-order-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", async () => {
        if (!confirm(`Are you sure you want to cancel Order #${order.id}?`)) return;
        try {
          await cancelOrder(order.id);
          showToast(`Order #${order.id} has been cancelled.`);
          loadOrders();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }

    ordersList.appendChild(orderCard);
  });
}

// ================= Admin / Staff Operations =================
function resetMenuItemForm() {
  menuItemForm.reset();
  menuItemId.value = "";
  menuItemAvailable.checked = true;
  menuItemFormTitle.textContent = "Add Menu Item";
  menuItemSubmitBtn.textContent = "Add Menu Item";
  menuItemCancelEditBtn.classList.add("hidden");
}

async function loadAdminMenu() {
  adminMenuItemsTableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">Loading menu items...</td></tr>`;
  try {
    const [items, categories] = await Promise.all([getMenuItems(), getCategories()]);
    state.menuItems = items;
    state.categories = categories;
    menuItemCategory.innerHTML = categories.length
      ? categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join("")
      : `<option value="">Add a category before creating menu items</option>`;

    if (items.length === 0) {
      adminMenuItemsTableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No menu items found.</td></tr>`;
      return;
    }

    adminMenuItemsTableBody.innerHTML = "";
    const isAdmin = state.user?.role === "ADMIN";
    items.forEach((item) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-slate-50";
      row.innerHTML = `
        <td class="px-4 py-3"><p class="font-semibold text-slate-900">${escapeHtml(item.name)}</p><p class="max-w-sm text-xs text-slate-500 break-words">${escapeHtml(item.description || "")}</p></td>
        <td class="px-4 py-3">${escapeHtml(item.category?.name || "Uncategorized")}</td>
        <td class="px-4 py-3">${formatPrice(item.price)}</td>
        <td class="px-4 py-3">${item.isAvailable ? "Available" : "Unavailable"}</td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <button class="edit-menu-item-btn rounded border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:bg-slate-100">Edit</button>
          <button class="toggle-menu-item-btn rounded border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:bg-slate-100">${item.isAvailable ? "Set unavailable" : "Set available"}</button>
          ${isAdmin ? `<button class="delete-menu-item-btn rounded border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>` : ""}
        </td>
      `;

      row.querySelector(".edit-menu-item-btn").addEventListener("click", () => {
        menuItemId.value = item.id;
        menuItemName.value = item.name;
        menuItemPrice.value = item.price;
        menuItemDescription.value = item.description || "";
        menuItemCategory.value = String(item.categoryId);
        menuItemAvailable.checked = item.isAvailable;
        menuItemFormTitle.textContent = `Edit ${item.name}`;
        menuItemSubmitBtn.textContent = "Save Changes";
        menuItemCancelEditBtn.classList.remove("hidden");
        menuItemForm.scrollIntoView({ behavior: "smooth", block: "center" });
        menuItemName.focus();
      });

      row.querySelector(".toggle-menu-item-btn").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
          await updateMenuItemAvailability(item.id, !item.isAvailable);
          showToast(`${item.name} is now ${item.isAvailable ? "unavailable" : "available"}.`);
          await loadAdminMenu();
          await loadMenuItems();
        } catch (error) {
          showToast(error.message, "error");
          button.disabled = false;
        }
      });

      const deleteButton = row.querySelector(".delete-menu-item-btn");
      if (deleteButton) {
        deleteButton.addEventListener("click", async () => {
          if (!confirm(`Delete "${item.name}" from the menu?`)) return;
          deleteButton.disabled = true;
          try {
            await deleteMenuItem(item.id);
            showToast(`${item.name} deleted.`);
            await loadAdminMenu();
            await loadMenuItems();
          } catch (error) {
            showToast(error.message, "error");
            deleteButton.disabled = false;
          }
        });
      }
      adminMenuItemsTableBody.appendChild(row);
    });
  } catch (error) {
    adminMenuItemsTableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-red-600">${escapeHtml(error.message)}</td></tr>`;
    showToast(error.message, "error");
  }
}

async function loadAdminCategories() {
  adminCategoriesList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">Loading categories...</div>`;
  try {
    const categories = await getCategories();
    state.categories = categories;
    if (categories.length === 0) {
      adminCategoriesList.innerHTML = `<div class="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">No categories yet. Add one above to create menu items.</div>`;
      return;
    }

    adminCategoriesList.innerHTML = "";
    categories.forEach((category) => {
      const card = document.createElement("div");
      card.className = "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4";
      card.innerHTML = `
        <div><p class="font-semibold text-slate-900">${escapeHtml(category.name)}</p><p class="text-xs text-slate-500">${category._count?.menuItems ?? 0} menu items</p></div>
        <div class="flex flex-wrap gap-2">
          <button class="rename-category-btn rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">Rename</button>
          ${state.user?.role === "ADMIN" ? `<button class="delete-category-btn rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>` : ""}
        </div>
      `;

      card.querySelector(".rename-category-btn").addEventListener("click", async () => {
        const name = prompt("Enter the new category name:", category.name);
        if (name === null || !name.trim() || name.trim() === category.name) return;
        try {
          await updateCategory(category.id, name.trim());
          showToast(`Category renamed to ${name.trim()}.`);
          await loadAdminCategories();
          await loadAdminMenu();
          await loadCategories();
        } catch (error) {
          showToast(error.message, "error");
        }
      });

      const deleteButton = card.querySelector(".delete-category-btn");
      if (deleteButton) {
        deleteButton.addEventListener("click", async () => {
          if (!confirm(`Delete category "${category.name}"? Categories containing ordered items may be protected by the server.`)) return;
          deleteButton.disabled = true;
          try {
            await deleteCategory(category.id);
            showToast(`Category "${category.name}" deleted.`);
            await loadAdminCategories();
            await loadAdminMenu();
            await loadCategories();
          } catch (error) {
            showToast(error.message, "error");
            deleteButton.disabled = false;
          }
        });
      }
      adminCategoriesList.appendChild(card);
    });
  } catch (error) {
    adminCategoriesList.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${escapeHtml(error.message)}</div>`;
  }
}

function loadAdminData() {
  if (state.adminSubTab === "menu") {
    loadAdminMenu();
  } else if (state.adminSubTab === "categories") {
    loadAdminCategories();
  } else if (state.adminSubTab === "tables") {
    loadAdminTables();
  } else if (state.adminSubTab === "reservations") {
    loadAdminReservations();
  } else if (state.adminSubTab === "orders") {
    loadAdminOrders();
  }
}

async function loadAdminTables() {
  adminTablesTableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">Loading tables...</td></tr>`;
  try {
    const tables = await getTables();
    state.tables = tables;
    adminTablesTableBody.innerHTML = "";

    if (!tables || tables.length === 0) {
      adminTablesTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-slate-400">No tables configured yet. Add one above.</td>
        </tr>
      `;
      return;
    }

    const isAdmin = state.user && state.user.role === "ADMIN";

    tables.forEach((table) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition-colors";

      const resCount = table._count ? table._count.reservations : 0;

      tr.innerHTML = `
        <td class="px-4 py-3 font-bold text-slate-900">Table #${table.tableNumber}</td>
        <td class="px-4 py-3 text-slate-700">${table.capacity} Guests</td>
        <td class="px-4 py-3">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full ${
            table.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }">
            ${table.isAvailable ? "Available" : "Unavailable"}
          </span>
        </td>
        <td class="px-4 py-3 text-slate-500 font-medium">${resCount} Total</td>
        <td class="px-4 py-3 text-right space-x-1">
          <button class="toggle-avail-btn text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700" data-table-id="${table.id}" data-current="${table.isAvailable}">
            ${table.isAvailable ? "Set Unavailable" : "Set Available"}
          </button>
          <button class="edit-table-btn text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700" data-table-id="${table.id}" data-num="${table.tableNumber}" data-cap="${table.capacity}">
            Edit
          </button>
          ${
            isAdmin
              ? `
            <button class="delete-table-btn text-xs font-semibold px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50" data-table-id="${table.id}">
              Delete
            </button>
          `
              : ""
          }
        </td>
      `;

      // Toggle Availability
      tr.querySelector(".toggle-avail-btn").addEventListener("click", async () => {
        try {
          const newAvail = !table.isAvailable;
          await updateTableAvailability(table.id, newAvail);
          showToast(`Table #${table.tableNumber} marked as ${newAvail ? "Available" : "Unavailable"}`);
          loadAdminTables();
        } catch (err) {
          showToast(err.message, "error");
        }
      });

      // Edit Table
      tr.querySelector(".edit-table-btn").addEventListener("click", () => {
        editTableId.value = table.id;
        editTableNumber.value = table.tableNumber;
        editTableCapacity.value = table.capacity;
        transitionModal(editTableModal, true);
      });

      // Delete Table (Admin only)
      const delBtn = tr.querySelector(".delete-table-btn");
      if (delBtn) {
        delBtn.addEventListener("click", async () => {
          if (!confirm(`Permanently delete Table #${table.tableNumber}?`)) return;
          try {
            await deleteTable(table.id);
            showToast(`Table #${table.tableNumber} deleted successfully.`);
            loadAdminTables();
          } catch (err) {
            showToast(err.message, "error");
          }
        });
      }

      adminTablesTableBody.appendChild(tr);
    });
  } catch (error) {
    adminTablesTableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-red-600">${escapeHtml(error.message)}</td></tr>`;
    showToast(error.message, "error");
  }
}

async function loadAdminReservations() {
  adminReservationsList.innerHTML = `<div class="py-8 text-center text-slate-400 text-xs">Loading all reservations...</div>`;
  try {
    const filter = adminReservationsFilter.value || null;
    const list = await getReservations(filter);
    state.adminReservations = list;

    if (!list || list.length === 0) {
      adminReservationsList.innerHTML = `<div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">No reservations found for this filter.</div>`;
      return;
    }

    adminReservationsList.innerHTML = "";
    list.forEach((res) => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";

      const guestName = res.customer ? res.customer.name : `Customer #${res.customerId}`;
      const guestEmail = res.customer ? res.customer.email : "";
      const tableNum = res.table ? res.table.tableNumber : res.tableId;

      card.innerHTML = `
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">Table #${tableNum}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(res.status)}">${res.status}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1">
            Guest: <span class="font-bold text-slate-800">${escapeHtml(guestName)}</span> (${escapeHtml(guestEmail)})
          </p>
          <p class="text-xs text-slate-400">
            Booking Date: ${formatDate(res.reservationDate)}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 font-medium">Update Status:</span>
          <select class="admin-res-status-select border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-700" data-res-id="${res.id}">
            <option value="" disabled selected>Select status...</option>
            <option value="PENDING" ${res.status === "PENDING" ? "disabled" : ""}>PENDING</option>
            <option value="CONFIRMED" ${res.status === "CONFIRMED" ? "disabled" : ""}>CONFIRMED</option>
            <option value="COMPLETED" ${res.status === "COMPLETED" ? "disabled" : ""}>COMPLETED</option>
            <option value="CANCELLED" ${res.status === "CANCELLED" ? "disabled" : ""}>CANCELLED</option>
          </select>
        </div>
      `;

      card.querySelector(".admin-res-status-select").addEventListener("change", async (e) => {
        const newStatus = e.target.value;
        if (!newStatus) return;
        try {
          await updateReservationStatus(res.id, newStatus);
          showToast(`Reservation #${res.id} marked as ${newStatus}`);
          loadAdminReservations();
        } catch (err) {
          showToast(err.message, "error");
        }
      });

      adminReservationsList.appendChild(card);
    });
  } catch (error) {
    adminReservationsList.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${escapeHtml(error.message)}</div>`;
    showToast(error.message, "error");
  }
}

async function loadAdminOrders() {
  adminOrdersList.innerHTML = `<div class="py-8 text-center text-slate-400 text-xs">Loading all orders...</div>`;
  try {
    const list = await getOrders();
    state.adminOrders = list;

    if (!list || list.length === 0) {
      adminOrdersList.innerHTML = `<div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">No customer orders placed yet.</div>`;
      return;
    }

    adminOrdersList.innerHTML = "";
    list.forEach((order) => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";

      const customerName = order.customer ? order.customer.name : `Customer #${order.customerId}`;
      const itemsDesc = (order.orderItems || [])
        .map((oi) => `${oi.quantity}x ${oi.menuItem ? oi.menuItem.name : "Item"}`)
        .join(", ");

      card.innerHTML = `
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">Order #${order.id}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(order.status)}">${order.status}</span>
            <span class="font-bold text-slate-900 text-sm ml-2">${formatPrice(order.totalAmount)}</span>
          </div>
          <p class="text-xs text-slate-600">
            Customer: <span class="font-bold text-slate-800">${escapeHtml(customerName)}</span>
          </p>
          <p class="text-xs text-slate-500 font-medium truncate max-w-md">
            ${escapeHtml(itemsDesc)}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 font-medium">Update Status:</span>
          <select class="admin-order-status-select border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-700" data-order-id="${order.id}">
            <option value="" disabled selected>Change Status...</option>
            <option value="PENDING" ${order.status === "PENDING" ? "disabled" : ""}>PENDING</option>
            <option value="CONFIRMED" ${order.status === "CONFIRMED" ? "disabled" : ""}>CONFIRMED</option>
            <option value="PREPARING" ${order.status === "PREPARING" ? "disabled" : ""}>PREPARING</option>
            <option value="READY" ${order.status === "READY" ? "disabled" : ""}>READY</option>
            <option value="COMPLETED" ${order.status === "COMPLETED" ? "disabled" : ""}>COMPLETED</option>
            <option value="CANCELLED" ${order.status === "CANCELLED" ? "disabled" : ""}>CANCELLED</option>
          </select>
        </div>
      `;

      card.querySelector(".admin-order-status-select").addEventListener("change", async (e) => {
        const newStatus = e.target.value;
        if (!newStatus) return;
        try {
          await updateOrderStatus(order.id, newStatus);
          showToast(`Order #${order.id} updated to ${newStatus}`);
          loadAdminOrders();
        } catch (err) {
          showToast(err.message, "error");
        }
      });

      adminOrdersList.appendChild(card);
    });
  } catch (error) {
    adminOrdersList.innerHTML = `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${escapeHtml(error.message)}</div>`;
    showToast(error.message, "error");
  }
}

// ================= Event Listeners Setup =================
function setupEventListeners() {
  // Navigation
  brandLogo.addEventListener("click", () => switchView(state.user?.role === "ADMIN" || state.user?.role === "STAFF" ? "admin" : "menu"));
  brandLogo.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      switchView(state.user?.role === "ADMIN" || state.user?.role === "STAFF" ? "admin" : "menu");
    }
  });
  mobileNavToggle.addEventListener("click", () => {
    const isOpen = mobileNavToggle.getAttribute("aria-expanded") === "true";
    mobileNavToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileNavToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !isOpen);
    if (!isOpen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animate(primaryNav, { opacity: [0, 1], y: [-8, 0] }, { duration: 0.25, ease: "easeOut" });
    }
  });
  navMenuBtn.addEventListener("click", () => switchView("menu"));
  navBookTableBtn.addEventListener("click", () => switchView("bookTable"));
  navOrdersBtn.addEventListener("click", () => switchView("orders"));
  navReservationsBtn.addEventListener("click", () => switchView("reservations"));
  navAdminBtn.addEventListener("click", () => switchView("admin"));
  heroBookTableBtn.addEventListener("click", () => switchView("bookTable"));
  storyBookTableBtn.addEventListener("click", () => switchView("bookTable"));
  experienceBookTableBtn.addEventListener("click", () => switchView("bookTable"));
  viewMyBookingsQuickBtn.addEventListener("click", () => switchView("reservations"));
  newReservationBtn.addEventListener("click", () => switchView("bookTable"));
  bookTableNowBtn.addEventListener("click", () => switchView("bookTable"));
  goToMenuBtn.addEventListener("click", () => switchView("menu"));

  navCartBtn.addEventListener("click", () => {
    switchView("menu");
    cartItemsList.scrollIntoView({ behavior: "smooth" });
  });

  // Search filter
  let searchTimeout;
  menuSearchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = e.target.value.trim();
      loadMenuItems();
    }, 300);
  });

  retryMenuBtn.addEventListener("click", () => {
    loadCategories();
    loadMenuItems();
  });

  // Cart actions
  submitOrderBtn.addEventListener("click", handleOrderSubmission);
  clearCartBtn.addEventListener("click", clearCart);

  // Book a Table
  confirmBookingBtn.addEventListener("click", handleConfirmBooking);

  // Orders filters
  ordersStatusFilter.addEventListener("change", loadOrders);
  refreshOrdersBtn.addEventListener("click", loadOrders);
  ordersLoginBtn.addEventListener("click", () => openAuthModal("login"));
  reservationsLoginBtn.addEventListener("click", () => openAuthModal("login"));

  // Admin sub-tabs
  adminTabMenu.addEventListener("click", () => switchAdminSubTab("menu"));
  adminTabCategories.addEventListener("click", () => switchAdminSubTab("categories"));
  adminTabTables.addEventListener("click", () => switchAdminSubTab("tables"));
  adminTabReservations.addEventListener("click", () => switchAdminSubTab("reservations"));
  adminTabOrders.addEventListener("click", () => switchAdminSubTab("orders"));
  refreshAdminTablesBtn.addEventListener("click", loadAdminTables);
  adminReservationsFilter.addEventListener("change", loadAdminReservations);
  refreshAdminOrdersBtn.addEventListener("click", loadAdminOrders);
  refreshAdminMenuBtn.addEventListener("click", loadAdminMenu);

  menuItemCancelEditBtn.addEventListener("click", resetMenuItemForm);
  menuItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.categories.length === 0) {
      showToast("Create a category before adding menu items.", "error");
      switchAdminSubTab("categories");
      return;
    }

    const itemId = menuItemId.value;
    const wasEditing = Boolean(itemId);
    const submitLabel = wasEditing ? "Save Changes" : "Add Menu Item";
    const payload = {
      name: menuItemName.value.trim(),
      description: menuItemDescription.value.trim(),
      price: Number(menuItemPrice.value),
      categoryId: Number(menuItemCategory.value),
      isAvailable: menuItemAvailable.checked
    };

    menuItemSubmitBtn.disabled = true;
    menuItemSubmitBtn.textContent = wasEditing ? "Saving..." : "Adding...";
    try {
      if (wasEditing) {
        await updateMenuItem(itemId, payload);
        showToast("Menu item updated.");
      } else {
        await createMenuItem(payload);
        showToast("Menu item added.");
      }
      resetMenuItemForm();
      await loadAdminMenu();
      await loadMenuItems();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      menuItemSubmitBtn.disabled = false;
      menuItemSubmitBtn.textContent = wasEditing ? "Save Changes" : "Add Menu Item";
    }
    if (!menuItemId.value) menuItemSubmitBtn.textContent = "Add Menu Item";
    else menuItemSubmitBtn.textContent = submitLabel;
  });

  createCategoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = createCategoryForm.querySelector('button[type="submit"]');
    const categoryName = categoryNameInput.value.trim();
    submitButton.disabled = true;
    submitButton.textContent = "Adding...";
    try {
      await createCategory(categoryName);
      showToast(`Category "${categoryName}" added.`);
      createCategoryForm.reset();
      await loadAdminCategories();
      await loadAdminMenu();
      await loadCategories();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Add Category";
    }
  });

  // Create Table Form (Admin)
  createTableForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tableNumber = adminTableNumberInput.value;
    const capacity = adminTableCapacityInput.value;
    try {
      await createTable({ tableNumber, capacity });
      showToast(`Table #${tableNumber} created successfully!`);
      createTableForm.reset();
      loadAdminTables();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Edit Table Modal Form (Admin)
  closeEditTableModalBtn.addEventListener("click", () => transitionModal(editTableModal, false));
  editTableForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editTableId.value;
    const tableNumber = Number(editTableNumber.value);
    const capacity = Number(editTableCapacity.value);

    try {
      await updateTable(id, { tableNumber, capacity });
      showToast("Table updated successfully!");
      transitionModal(editTableModal, false);
      loadAdminTables();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Auth Modal
  tabLogin.addEventListener("click", () => openAuthModal("login"));
  tabRegister.addEventListener("click", () => openAuthModal("register"));
  closeAuthModalBtn.addEventListener("click", closeAuthModal);
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
  });

  // Demo account quick fill
  quickFillCustomerBtn.addEventListener("click", () => {
    authEmailInput.value = "alice@example.com";
    authPasswordInput.value = "password123";
    if (state.authModalMode === "register") {
      authNameInput.value = "Alice Customer";
    }
  });

  quickFillStaffBtn.addEventListener("click", () => {
    authEmailInput.value = "staff@example.com";
    authPasswordInput.value = "password123";
    if (state.authModalMode === "register") {
      authNameInput.value = "Restaurant Staff";
    }
  });

  quickFillAdminBtn.addEventListener("click", () => {
    authEmailInput.value = "admin@example.com";
    authPasswordInput.value = "password123";
    if (state.authModalMode === "register") {
      authNameInput.value = "Admin Manager";
    }
  });

  // Auth Form Submit
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    authErrorMessage.classList.add("hidden");
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = "Signing in...";

    try {
      if (state.authModalMode === "login") {
        const res = await login({
          email: authEmailInput.value.trim(),
          password: authPasswordInput.value
        });
        state.user = res.data;
        showToast(`Welcome back, ${res.data.name}!`);
      } else {
        const res = await register({
          name: authNameInput.value.trim(),
          email: authEmailInput.value.trim(),
          password: authPasswordInput.value,
        });
        state.user = res.data;
        showToast(`Account created! Welcome, ${res.data.name}`);
      }

      closeAuthModal();
      updateAuthWidget();
      updateCartUI();

      if (state.activeView === "orders") loadOrders();
      if (state.activeView === "reservations") loadReservations();
      if (state.activeView === "bookTable") loadTablesForBooking();
      if (state.activeView === "admin") loadAdminData();
    } catch (err) {
      authErrorMessage.textContent = err.message;
      authErrorMessage.classList.remove("hidden");
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = state.authModalMode === "login" ? "Sign In" : "Create Account";
    }
  });

  window.addEventListener("auth:unauthorized", () => {
    state.user = null;
    updateAuthWidget();
    updateCartUI();
    updateBookingAuthUI();
    showToast("Your session has expired. Please sign in again.", "error");
    openAuthModal("login");
  });
}

// ================= App Initialization =================
async function init() {
  initializeMotion();
  updateAuthWidget();
  updateCartUI();
  setupEventListeners();
  if (getStoredToken()) {
    try {
      const response = await getProfile();
      state.user = response.data;
      localStorage.setItem("user", JSON.stringify(response.data));
      updateAuthWidget();
      updateCartUI();
    } catch (error) {
      if (error.status !== 401) {
        showToast(`Unable to validate your saved session: ${error.message}`, "error");
      }
    }
  }
  loadCategories();
  loadMenuItems();
}

init();
