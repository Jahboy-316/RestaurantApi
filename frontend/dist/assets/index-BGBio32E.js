(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const d of r)if(d.type==="childList")for(const i of d.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const d={};return r.integrity&&(d.integrity=r.integrity),r.referrerPolicy&&(d.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?d.credentials="include":r.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function a(r){if(r.ep)return;r.ep=!0;const d=n(r);fetch(r.href,d)}})();const ht="/api";async function c(e,t={}){const n=`${ht}${e.startsWith("/")?e:"/"+e}`,a=localStorage.getItem("token"),r={"Content-Type":"application/json",...t.headers};a&&(r.Authorization=`Bearer ${a}`);const d={...t,headers:r};try{const i=await fetch(n,d),m=await i.json();if(!i.ok){i.status===401&&a&&!e.startsWith("/auth/login")&&(localStorage.removeItem("token"),localStorage.removeItem("user"),window.dispatchEvent(new CustomEvent("auth:unauthorized")));const b=new Error(m.message||"An error occurred while communicating with the server.");throw b.status=i.status,b.data=m,b}return m}catch(i){throw i.status?i:new Error("Unable to connect to the restaurant server. Please make sure the backend is running.")}}async function Et(e){const t=await c("/auth/register",{method:"POST",body:JSON.stringify(e)});return t.token&&(localStorage.setItem("token",t.token),localStorage.setItem("user",JSON.stringify(t.data))),t}async function Lt(e){const t=await c("/auth/login",{method:"POST",body:JSON.stringify(e)});return t.token&&(localStorage.setItem("token",t.token),localStorage.setItem("user",JSON.stringify(t.data))),t}async function It(){return await c("/auth/profile")}function Bt(){localStorage.removeItem("token"),localStorage.removeItem("user")}function wt(){return localStorage.getItem("token")}async function Ce(){return(await c("/categories")).data||[]}async function Tt(e){return(await c("/categories",{method:"POST",body:JSON.stringify({name:e})})).data}async function Ct(e,t){return(await c(`/categories/${e}`,{method:"PUT",body:JSON.stringify({name:t})})).data}async function $t(e){return c(`/categories/${e}`,{method:"DELETE"})}async function nt({categoryId:e,search:t,isAvailable:n}={}){const a=new URLSearchParams;e&&a.append("categoryId",e),t&&a.append("search",t),n!==void 0&&a.append("isAvailable",n);const r=a.toString()?`?${a.toString()}`:"";return(await c(`/menu-items${r}`)).data||[]}async function St(e){return(await c("/menu-items",{method:"POST",body:JSON.stringify(e)})).data}async function Nt(e,t){return(await c(`/menu-items/${e}`,{method:"PUT",body:JSON.stringify(t)})).data}async function Mt(e,t){return(await c(`/menu-items/${e}/availability`,{method:"PATCH",body:JSON.stringify({isAvailable:t})})).data}async function At(e){return c(`/menu-items/${e}`,{method:"DELETE"})}async function kt(e){return(await c("/orders",{method:"POST",body:JSON.stringify({items:e})})).data}async function st(e=null){const t=e?`?status=${encodeURIComponent(e)}`:"";return(await c(`/orders${t}`)).data||[]}async function Dt(e){return(await c(`/orders/${e}/cancel`,{method:"PATCH"})).data}async function Ot(e,t){return(await c(`/orders/${e}/status`,{method:"PATCH",body:JSON.stringify({status:t})})).data}async function at(){return(await c("/tables")).data||[]}async function Pt({tableNumber:e,capacity:t}){return(await c("/tables",{method:"POST",body:JSON.stringify({tableNumber:Number(e),capacity:Number(t)})})).data}async function Ht(e,t){return(await c(`/tables/${e}`,{method:"PUT",body:JSON.stringify(t)})).data}async function Rt(e,t){return(await c(`/tables/${e}/availability`,{method:"PATCH",body:JSON.stringify({isAvailable:!!t})})).data}async function Ft(e){return await c(`/tables/${e}`,{method:"DELETE"})}async function qt({tableId:e,reservationDate:t,customerId:n}){const a={tableId:Number(e),reservationDate:t};return n&&(a.customerId=Number(n)),(await c("/reservations",{method:"POST",body:JSON.stringify(a)})).data}async function rt(e=null){const t=e?`?status=${encodeURIComponent(e)}`:"";return(await c(`/reservations${t}`)).data||[]}async function jt(e,t){return(await c(`/reservations/${e}/status`,{method:"PATCH",body:JSON.stringify({status:t})})).data}async function Gt(e){return(await c(`/reservations/${e}/cancel`,{method:"PATCH"})).data}function Ut(){try{const e=JSON.parse(localStorage.getItem("cart")||"[]");return Array.isArray(e)?new Map(e.filter(([t,n])=>Number.isInteger(Number(t))&&(n==null?void 0:n.item)&&Number.isInteger(n.quantity)&&n.quantity>0).map(([t,n])=>[Number(t),n])):new Map}catch{return new Map}}const s={user:null,categories:[],menuItems:[],selectedCategoryId:"",searchQuery:"",cart:Ut(),orders:[],tables:[],selectedBookingTableId:null,reservations:[],adminReservations:[],adminOrders:[],activeView:"menu",adminSubTab:"tables",authModalMode:"login"},Jt=document.getElementById("brandLogo"),Ae=document.getElementById("authWidget"),le=document.getElementById("navMenuBtn"),ce=document.getElementById("navBookTableBtn"),me=document.getElementById("navOrdersBtn"),ue=document.getElementById("navReservationsBtn"),T=document.getElementById("navAdminBtn"),ke=document.getElementById("managementNavLabel"),Vt=document.getElementById("navCartBtn"),se=document.getElementById("cartCountBadge"),Yt=document.getElementById("toastContainer"),De=document.getElementById("menuSection"),Oe=document.getElementById("bookTableSection"),Pe=document.getElementById("ordersSection"),He=document.getElementById("reservationsSection"),Re=document.getElementById("adminSection"),Wt=document.getElementById("heroBookTableBtn"),$=document.getElementById("categoryButtonsContainer"),Qt=document.getElementById("menuSearchInput"),U=document.getElementById("itemsCountLabel"),be=document.getElementById("menuGrid"),ae=document.getElementById("menuLoadingSpinner"),Fe=document.getElementById("menuErrorBanner"),zt=document.getElementById("menuErrorMessage"),_t=document.getElementById("retryMenuBtn"),qe=document.getElementById("menuEmptyNotice"),_=document.getElementById("cartItemsList"),je=document.getElementById("cartSubtotalText"),Ge=document.getElementById("cartTotalText"),y=document.getElementById("submitOrderBtn"),pe=document.getElementById("clearCartBtn"),J=document.getElementById("authNotice"),Kt=document.getElementById("viewMyBookingsQuickBtn"),ge=document.getElementById("bookingDateTimeInput"),ot=document.getElementById("selectedTableDisplay"),p=document.getElementById("confirmBookingBtn"),V=document.getElementById("bookingAuthNotice"),Y=document.getElementById("bookingTablesLoading"),Ue=document.getElementById("bookingTablesEmpty"),O=document.getElementById("tablesGrid"),dt=document.getElementById("ordersStatusFilter"),Xt=document.getElementById("refreshOrdersBtn"),W=document.getElementById("ordersLoadingSpinner"),Je=document.getElementById("ordersNotLoggedIn"),re=document.getElementById("ordersEmptyState"),P=document.getElementById("ordersList"),Zt=document.getElementById("ordersLoginBtn"),en=document.getElementById("goToMenuBtn"),tn=document.getElementById("newReservationBtn"),Q=document.getElementById("reservationsLoadingSpinner"),Ve=document.getElementById("reservationsNotLoggedIn"),oe=document.getElementById("reservationsEmptyState"),H=document.getElementById("reservationsList"),nn=document.getElementById("reservationsLoginBtn"),sn=document.getElementById("bookTableNowBtn"),xe=document.getElementById("adminTabTables"),ye=document.getElementById("adminTabReservations"),fe=document.getElementById("adminTabOrders"),ve=document.getElementById("adminTabMenu"),he=document.getElementById("adminTabCategories"),Ye=document.getElementById("adminMenuPanel"),We=document.getElementById("adminCategoriesPanel"),Qe=document.getElementById("adminTablesPanel"),ze=document.getElementById("adminReservationsPanel"),_e=document.getElementById("adminOrdersPanel"),Ke=document.getElementById("createTableForm"),an=document.getElementById("adminTableNumberInput"),rn=document.getElementById("adminTableCapacityInput"),S=document.getElementById("adminTablesTableBody"),on=document.getElementById("refreshAdminTablesBtn"),it=document.getElementById("adminReservationsFilter"),N=document.getElementById("adminReservationsList"),dn=document.getElementById("refreshAdminOrdersBtn"),M=document.getElementById("adminOrdersList"),ln=document.getElementById("managementTitle"),cn=document.getElementById("managementRoleBadge"),mn=document.getElementById("managementDescription"),$e=document.getElementById("menuItemForm"),K=document.getElementById("menuItemId"),Ee=document.getElementById("menuItemName"),lt=document.getElementById("menuItemPrice"),Le=document.getElementById("menuItemCategory"),ct=document.getElementById("menuItemDescription"),Se=document.getElementById("menuItemAvailable"),mt=document.getElementById("menuItemFormTitle"),v=document.getElementById("menuItemSubmitBtn"),Ne=document.getElementById("menuItemCancelEditBtn"),un=document.getElementById("refreshAdminMenuBtn"),A=document.getElementById("adminMenuItemsTableBody"),de=document.getElementById("createCategoryForm"),bn=document.getElementById("categoryNameInput"),k=document.getElementById("adminCategoriesList"),Ie=document.getElementById("editTableModal"),pn=document.getElementById("closeEditTableModalBtn"),gn=document.getElementById("editTableForm"),ut=document.getElementById("editTableId"),bt=document.getElementById("editTableNumber"),pt=document.getElementById("editTableCapacity"),X=document.getElementById("authModal"),xn=document.getElementById("closeAuthModalBtn"),yn=document.getElementById("authForm"),Be=document.getElementById("tabLogin"),we=document.getElementById("tabRegister"),Xe=document.getElementById("nameFieldGroup"),z=document.getElementById("authNameInput"),B=document.getElementById("authEmailInput"),D=document.getElementById("authPasswordInput"),w=document.getElementById("authSubmitBtn"),R=document.getElementById("authErrorMessage"),fn=document.getElementById("quickFillCustomerBtn"),vn=document.getElementById("quickFillStaffBtn"),hn=document.getElementById("quickFillAdminBtn"),Ze=document.getElementById("demoLoginControls");function o(e,t="success"){const n=document.createElement("div"),a=t==="error";n.className=`pointer-events-auto px-4 py-3 rounded-xl shadow-lg border text-sm flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 ${a?"bg-red-50 border-red-200 text-red-800":"bg-emerald-50 border-emerald-200 text-emerald-800"}`,n.innerHTML=`
    <span>${a?"⚠️":"✓"}</span>
    <span class="font-medium">${l(e)}</span>
  `,Yt.appendChild(n),requestAnimationFrame(()=>{n.classList.remove("translate-y-2","opacity-0")}),setTimeout(()=>{n.classList.add("opacity-0","translate-y-2"),setTimeout(()=>n.remove(),300)},4e3)}function l(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function g(e){return`$${Number(e).toFixed(2)}`}function Me(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}):""}function Z(e){switch(e){case"PENDING":return"bg-amber-100 text-amber-800 border-amber-200";case"CONFIRMED":return"bg-blue-100 text-blue-800 border-blue-200";case"PREPARING":return"bg-purple-100 text-purple-800 border-purple-200";case"READY":return"bg-teal-100 text-teal-800 border-teal-200";case"COMPLETED":return"bg-emerald-100 text-emerald-800 border-emerald-200";case"CANCELLED":return"bg-red-100 text-red-800 border-red-200";default:return"bg-slate-100 text-slate-800 border-slate-200"}}function u(e){const t=s.user&&(s.user.role==="STAFF"||s.user.role==="ADMIN");e==="admin"&&!t?e="menu":t&&e!=="admin"&&(e="admin"),s.activeView=e,De.classList.add("hidden"),Oe.classList.add("hidden"),Pe.classList.add("hidden"),He.classList.add("hidden"),Re.classList.add("hidden"),[le,ce,me,ue].forEach(n=>{n.className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100"}),t&&document.querySelectorAll("[data-customer-nav]").forEach(n=>n.classList.add("hidden")),T.className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1",t||T.classList.add("hidden"),e==="menu"?(De.classList.remove("hidden"),le.className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-amber-50 text-amber-700"):e==="bookTable"?(Oe.classList.remove("hidden"),ce.className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-amber-50 text-amber-700",Bn(),xt()):e==="orders"?(Pe.classList.remove("hidden"),me.className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-amber-50 text-amber-700",C()):e==="reservations"?(He.classList.remove("hidden"),ue.className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-amber-50 text-amber-700",ee()):e==="admin"&&(Re.classList.remove("hidden"),T.className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-purple-600 text-white shadow-xs flex items-center gap-1",ft())}function I(e){s.adminSubTab=e,Ye.classList.add("hidden"),We.classList.add("hidden"),Qe.classList.add("hidden"),ze.classList.add("hidden"),_e.classList.add("hidden"),[ve,he,xe,ye,fe].forEach(t=>{t.className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900"}),e==="menu"?(Ye.classList.remove("hidden"),ve.className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs",f()):e==="categories"?(We.classList.remove("hidden"),he.className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs",j()):e==="tables"?(Qe.classList.remove("hidden"),xe.className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs",L()):e==="reservations"?(ze.classList.remove("hidden"),ye.className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs",te()):e==="orders"&&(_e.classList.remove("hidden"),fe.className="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-xs",ne())}function F(){const e=s.user&&(s.user.role==="STAFF"||s.user.role==="ADMIN");if(document.querySelectorAll("[data-customer-nav]").forEach(t=>{t.classList.toggle("hidden",!!e)}),e?(T.classList.remove("hidden"),ke.textContent=s.user.role==="ADMIN"?"⚙️ Admin Dashboard":"⚙️ Staff Dashboard",ln.textContent=s.user.role==="ADMIN"?"Admin Dashboard":"Staff Dashboard",cn.textContent=s.user.role,mn.textContent=s.user.role==="ADMIN"?"Manage menu, tables, reservations, and restaurant orders.":"Manage menu availability, tables, reservations, and restaurant orders.",s.activeView!=="admin"&&(s.adminSubTab=s.user.role==="ADMIN"?"menu":"orders",u("admin"))):(T.classList.add("hidden"),ke.textContent="⚙️ Management",s.activeView==="admin"&&u("menu")),s.user){const t=s.user.role==="ADMIN"?"bg-purple-100 text-purple-800":s.user.role==="STAFF"?"bg-blue-100 text-blue-800":"bg-emerald-100 text-emerald-800";Ae.innerHTML=`
      <div class="flex items-center gap-2">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-900 leading-tight">${l(s.user.name)}</p>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${t}">${s.user.role}</span>
        </div>
        <button id="logoutBtn" class="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-colors">
          Sign Out
        </button>
      </div>
    `,document.getElementById("logoutBtn").addEventListener("click",()=>{Bt(),s.user=null,F(),h(),Te(),o("Signed out successfully."),s.activeView==="orders"&&C(),s.activeView==="reservations"&&ee(),s.activeView==="admin"&&u("menu")}),J.textContent=`Ordering as ${s.user.name}`,J.className="text-center text-xs text-emerald-600 font-medium mt-2"}else Ae.innerHTML=`
      <button id="openAuthModalBtn" class="text-xs py-1.5 px-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors shadow-xs">
        Sign In
      </button>
    `,document.getElementById("openAuthModalBtn").addEventListener("click",()=>{x("login")}),J.textContent="Sign in to place your order.",J.className="text-center text-xs text-slate-400 mt-2";Te()}function Te(){s.user?(V.textContent=`Booking as ${s.user.name}`,V.className="text-center text-xs text-emerald-600 font-medium"):(V.textContent="Sign in to confirm your table reservation.",V.className="text-center text-xs text-slate-400")}function x(e="login"){s.authModalMode=e,R.classList.add("hidden"),R.textContent="",e==="login"?(Ze.classList.remove("hidden"),Be.className="flex-1 text-center py-1.5 font-bold text-sm border-b-2 border-amber-600 text-amber-600",we.className="flex-1 text-center py-1.5 font-semibold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800",Xe.classList.add("hidden"),w.textContent="Sign In"):(Ze.classList.add("hidden"),we.className="flex-1 text-center py-1.5 font-bold text-sm border-b-2 border-amber-600 text-amber-600",Be.className="flex-1 text-center py-1.5 font-semibold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800",Xe.classList.remove("hidden"),w.textContent="Create Account"),X.classList.remove("hidden"),B.focus()}function ie(){X.classList.add("hidden")}async function q(){try{const e=await Ce();s.categories=e,$.innerHTML=`
      <button data-category-id="" class="category-btn active px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-amber-600 text-white transition-colors">
        All Dishes
      </button>
    `,e.forEach(t=>{const n=document.createElement("button");n.dataset.categoryId=String(t.id),n.className="category-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors",n.textContent=t.name,$.appendChild(n)}),$.querySelectorAll(".category-btn").forEach(t=>{t.addEventListener("click",()=>{$.querySelectorAll(".category-btn").forEach(n=>{n.className="category-btn px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"}),t.className="category-btn active px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap bg-amber-600 text-white transition-colors",s.selectedCategoryId=t.dataset.categoryId,E()})})}catch(e){$.innerHTML=`<span class="text-xs text-red-600">${l(e.message)}</span>`}}async function E(){ae.classList.remove("hidden"),Fe.classList.add("hidden"),qe.classList.add("hidden"),be.innerHTML="",U.textContent="Loading...";try{const e=await nt({categoryId:s.selectedCategoryId||void 0,search:s.searchQuery||void 0});if(s.menuItems=e,ae.classList.add("hidden"),!e||e.length===0){qe.classList.remove("hidden"),U.textContent="0 dishes found";return}U.textContent=`${e.length} delicious options`,En(e)}catch(e){ae.classList.add("hidden"),Fe.classList.remove("hidden"),zt.textContent=e.message,U.textContent="Unable to load menu"}}function En(e){be.innerHTML="",e.forEach(t=>{const n=document.createElement("div");n.className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all";const a=t.isAvailable,r=t.category?t.category.name:"Specialty";n.innerHTML=`
      <div>
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            ${l(r)}
          </span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${a?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-600"}">
            ${a?"Available":"Sold Out"}
          </span>
        </div>
        <h4 class="font-bold text-slate-900 text-base leading-snug">${l(t.name)}</h4>
        <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          ${l(t.description||"Freshly made to order with authentic seasonal ingredients.")}
        </p>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span class="font-extrabold text-slate-900 text-base">${g(t.price)}</span>
        <button
          class="add-to-cart-btn px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${a?"bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer":"bg-slate-100 text-slate-400 cursor-not-allowed"}"
          data-item-id="${t.id}"
          ${a?"":"disabled"}
        >
          <span>+ Add</span>
        </button>
      </div>
    `;const d=n.querySelector(".add-to-cart-btn");a&&d.addEventListener("click",()=>Ln(t)),be.appendChild(n)})}function Ln(e){const t=s.cart.get(e.id);t?t.quantity+=1:s.cart.set(e.id,{item:e,quantity:1}),h(),o(`Added "${e.name}" to cart`)}function et(e,t){const n=s.cart.get(e);n&&(n.quantity+=t,n.quantity<=0&&s.cart.delete(e),h())}function gt(){s.cart.clear(),h()}function h(){localStorage.setItem("cart",JSON.stringify(Array.from(s.cart.entries())));const e=Array.from(s.cart.values()),t=e.reduce((a,r)=>a+r.quantity,0);if(t>0?(se.textContent=t,se.classList.remove("hidden")):se.classList.add("hidden"),e.length===0){_.innerHTML=`
      <div id="cartEmptyState" class="py-8 text-center text-slate-400">
        <p class="text-2xl mb-1">🛒</p>
        <p class="text-sm font-medium text-slate-600">Your cart is empty</p>
        <p class="text-xs text-slate-400 mt-1">Select items from the menu to start your order.</p>
      </div>
    `,je.textContent="$0.00",Ge.textContent="$0.00",y.disabled=!0,y.className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2",pe.classList.add("hidden");return}pe.classList.remove("hidden"),_.innerHTML="";let n=0;e.forEach(({item:a,quantity:r})=>{const d=Number(a.price)*r;n+=d;const i=document.createElement("div");i.className="py-2.5 flex items-center justify-between gap-2 text-sm",i.innerHTML=`
      <div class="flex-1 min-w-0 pr-2">
        <p class="font-semibold text-slate-800 text-xs truncate">${l(a.name)}</p>
        <p class="text-[11px] text-slate-400">${g(a.price)} each</p>
      </div>
      <div class="flex items-center gap-1.5">
        <button class="qty-btn-minus w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
          -
        </button>
        <span class="w-6 text-center text-xs font-semibold text-slate-800">${r}</span>
        <button class="qty-btn-plus w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
          +
        </button>
      </div>
      <span class="font-bold text-slate-900 text-xs w-14 text-right">${g(d)}</span>
    `,i.querySelector(".qty-btn-minus").addEventListener("click",()=>et(a.id,-1)),i.querySelector(".qty-btn-plus").addEventListener("click",()=>et(a.id,1)),_.appendChild(i)}),je.textContent=g(n),Ge.textContent=g(n),y.disabled=!1,y.className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2"}async function In(){if(!s.user){o("Please sign in or create an account to place your order.","error"),x("login");return}if(s.user.role!=="CUSTOMER"){o("Only customer accounts can place orders from the menu.","error");return}if(s.cart.size===0){o("Please select dishes from the menu first.","error");return}y.disabled=!0,y.textContent="Placing order...";try{const e=Array.from(s.cart.values()).map(({item:n,quantity:a})=>({menuItemId:n.id,quantity:a})),t=await kt(e);o(`Order placed successfully! (#${t.id} - ${g(t.totalAmount)})`),gt(),u("orders")}catch(e){o(e.message,"error"),y.disabled=!1,y.textContent="Place Order"}}function Bn(){const e=new Date;e.setDate(e.getDate()+1),e.setHours(19,0,0,0);const t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0"),r=String(e.getHours()).padStart(2,"0"),d=String(e.getMinutes()).padStart(2,"0");ge.value=`${t}-${n}-${a}T${r}:${d}`,ge.min=new Date().toISOString().slice(0,16)}async function xt(){if(!s.user){Y.classList.add("hidden"),O.innerHTML=`
      <div class="col-span-full py-12 text-center bg-slate-50 rounded-xl p-6 border border-slate-200">
        <p class="text-3xl mb-2">🪑</p>
        <p class="font-bold text-slate-800 text-sm">Please sign in to view available tables</p>
        <p class="text-xs text-slate-500 mt-1 mb-4">You can reserve a table anytime with an account.</p>
        <button id="bookSignInBtn" class="px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-xs hover:bg-amber-700">
          Sign In Now
        </button>
      </div>
    `;const e=document.getElementById("bookSignInBtn");e&&e.addEventListener("click",()=>x("login")),p.disabled=!0,p.className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2";return}Y.classList.remove("hidden"),Ue.classList.add("hidden"),O.innerHTML="";try{const e=await at();if(s.tables=e,Y.classList.add("hidden"),!e||e.length===0){Ue.classList.remove("hidden");return}yt(e)}catch(e){Y.classList.add("hidden"),O.innerHTML=`<div class="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${l(e.message)}</div>`,o(e.message,"error")}}function yt(e){O.innerHTML="",e.forEach(t=>{const n=s.selectedBookingTableId===t.id,a=t.isAvailable,r=document.createElement("div");r.className=`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${a?n?"bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 shadow-xs":"bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs":"bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"}`,r.innerHTML=`
      <div class="flex items-center justify-between mb-3">
        <span class="font-extrabold text-base text-slate-900">Table #${t.tableNumber}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${a?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-600"}">
          ${a?"Available":"Reserved"}
        </span>
      </div>
      <div class="space-y-1 text-xs text-slate-600">
        <p class="flex items-center gap-1.5 font-medium">
          <span>👥 Capacity:</span>
          <span class="font-bold text-slate-800">${t.capacity} Guests</span>
        </p>
        <p class="text-[11px] text-slate-400">Indoor dining area</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <span class="text-xs font-bold ${n?"text-amber-700":"text-slate-500"}">
          ${a?n?"✓ Selected Table":"Select":"Unavailable"}
        </span>
      </div>
    `,a&&r.addEventListener("click",()=>{s.selectedBookingTableId=t.id,ot.innerHTML=`
          <div class="flex items-center justify-between">
            <div>
              <p class="font-bold text-slate-900">Table #${t.tableNumber}</p>
              <p class="text-xs text-slate-500">${t.capacity} Guests capacity</p>
            </div>
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Selected</span>
          </div>
        `,p.disabled=!1,p.className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-2",yt(s.tables)}),O.appendChild(r)})}async function wn(){if(!s.user){o("Please sign in to complete your reservation.","error"),x("login");return}if(!s.selectedBookingTableId){o("Please select a table first.","error");return}const e=ge.value;if(!e){o("Please pick a reservation date and time.","error");return}const t=new Date(e);if(!Number.isFinite(t.getTime())||t<=new Date){o("Choose a valid reservation date and time in the future.","error");return}const n=t.toISOString();p.disabled=!0,p.textContent="Confirming your table...";try{const a=await qt({tableId:s.selectedBookingTableId,reservationDate:n});o(`Reservation confirmed for Table #${a.table?a.table.tableNumber:s.selectedBookingTableId}!`),s.selectedBookingTableId=null,ot.textContent="Click a table on the right to select it.",p.disabled=!0,p.textContent="Confirm Reservation",p.className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all bg-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2",u("reservations")}catch(a){o(a.message,"error"),p.disabled=!1,p.textContent="Confirm Reservation"}}async function ee(){if(!s.user){Q.classList.add("hidden"),oe.classList.add("hidden"),H.innerHTML="",Ve.classList.remove("hidden");return}Ve.classList.add("hidden"),Q.classList.remove("hidden"),oe.classList.add("hidden"),H.innerHTML="";try{const e=await rt();if(s.reservations=e,Q.classList.add("hidden"),!e||e.length===0){oe.classList.remove("hidden");return}Tn(e)}catch(e){Q.classList.add("hidden"),H.innerHTML=`<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${l(e.message)}</div>`,o(e.message,"error")}}function Tn(e){H.innerHTML="",e.forEach(t=>{const n=document.createElement("div");n.className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3";const a=Z(t.status),r=t.status!=="CANCELLED"&&t.status!=="COMPLETED",d=t.table?t.table.tableNumber:t.tableId,i=t.table?`${t.table.capacity} Guests`:"";n.innerHTML=`
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-slate-900 text-base">Table #${d}</span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${a}">
              ${t.status}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Reserved for <span class="font-bold text-slate-800">${Me(t.reservationDate)}</span>
          </p>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-500 font-medium">${i}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-slate-400">Reservation #${t.id}</span>
        ${r?`
          <button class="cancel-res-btn px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors" data-res-id="${t.id}">
            Cancel Booking
          </button>
        `:""}
      </div>
    `;const m=n.querySelector(".cancel-res-btn");m&&m.addEventListener("click",async()=>{if(confirm("Are you sure you want to cancel this table reservation?"))try{await Gt(t.id),o("Reservation cancelled."),ee()}catch(b){o(b.message,"error")}}),H.appendChild(n)})}async function C(){if(!s.user){W.classList.add("hidden"),re.classList.add("hidden"),P.innerHTML="",Je.classList.remove("hidden");return}Je.classList.add("hidden"),W.classList.remove("hidden"),re.classList.add("hidden"),P.innerHTML="";try{const e=dt.value||null,t=await st(e);if(s.orders=t,W.classList.add("hidden"),!t||t.length===0){re.classList.remove("hidden");return}Cn(t)}catch(e){W.classList.add("hidden"),P.innerHTML=`<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${l(e.message)}</div>`,o(e.message,"error")}}function Cn(e){P.innerHTML="",e.forEach(t=>{const n=document.createElement("div");n.className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all space-y-3";const a=Z(t.status),r=t.status!=="CANCELLED"&&t.status!=="COMPLETED",d=(t.orderItems||[]).map(m=>`
        <div class="flex justify-between items-center text-xs py-1 border-b border-slate-50 last:border-0">
          <span class="text-slate-700">
            <span class="font-bold text-amber-700">${m.quantity}x</span> ${l(m.menuItem?m.menuItem.name:`Item #${m.menuItemId}`)}
          </span>
          <span class="font-semibold text-slate-600">${g(Number(m.price)*m.quantity)}</span>
        </div>
      `).join("");n.innerHTML=`
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">Order #${t.id}</span>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${a}">
              ${t.status}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Placed on ${Me(t.createdAt)}
          </p>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400">Total:</span>
          <span class="font-extrabold text-slate-900 text-base ml-1">${g(t.totalAmount)}</span>
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-3">
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Dishes</p>
        <div class="space-y-0.5">
          ${d}
        </div>
      </div>

      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-slate-400">Order Reference #${t.id}</span>
        ${r?`
          <button class="cancel-order-btn px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors" data-order-id="${t.id}">
            Cancel Order
          </button>
        `:""}
      </div>
    `;const i=n.querySelector(".cancel-order-btn");i&&i.addEventListener("click",async()=>{if(confirm(`Are you sure you want to cancel Order #${t.id}?`))try{await Dt(t.id),o(`Order #${t.id} has been cancelled.`),C()}catch(m){o(m.message,"error")}}),P.appendChild(n)})}function tt(){$e.reset(),K.value="",Se.checked=!0,mt.textContent="Add Menu Item",v.textContent="Add Menu Item",Ne.classList.add("hidden")}async function f(){var e;A.innerHTML='<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">Loading menu items...</td></tr>';try{const[t,n]=await Promise.all([nt(),Ce()]);if(s.menuItems=t,s.categories=n,Le.innerHTML=n.length?n.map(r=>`<option value="${r.id}">${l(r.name)}</option>`).join(""):'<option value="">Add a category before creating menu items</option>',t.length===0){A.innerHTML='<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">No menu items found.</td></tr>';return}A.innerHTML="";const a=((e=s.user)==null?void 0:e.role)==="ADMIN";t.forEach(r=>{var m;const d=document.createElement("tr");d.className="hover:bg-slate-50",d.innerHTML=`
        <td class="px-4 py-3"><p class="font-semibold text-slate-900">${l(r.name)}</p><p class="max-w-sm text-xs text-slate-500 break-words">${l(r.description||"")}</p></td>
        <td class="px-4 py-3">${l(((m=r.category)==null?void 0:m.name)||"Uncategorized")}</td>
        <td class="px-4 py-3">${g(r.price)}</td>
        <td class="px-4 py-3">${r.isAvailable?"Available":"Unavailable"}</td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <button class="edit-menu-item-btn rounded border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:bg-slate-100">Edit</button>
          <button class="toggle-menu-item-btn rounded border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:bg-slate-100">${r.isAvailable?"Set unavailable":"Set available"}</button>
          ${a?'<button class="delete-menu-item-btn rounded border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>':""}
        </td>
      `,d.querySelector(".edit-menu-item-btn").addEventListener("click",()=>{K.value=r.id,Ee.value=r.name,lt.value=r.price,ct.value=r.description||"",Le.value=String(r.categoryId),Se.checked=r.isAvailable,mt.textContent=`Edit ${r.name}`,v.textContent="Save Changes",Ne.classList.remove("hidden"),$e.scrollIntoView({behavior:"smooth",block:"center"}),Ee.focus()}),d.querySelector(".toggle-menu-item-btn").addEventListener("click",async b=>{const G=b.currentTarget;G.disabled=!0;try{await Mt(r.id,!r.isAvailable),o(`${r.name} is now ${r.isAvailable?"unavailable":"available"}.`),await f(),await E()}catch(vt){o(vt.message,"error"),G.disabled=!1}});const i=d.querySelector(".delete-menu-item-btn");i&&i.addEventListener("click",async()=>{if(confirm(`Delete "${r.name}" from the menu?`)){i.disabled=!0;try{await At(r.id),o(`${r.name} deleted.`),await f(),await E()}catch(b){o(b.message,"error"),i.disabled=!1}}}),A.appendChild(d)})}catch(t){A.innerHTML=`<tr><td colspan="5" class="px-4 py-8 text-center text-red-600">${l(t.message)}</td></tr>`,o(t.message,"error")}}async function j(){k.innerHTML='<div class="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">Loading categories...</div>';try{const e=await Ce();if(s.categories=e,e.length===0){k.innerHTML='<div class="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">No categories yet. Add one above to create menu items.</div>';return}k.innerHTML="",e.forEach(t=>{var r,d;const n=document.createElement("div");n.className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4",n.innerHTML=`
        <div><p class="font-semibold text-slate-900">${l(t.name)}</p><p class="text-xs text-slate-500">${((r=t._count)==null?void 0:r.menuItems)??0} menu items</p></div>
        <div class="flex flex-wrap gap-2">
          <button class="rename-category-btn rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">Rename</button>
          ${((d=s.user)==null?void 0:d.role)==="ADMIN"?'<button class="delete-category-btn rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>':""}
        </div>
      `,n.querySelector(".rename-category-btn").addEventListener("click",async()=>{const i=prompt("Enter the new category name:",t.name);if(!(i===null||!i.trim()||i.trim()===t.name))try{await Ct(t.id,i.trim()),o(`Category renamed to ${i.trim()}.`),await j(),await f(),await q()}catch(m){o(m.message,"error")}});const a=n.querySelector(".delete-category-btn");a&&a.addEventListener("click",async()=>{if(confirm(`Delete category "${t.name}"? Categories containing ordered items may be protected by the server.`)){a.disabled=!0;try{await $t(t.id),o(`Category "${t.name}" deleted.`),await j(),await f(),await q()}catch(i){o(i.message,"error"),a.disabled=!1}}}),k.appendChild(n)})}catch(e){k.innerHTML=`<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${l(e.message)}</div>`}}function ft(){s.adminSubTab==="menu"?f():s.adminSubTab==="categories"?j():s.adminSubTab==="tables"?L():s.adminSubTab==="reservations"?te():s.adminSubTab==="orders"&&ne()}async function L(){S.innerHTML='<tr><td colspan="5" class="px-4 py-8 text-center text-slate-400">Loading tables...</td></tr>';try{const e=await at();if(s.tables=e,S.innerHTML="",!e||e.length===0){S.innerHTML=`
        <tr>
          <td colspan="5" class="px-4 py-8 text-center text-slate-400">No tables configured yet. Add one above.</td>
        </tr>
      `;return}const t=s.user&&s.user.role==="ADMIN";e.forEach(n=>{const a=document.createElement("tr");a.className="hover:bg-slate-50 transition-colors";const r=n._count?n._count.reservations:0;a.innerHTML=`
        <td class="px-4 py-3 font-bold text-slate-900">Table #${n.tableNumber}</td>
        <td class="px-4 py-3 text-slate-700">${n.capacity} Guests</td>
        <td class="px-4 py-3">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full ${n.isAvailable?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}">
            ${n.isAvailable?"Available":"Unavailable"}
          </span>
        </td>
        <td class="px-4 py-3 text-slate-500 font-medium">${r} Total</td>
        <td class="px-4 py-3 text-right space-x-1">
          <button class="toggle-avail-btn text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700" data-table-id="${n.id}" data-current="${n.isAvailable}">
            ${n.isAvailable?"Set Unavailable":"Set Available"}
          </button>
          <button class="edit-table-btn text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700" data-table-id="${n.id}" data-num="${n.tableNumber}" data-cap="${n.capacity}">
            Edit
          </button>
          ${t?`
            <button class="delete-table-btn text-xs font-semibold px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50" data-table-id="${n.id}">
              Delete
            </button>
          `:""}
        </td>
      `,a.querySelector(".toggle-avail-btn").addEventListener("click",async()=>{try{const i=!n.isAvailable;await Rt(n.id,i),o(`Table #${n.tableNumber} marked as ${i?"Available":"Unavailable"}`),L()}catch(i){o(i.message,"error")}}),a.querySelector(".edit-table-btn").addEventListener("click",()=>{ut.value=n.id,bt.value=n.tableNumber,pt.value=n.capacity,Ie.classList.remove("hidden")});const d=a.querySelector(".delete-table-btn");d&&d.addEventListener("click",async()=>{if(confirm(`Permanently delete Table #${n.tableNumber}?`))try{await Ft(n.id),o(`Table #${n.tableNumber} deleted successfully.`),L()}catch(i){o(i.message,"error")}}),S.appendChild(a)})}catch(e){S.innerHTML=`<tr><td colspan="5" class="px-4 py-8 text-center text-red-600">${l(e.message)}</td></tr>`,o(e.message,"error")}}async function te(){N.innerHTML='<div class="py-8 text-center text-slate-400 text-xs">Loading all reservations...</div>';try{const e=it.value||null,t=await rt(e);if(s.adminReservations=t,!t||t.length===0){N.innerHTML='<div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">No reservations found for this filter.</div>';return}N.innerHTML="",t.forEach(n=>{const a=document.createElement("div");a.className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";const r=n.customer?n.customer.name:`Customer #${n.customerId}`,d=n.customer?n.customer.email:"",i=n.table?n.table.tableNumber:n.tableId;a.innerHTML=`
        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">Table #${i}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-bold border ${Z(n.status)}">${n.status}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1">
            Guest: <span class="font-bold text-slate-800">${l(r)}</span> (${l(d)})
          </p>
          <p class="text-xs text-slate-400">
            Booking Date: ${Me(n.reservationDate)}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 font-medium">Update Status:</span>
          <select class="admin-res-status-select border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-700" data-res-id="${n.id}">
            <option value="" disabled selected>Select status...</option>
            <option value="PENDING" ${n.status==="PENDING"?"disabled":""}>PENDING</option>
            <option value="CONFIRMED" ${n.status==="CONFIRMED"?"disabled":""}>CONFIRMED</option>
            <option value="COMPLETED" ${n.status==="COMPLETED"?"disabled":""}>COMPLETED</option>
            <option value="CANCELLED" ${n.status==="CANCELLED"?"disabled":""}>CANCELLED</option>
          </select>
        </div>
      `,a.querySelector(".admin-res-status-select").addEventListener("change",async m=>{const b=m.target.value;if(b)try{await jt(n.id,b),o(`Reservation #${n.id} marked as ${b}`),te()}catch(G){o(G.message,"error")}}),N.appendChild(a)})}catch(e){N.innerHTML=`<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${l(e.message)}</div>`,o(e.message,"error")}}async function ne(){M.innerHTML='<div class="py-8 text-center text-slate-400 text-xs">Loading all orders...</div>';try{const e=await st();if(s.adminOrders=e,!e||e.length===0){M.innerHTML='<div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">No customer orders placed yet.</div>';return}M.innerHTML="",e.forEach(t=>{const n=document.createElement("div");n.className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";const a=t.customer?t.customer.name:`Customer #${t.customerId}`,r=(t.orderItems||[]).map(d=>`${d.quantity}x ${d.menuItem?d.menuItem.name:"Item"}`).join(", ");n.innerHTML=`
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">Order #${t.id}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-bold border ${Z(t.status)}">${t.status}</span>
            <span class="font-bold text-slate-900 text-sm ml-2">${g(t.totalAmount)}</span>
          </div>
          <p class="text-xs text-slate-600">
            Customer: <span class="font-bold text-slate-800">${l(a)}</span>
          </p>
          <p class="text-xs text-slate-500 font-medium truncate max-w-md">
            ${l(r)}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 font-medium">Update Status:</span>
          <select class="admin-order-status-select border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-700" data-order-id="${t.id}">
            <option value="" disabled selected>Change Status...</option>
            <option value="PENDING" ${t.status==="PENDING"?"disabled":""}>PENDING</option>
            <option value="CONFIRMED" ${t.status==="CONFIRMED"?"disabled":""}>CONFIRMED</option>
            <option value="PREPARING" ${t.status==="PREPARING"?"disabled":""}>PREPARING</option>
            <option value="READY" ${t.status==="READY"?"disabled":""}>READY</option>
            <option value="COMPLETED" ${t.status==="COMPLETED"?"disabled":""}>COMPLETED</option>
            <option value="CANCELLED" ${t.status==="CANCELLED"?"disabled":""}>CANCELLED</option>
          </select>
        </div>
      `,n.querySelector(".admin-order-status-select").addEventListener("change",async d=>{const i=d.target.value;if(i)try{await Ot(t.id,i),o(`Order #${t.id} updated to ${i}`),ne()}catch(m){o(m.message,"error")}}),M.appendChild(n)})}catch(e){M.innerHTML=`<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${l(e.message)}</div>`,o(e.message,"error")}}function $n(){Jt.addEventListener("click",()=>{var t,n;return u(((t=s.user)==null?void 0:t.role)==="ADMIN"||((n=s.user)==null?void 0:n.role)==="STAFF"?"admin":"menu")}),le.addEventListener("click",()=>u("menu")),ce.addEventListener("click",()=>u("bookTable")),me.addEventListener("click",()=>u("orders")),ue.addEventListener("click",()=>u("reservations")),T.addEventListener("click",()=>u("admin")),Wt.addEventListener("click",()=>u("bookTable")),Kt.addEventListener("click",()=>u("reservations")),tn.addEventListener("click",()=>u("bookTable")),sn.addEventListener("click",()=>u("bookTable")),en.addEventListener("click",()=>u("menu")),Vt.addEventListener("click",()=>{u("menu"),_.scrollIntoView({behavior:"smooth"})});let e;Qt.addEventListener("input",t=>{clearTimeout(e),e=setTimeout(()=>{s.searchQuery=t.target.value.trim(),E()},300)}),_t.addEventListener("click",()=>{q(),E()}),y.addEventListener("click",In),pe.addEventListener("click",gt),p.addEventListener("click",wn),dt.addEventListener("change",C),Xt.addEventListener("click",C),Zt.addEventListener("click",()=>x("login")),nn.addEventListener("click",()=>x("login")),ve.addEventListener("click",()=>I("menu")),he.addEventListener("click",()=>I("categories")),xe.addEventListener("click",()=>I("tables")),ye.addEventListener("click",()=>I("reservations")),fe.addEventListener("click",()=>I("orders")),on.addEventListener("click",L),it.addEventListener("change",te),dn.addEventListener("click",ne),un.addEventListener("click",f),Ne.addEventListener("click",tt),$e.addEventListener("submit",async t=>{if(t.preventDefault(),s.categories.length===0){o("Create a category before adding menu items.","error"),I("categories");return}const n=K.value,a=!!n,r=a?"Save Changes":"Add Menu Item",d={name:Ee.value.trim(),description:ct.value.trim(),price:Number(lt.value),categoryId:Number(Le.value),isAvailable:Se.checked};v.disabled=!0,v.textContent=a?"Saving...":"Adding...";try{a?(await Nt(n,d),o("Menu item updated.")):(await St(d),o("Menu item added.")),tt(),await f(),await E()}catch(i){o(i.message,"error")}finally{v.disabled=!1,v.textContent=a?"Save Changes":"Add Menu Item"}K.value?v.textContent=r:v.textContent="Add Menu Item"}),de.addEventListener("submit",async t=>{t.preventDefault();const n=de.querySelector('button[type="submit"]'),a=bn.value.trim();n.disabled=!0,n.textContent="Adding...";try{await Tt(a),o(`Category "${a}" added.`),de.reset(),await j(),await f(),await q()}catch(r){o(r.message,"error")}finally{n.disabled=!1,n.textContent="Add Category"}}),Ke.addEventListener("submit",async t=>{t.preventDefault();const n=an.value,a=rn.value;try{await Pt({tableNumber:n,capacity:a}),o(`Table #${n} created successfully!`),Ke.reset(),L()}catch(r){o(r.message,"error")}}),pn.addEventListener("click",()=>Ie.classList.add("hidden")),gn.addEventListener("submit",async t=>{t.preventDefault();const n=ut.value,a=Number(bt.value),r=Number(pt.value);try{await Ht(n,{tableNumber:a,capacity:r}),o("Table updated successfully!"),Ie.classList.add("hidden"),L()}catch(d){o(d.message,"error")}}),Be.addEventListener("click",()=>x("login")),we.addEventListener("click",()=>x("register")),xn.addEventListener("click",ie),X.addEventListener("click",t=>{t.target===X&&ie()}),fn.addEventListener("click",()=>{B.value="alice@example.com",D.value="password123",s.authModalMode==="register"&&(z.value="Alice Customer")}),vn.addEventListener("click",()=>{B.value="staff@example.com",D.value="password123",s.authModalMode==="register"&&(z.value="Restaurant Staff")}),hn.addEventListener("click",()=>{B.value="admin@example.com",D.value="password123",s.authModalMode==="register"&&(z.value="Admin Manager")}),yn.addEventListener("submit",async t=>{t.preventDefault(),R.classList.add("hidden"),w.disabled=!0,w.textContent="Signing in...";try{if(s.authModalMode==="login"){const n=await Lt({email:B.value.trim(),password:D.value});s.user=n.data,o(`Welcome back, ${n.data.name}!`)}else{const n=await Et({name:z.value.trim(),email:B.value.trim(),password:D.value});s.user=n.data,o(`Account created! Welcome, ${n.data.name}`)}ie(),F(),h(),s.activeView==="orders"&&C(),s.activeView==="reservations"&&ee(),s.activeView==="bookTable"&&xt(),s.activeView==="admin"&&ft()}catch(n){R.textContent=n.message,R.classList.remove("hidden")}finally{w.disabled=!1,w.textContent=s.authModalMode==="login"?"Sign In":"Create Account"}}),window.addEventListener("auth:unauthorized",()=>{s.user=null,F(),h(),Te(),o("Your session has expired. Please sign in again.","error"),x("login")})}async function Sn(){if(F(),h(),$n(),wt())try{const e=await It();s.user=e.data,localStorage.setItem("user",JSON.stringify(e.data)),F(),h()}catch(e){e.status!==401&&o(`Unable to validate your saved session: ${e.message}`,"error")}q(),E()}Sn();
