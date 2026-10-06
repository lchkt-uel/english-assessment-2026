/* =========================================================
   CẤU HÌNH – chỉ cần sửa phần này (xem HUONG_DAN.md)
   ========================================================= */
const CAU_HINH = {
  // Link Google Apps Script dạng https://script.google.com/macros/s/..../exec
  API_URL: "https://script.google.com/macros/s/AKfycbzZgxbcIgKavaOIoCWzJqP1hX7wquq7IIQesomNTc1IvKRQ8wPH5eDH2_HllVTh2LH6hQ/exec",

  // Mốc điểm được xét cấp Giấy chứng nhận
  MOC_CHUNG_NHAN: 550,

  // Số ký tự của mã xác nhận (captcha) tự sinh trên trang
  CAPTCHA_DO_DAI: 5,

  // Video nền YouTube (giới thiệu Trung tâm Anh ngữ TITAN)
  YOUTUBE_ID: "NwgvR-ZfUO0",
  YOUTUBE_START: 15, // bắt đầu phát từ giây thứ 15

  // Trung tâm Anh ngữ TITAN (đơn vị đồng hành)
  TITAN: {
    FANPAGE: "https://www.facebook.com/EnglishWithTITAN",
    MESSENGER: "https://m.me/EnglishWithTITAN",
    SDT: "039 537 7265",
    ZALO: "", // VD: "https://zalo.me/0395377265" – để trống thì không hiện nút Zalo
  },

  // Thông tin liên hệ Ban Tổ chức (BCH Liên Chi hội Khoa Kinh tế)
  LIEN_HE: {
    FANPAGE_TEN: "Eco Media",
    FANPAGE: "https://www.facebook.com/ecomedia.uel",
    EMAIL: "lchkinhte@st.uel.edu.vn",
    SDT: "0965 686 752",
    NGUOI: "Mr. Đăng Khoa",
  },

  // Thời gian chờ máy chủ tối đa (mili giây)
  THOI_GIAN_CHO: 20000,
};

/* =========================================================
   Không cần sửa từ đây trở xuống
   ========================================================= */
const $ = (s, goc = document) => goc.querySelector(s);
const $$ = (s, goc = document) => Array.from(goc.querySelectorAll(s));
const GIAM_CHUYEN_DONG = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DIEM_TOI_DA = 990;
const DIEM_KY_NANG = 495;
const SO_LAN_SAI_TOI_DA = 5;

// Mốc tham chiếu ETS cho TOEIC Listening & Reading
const BAC_THAM_KHAO = [
  { ten: "C1", tu: 945 },
  { ten: "B2", tu: 785 },
  { ten: "B1", tu: 550 },
  { ten: "A2", tu: 225 },
  { ten: "A1", tu: 120 },
];
const bacTheoDiem = (diem) => (BAC_THAM_KHAO.find((b) => diem >= b.tu) || { ten: "Dưới A1" }).ten;

const docLuu = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const ghiLuu = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } };
const thoat = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = (ten) => `<svg aria-hidden="true"><use href="#${ten}"/></svg>`;

/* ---------------------------------------------------------
   1. Logo dự phòng, liên kết TITAN, liên hệ
   --------------------------------------------------------- */
function thayLogoHong(img) {
  if (img.dataset.daThay) return;
  img.dataset.daThay = "1";
  if (img.getAttribute("aria-hidden") === "true" || img.alt === "") { img.remove(); return; } // ảnh trang trí: bỏ qua
  const o = document.createElement("span");
  o.className = "logo-giu-cho";
  o.textContent = "Thiếu " + img.getAttribute("src");
  o.title = "Cần thêm file " + img.getAttribute("src") + " (" + img.alt + ")";
  img.replaceWith(o);
}
function khoiTaoLogo() {
  $$("img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.loading !== "lazy") thayLogoHong(img);
    else img.addEventListener("error", () => thayLogoHong(img), { once: true });
  });
}

const soDienThoaiQuocTe = (sdt) => {
  const so = String(sdt).replace(/\D/g, "");
  return so.startsWith("0") ? "+84" + so.slice(1) : "+" + so;
};

function khoiTaoLienKet() {
  const t = CAU_HINH.TITAN;
  $$("[data-link-titan]").forEach((a) => { a.href = t.FANPAGE; });
  $$("[data-messenger-titan]").forEach((a) => { a.href = t.MESSENGER || t.FANPAGE; });
  $$("[data-tel-titan]").forEach((a) => { a.href = "tel:" + soDienThoaiQuocTe(t.SDT); });
  $$("[data-sdt-titan]").forEach((el) => { el.textContent = t.SDT; });
  if (t.ZALO) {
    const a = document.createElement("a");
    a.className = "nut nut-kinh"; a.href = t.ZALO; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = `${icon("i-tin-nhan")}Nhắn Zalo`;
    $(".titan-nut").appendChild(a);
  }

  const lh = CAU_HINH.LIEN_HE || {};
  const anNeuTrong = (sel, giaTri, gan) => $$(sel).forEach((el) => {
    if (!giaTri) { const li = el.closest("li"); if (li) li.remove(); return; }
    gan(el);
  });
  anNeuTrong("[data-btc-fanpage]", lh.FANPAGE, (a) => { a.href = lh.FANPAGE; a.textContent = lh.FANPAGE_TEN || "Fanpage"; });
  anNeuTrong("[data-btc-email]", lh.EMAIL, (a) => { a.href = "mailto:" + lh.EMAIL; a.textContent = lh.EMAIL; });
  anNeuTrong("[data-btc-sdt]", lh.SDT, (a) => { a.href = "tel:" + soDienThoaiQuocTe(lh.SDT); a.textContent = lh.SDT; });
  $$("[data-btc-nguoi]").forEach((el) => { el.textContent = lh.NGUOI ? "(" + lh.NGUOI + ")" : ""; });
}
function chuLienHe() {
  const lh = CAU_HINH.LIEN_HE || {};
  if (lh.FANPAGE) return `, hoặc nhắn Ban Tổ chức qua fanpage <a href="${thoat(lh.FANPAGE)}" target="_blank" rel="noopener">${thoat(lh.FANPAGE_TEN || "Ban Tổ chức")}</a>`;
  if (lh.EMAIL) return `, hoặc email <a href="mailto:${thoat(lh.EMAIL)}">${thoat(lh.EMAIL)}</a>`;
  return "";
}

/* ---------------------------------------------------------
   2. Hiệu ứng: mở trang, hiện dần khi cuộn, đèn rọi trên popup
   --------------------------------------------------------- */
function moManDau() {
  const mo = () => document.body.classList.add("da-mo");
  if (GIAM_CHUYEN_DONG) return mo();
  const choFont = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([choFont, new Promise((x) => setTimeout(x, 900))]).then(() => requestAnimationFrame(mo));
  setTimeout(mo, 2500); // an toàn: luôn hiện nội dung
}

function khoiTaoCuon() {
  const muc = $$("[data-cuon]");
  // các thẻ đứng cạnh nhau hiện lần lượt
  $$(".luoi-the").forEach((l) => $$("[data-cuon]", l).forEach((el, i) => el.style.setProperty("--tre", i * 0.14 + "s")));
  if (GIAM_CHUYEN_DONG || !("IntersectionObserver" in window)) { muc.forEach((el) => el.classList.add("da-hien")); return; }
  const quan = new IntersectionObserver((ds) => ds.forEach((m) => {
    if (m.isIntersecting) { m.target.classList.add("da-hien"); quan.unobserve(m.target); }
  }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  muc.forEach((el) => quan.observe(el));
}

function khoiTaoDenRoi() {
  const pop = $("#popup");
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  pop.addEventListener("pointermove", (e) => {
    const r = pop.getBoundingClientRect();
    pop.style.setProperty("--mx", (e.clientX - r.left) + "px");
    pop.style.setProperty("--my", (e.clientY - r.top) + "px");
  });
}

function khoiTaoHeader() {
  const dt = $("#dau-trang");
  let cho = false;
  const cap = () => { dt.classList.toggle("da-cuon", window.scrollY > 40); cho = false; };
  window.addEventListener("scroll", () => { if (!cho) { cho = true; requestAnimationFrame(cap); } }, { passive: true });
  cap();
}

// Video giới thiệu: chỉ nạp trình phát YouTube khi người xem bấm (nhẹ trang)
function khoiTaoVideoGioiThieu() {
  const id = CAU_HINH.YOUTUBE_ID;
  const nut = $("#vgt-nut"), anh = $("#vgt-anh");
  if (!id) { $("#video-gt").hidden = true; return; }
  anh.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  anh.addEventListener("load", () => { if (anh.naturalWidth < 200) anh.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`; });
  anh.addEventListener("error", () => { anh.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }, { once: true });
  nut.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    f.title = "Video giới thiệu Trung tâm Anh ngữ TITAN";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    $("#vgt-man").replaceChildren(f);
    tamDungVideo(); // tắt video nền để không tranh âm thanh/hiệu năng
    f.focus();
  });
}

// Chuyển màn: nhòe loang rồi thu nét (trình duyệt hỗ trợ View Transitions), nếu không thì đổi ngay
function chuyenMan(doi) {
  if (!GIAM_CHUYEN_DONG && document.startViewTransition) {
    try { document.startViewTransition(doi); return; } catch (e) { /* đổi ngay bên dưới */ }
  }
  doi();
}

/* ---------------------------------------------------------
   3. Mã xác nhận (captcha) tự sinh trên trang
   --------------------------------------------------------- */
const BO_KY_TU = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // bỏ 0/O, 1/I/L để dễ đọc
let maXacNhan = "";
const ngauNhien = (a, b) => a + Math.random() * (b - a);

function veCaptcha() {
  const cv = $("#captcha-anh");
  const khung = cv.getBoundingClientRect();
  const w = Math.max(100, khung.width), h = Math.max(40, khung.height);
  const tl = Math.min(window.devicePixelRatio || 1, 3);
  cv.width = Math.round(w * tl); cv.height = Math.round(h * tl);
  const ctx = cv.getContext("2d");
  ctx.setTransform(tl, 0, 0, tl, 0, 0);
  const nen = ctx.createLinearGradient(0, 0, w, h);
  nen.addColorStop(0, "#EAF3FC"); nen.addColorStop(1, "#FFF1E4");
  ctx.fillStyle = nen; ctx.fillRect(0, 0, w, h);
  const mau = ["#0A1F44", "#133A7C", "#C94A14", "#0A6FB0", "#8A3A10"];
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(19,58,124,${ngauNhien(0.08, 0.3)})`;
    ctx.beginPath(); ctx.arc(ngauNhien(0, w), ngauNhien(0, h), ngauNhien(0.5, 1.6), 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(247,147,30,${ngauNhien(0.25, 0.45)})`; ctx.lineWidth = ngauNhien(1, 2);
    ctx.beginPath(); ctx.moveTo(0, ngauNhien(0, h));
    ctx.bezierCurveTo(w * 0.3, ngauNhien(0, h), w * 0.7, ngauNhien(0, h), w, ngauNhien(0, h)); ctx.stroke();
  }
  const buoc = (w - 18) / maXacNhan.length;
  [...maXacNhan].forEach((kt, i) => {
    ctx.save();
    ctx.translate(9 + buoc * (i + 0.5) + ngauNhien(-2, 2), h / 2 + ngauNhien(-4, 4));
    ctx.rotate(ngauNhien(-0.38, 0.38));
    ctx.font = `${Math.random() < 0.5 ? 800 : 700} ${Math.round(ngauNhien(h * 0.5, h * 0.62))}px Montserrat, Arial, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = mau[Math.floor(Math.random() * mau.length)];
    ctx.fillText(kt, 0, 1);
    ctx.restore();
  });
  ctx.strokeStyle = "rgba(10,31,68,.45)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(4, ngauNhien(h * 0.3, h * 0.7));
  ctx.quadraticCurveTo(w / 2, ngauNhien(0, h), w - 4, ngauNhien(h * 0.3, h * 0.7)); ctx.stroke();
}

function taoMaXacNhan() {
  const so = new Uint32Array(CAU_HINH.CAPTCHA_DO_DAI);
  (window.crypto || window.msCrypto).getRandomValues(so);
  maXacNhan = Array.from(so, (n) => BO_KY_TU[n % BO_KY_TU.length]).join("");
  veCaptcha();
}

function ngheMaXacNhan() {
  const s = window.speechSynthesis;
  s.cancel();
  const loi = new SpeechSynthesisUtterance(maXacNhan.split("").join(", "));
  const giong = s.getVoices().find((v) => /^vi/i.test(v.lang));
  if (giong) { loi.voice = giong; loi.lang = giong.lang; } else loi.lang = "en-US";
  loi.rate = 0.7;
  s.speak(loi);
}

function khoiTaoCaptcha() {
  taoMaXacNhan();
  $("#nut-doi-ma").addEventListener("click", () => { taoMaXacNhan(); $("#xac-nhan").value = ""; $("#xac-nhan").focus(); });
  if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
    $("#nut-nghe-ma").hidden = false;
    $("#nut-nghe-ma").addEventListener("click", ngheMaXacNhan);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(veCaptcha);
  let hen;
  window.addEventListener("resize", () => { clearTimeout(hen); hen = setTimeout(veCaptcha, 200); });
}

/* ---------------------------------------------------------
   5. Gọi máy chủ (Google Apps Script)
   --------------------------------------------------------- */
async function goiApi(msv, email) {
  if (!CAU_HINH.API_URL.trim()) return { ok: false, loi: "LOI_MAY_CHU" };
  if (navigator.onLine === false) return { ok: false, loi: "MANG" };
  const dieuKhien = new AbortController();
  const hetGio = setTimeout(() => dieuKhien.abort(), CAU_HINH.THOI_GIAN_CHO);
  const url = CAU_HINH.API_URL.trim() + "?msv=" + encodeURIComponent(msv) + "&email=" + encodeURIComponent(email);
  try {
    // GET đơn giản, KHÔNG thêm header để tránh CORS preflight (Apps Script không hỗ trợ)
    const phanHoi = await fetch(url, { method: "GET", redirect: "follow", signal: dieuKhien.signal });
    if (!phanHoi.ok) return { ok: false, loi: "LOI_MAY_CHU" };
    try { return await phanHoi.json(); } catch (e) { return { ok: false, loi: "LOI_MAY_CHU" }; }
  } catch (e) {
    return { ok: false, loi: e.name === "AbortError" ? "HET_GIO" : "MANG" };
  } finally {
    clearTimeout(hetGio);
  }
}

const chuanHoaMsv = (s) => String(s || "").replace(/\s+/g, "").toUpperCase();
const chuanHoaEmail = (s) => String(s || "").replace(/\s+/g, "").toLowerCase();
const laSo = (v) => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v));

function chuanHoaKetQua(d, msvNhap) {
  if (!d || !laSo(d.nghe) || !laSo(d.doc)) return null;
  const nghe = Math.round(Number(d.nghe));
  const doc = Math.round(Number(d.doc));
  return {
    msv: chuanHoaMsv(d.msv) || msvNhap,
    hoTen: String(d.hoTen || "").replace(/\s+/g, " ").trim() || "Thí sinh",
    nghe, doc,
    tong: laSo(d.tong) ? Math.round(Number(d.tong)) : nghe + doc,
    ngheCau: laSo(d.ngheCau) ? Number(d.ngheCau) : null,
    docCau: laSo(d.docCau) ? Number(d.docCau) : null,
  };
}

function cheEmail(email) {
  const [ten, mien] = email.split("@");
  if (!mien) return email;
  const hien = ten.length <= 3 ? ten[0] : ten.slice(0, 2) + "•••" + ten.slice(-1);
  return hien + "@" + mien;
}

/* ---------------------------------------------------------
   6. Form & thông báo
   --------------------------------------------------------- */
const khoaCucBo = {}; // ghi nhớ MSSV đang bị khóa để không gọi máy chủ vô ích

function hienThongBao(loai, tieuDe, noiDung, iconTen) {
  const hop = $("#thong-bao");
  hop.className = "thong-bao tb-" + loai;
  hop.innerHTML = `${icon(iconTen)}<p class="thong-bao-tieu-de">${tieuDe}</p><p class="thong-bao-noi-dung">${noiDung}</p>`;
  hop.hidden = false;
  if (!GIAM_CHUYEN_DONG) { hop.classList.remove("rung"); void hop.offsetWidth; hop.classList.add("rung"); }
}
function xoaThongBao() {
  $("#thong-bao").hidden = true;
  $$("#form-tra-cuu input").forEach((i) => i.removeAttribute("aria-invalid"));
}
function danhDauLoi(...oNhap) {
  oNhap.forEach((o) => o.setAttribute("aria-invalid", "true"));
  if (oNhap[0]) oNhap[0].focus();
}

const NHAC_MA_MOI = " Mã xác nhận đã được đổi mới.";

function hienLoi(kq) {
  const oMsv = $("#msv"), oEmail = $("#email");
  switch (kq.loi) {
    case "THIEU":
      return hienThongBao("canh-bao", "Còn thiếu thông tin", "Vui lòng nhập đầy đủ <b>MSSV</b>, <b>email</b> và <b>mã xác nhận</b> trước khi xem kết quả.", "i-canh-bao");
    case "SAI": {
      const conLai = Number(kq.conLai);
      const nhac = laSo(kq.conLai) && conLai <= 2
        ? ` <b>Bạn còn ${conLai} lượt thử</b> trước khi MSSV này được tạm khóa.` : "";
      danhDauLoi(oEmail);
      return hienThongBao(nhac ? "canh-bao" : "loi", "Thông tin chưa trùng khớp",
        "MSSV và email chưa khớp với dữ liệu dự thi. Bạn kiểm tra lại email đã đăng ký – chính tả, dấu chấm và phần sau @." + nhac + NHAC_MA_MOI, "i-canh-bao");
    }
    case "KHOA": {
      const phut = laSo(kq.phut) ? Math.max(1, Math.ceil(Number(kq.phut))) : null;
      khoaCucBo[chuanHoaMsv(oMsv.value)] = Date.now() + (phut || 5) * 60000;
      return hienThongBao("khoa", "Tạm khóa tra cứu cho MSSV này",
        `MSSV này đã nhập sai quá ${SO_LAN_SAI_TOI_DA} lần nên được khóa tạm để bảo vệ kết quả. Vui lòng thử lại sau ${phut ? `<b>khoảng ${phut} phút</b>` : "<b>vài phút</b>"}.`, "i-khoa");
    }
    case "CHUA_CO_DIEM":
      return hienThongBao("canh-bao", "Chưa có kết quả cho MSSV này",
        `Thông tin của bạn đã khớp nhưng hệ thống chưa ghi nhận bài làm. Nếu bạn đã dự thi ngày 04/10/2026, vui lòng liên hệ Ban Tổ chức${chuLienHe()}.`, "i-canh-bao");
    case "HET_GIO":
      return hienThongBao("mang", "Máy chủ phản hồi quá lâu",
        "Có thể đường truyền đang chậm hoặc nhiều bạn đang tra cứu cùng lúc. Vui lòng thử lại sau giây lát." + NHAC_MA_MOI, "i-wifi");
    case "MANG":
      return hienThongBao("mang", "Không kết nối được máy chủ",
        "Vui lòng kiểm tra kết nối Wi-Fi hoặc 4G, rồi thử lại." + NHAC_MA_MOI, "i-wifi");
    default:
      return hienThongBao("loi", "Hệ thống đang bận",
        `Yêu cầu chưa được xử lý. Vui lòng thử lại sau ít phút${chuLienHe()}.`, "i-canh-bao");
  }
}

function datDangTai(dangTai) {
  const nut = $("#nut-gui");
  nut.disabled = dangTai;
  nut.classList.toggle("dang-tai", dangTai);
  nut.setAttribute("aria-busy", String(dangTai));
  $(".nut-gui-chu", nut).textContent = dangTai ? "Đang tra cứu…" : "Xem kết quả";
}

async function xuLyGui(e) {
  e.preventDefault();
  xoaThongBao();
  const oMsv = $("#msv"), oEmail = $("#email"), oXn = $("#xac-nhan");
  const msv = chuanHoaMsv(oMsv.value), email = chuanHoaEmail(oEmail.value), xn = chuanHoaMsv(oXn.value);
  oMsv.value = msv; oEmail.value = email; oXn.value = xn;

  const trong = [[oMsv, msv], [oEmail, email], [oXn, xn]].filter(([, v]) => !v).map(([o]) => o);
  if (trong.length) { danhDauLoi(...trong); return hienLoi({ loi: "THIEU" }); }
  if (!/^K\d{9}$/.test(msv)) {
    danhDauLoi(oMsv);
    return hienThongBao("canh-bao", "MSSV chưa đúng định dạng",
      "MSSV gồm chữ <b>K</b> và <b>9 chữ số</b>, ví dụ <b class=\"nw\">K244060743</b>.", "i-canh-bao");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    danhDauLoi(oEmail);
    return hienThongBao("canh-bao", "Email chưa đúng định dạng",
      "Email cần có dạng <b class=\"nw\">tenban@st.uel.edu.vn</b> – bạn kiểm tra lại ký tự @ và phần đuôi.", "i-canh-bao");
  }
  if (xn !== maXacNhan) {
    taoMaXacNhan(); oXn.value = "";
    danhDauLoi(oXn);
    return hienThongBao("canh-bao", "Mã xác nhận chưa đúng",
      "Hệ thống đã tạo mã mới. Bạn nhập lại các ký tự trong ảnh, không cần phân biệt hoa thường.", "i-khien-nho");
  }
  if (khoaCucBo[msv] > Date.now()) {
    taoMaXacNhan(); oXn.value = "";
    return hienLoi({ loi: "KHOA", phut: (khoaCucBo[msv] - Date.now()) / 60000 });
  }

  datDangTai(true);
  const kq = await goiApi(msv, email);
  datDangTai(false);
  taoMaXacNhan(); oXn.value = "";

  if (kq && kq.ok) {
    const duLieu = chuanHoaKetQua(kq.data, msv);
    if (duLieu) return hienKetQua(duLieu, email);
    return hienLoi({ loi: "LOI_MAY_CHU" });
  }
  hienLoi(kq || { loi: "LOI_MAY_CHU" });
}

function khoiTaoForm() {
  $("#form-tra-cuu").addEventListener("submit", xuLyGui);
  $$("#form-tra-cuu input").forEach((o) => o.addEventListener("input", () => o.removeAttribute("aria-invalid")));
}

/* ---------------------------------------------------------
   7. Hiển thị kết quả
   --------------------------------------------------------- */
function demSo(el, den, thoiGian = 1300) {
  if (GIAM_CHUYEN_DONG) { el.textContent = den; return; }
  const batDau = performance.now();
  const buoc = (t) => {
    const p = Math.min(1, (t - batDau) / thoiGian);
    el.textContent = Math.round(den * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(buoc);
  };
  requestAnimationFrame(buoc);
}

const sauKhiVe = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

function veVongDiem(tong) {
  const chuVi = 2 * Math.PI * 92;
  const tiLe = Math.max(0, Math.min(1, tong / DIEM_TOI_DA));
  const vong = $("#vong-chinh");
  vong.style.transition = "none";
  vong.style.strokeDasharray = `0 ${chuVi}`;
  sauKhiVe(() => {
    vong.style.transition = GIAM_CHUYEN_DONG ? "none" : "stroke-dasharray 1.3s cubic-bezier(.2,.8,.2,1)";
    vong.style.strokeDasharray = `${tiLe * chuVi} ${chuVi}`;
  });
}

// Ấn vàng "đủ điều kiện" – chữ chạy vòng quanh
function anChungNhan(bac) {
  return `
    <svg class="an-chung-nhan" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="grad-an" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FCEBC0"/><stop offset=".45" stop-color="#E5BD6A"/><stop offset="1" stop-color="#B8893A"/>
        </linearGradient>
        <path id="duong-an" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#grad-an)"/>
      <circle cx="60" cy="60" r="54" fill="none" stroke="#FFF4D8" stroke-width=".8" stroke-dasharray="1.5 2.2"/>
      <g class="an-xoay">
        <text font-family="Montserrat, Arial, sans-serif" font-size="7.6" font-weight="800" fill="#0A1F44">
          <textPath href="#duong-an" textLength="279" lengthAdjust="spacing">ĐỦ ĐIỀU KIỆN CHỨNG NHẬN • TITAN ENGLISH •</textPath>
        </text>
      </g>
      <circle cx="60" cy="60" r="34" fill="#0A1F44" stroke="#F2D49B" stroke-width="1.5"/>
      <text x="60" y="51" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="6.5" font-weight="700" letter-spacing="1.6" fill="#F2D49B">BẬC</text>
      <text x="60" y="76" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="25" font-weight="800" fill="#FFFFFF">${bac}</text>
    </svg>`;
}

function khoiChungNhan(kq, bac, kyNangYeu) {
  const moc = CAU_HINH.MOC_CHUNG_NHAN;
  const hop = $("#kq-chung-nhan");
  if (kq.tong >= moc) {
    hop.className = "kq-chung-nhan cn-dat";
    hop.innerHTML = `
      ${anChungNhan(bac)}
      <p class="cn-kicker">Xin chúc mừng</p>
      <p class="cn-tieu-de">Bạn được xem xét cấp Giấy chứng nhận bậc <span class="cn-bac-lon">${bac}</span> từ <span class="nw">TITAN English</span></p>
      <p class="cn-than">Vượt mốc ${moc} điểm là dấu ấn đáng tự hào trên hành trình chinh phục tiếng Anh. Giấy chứng nhận giúp bạn hoàn thiện tiêu chí <b class="nw">“Hội nhập tốt”</b>, phục vụ xét danh hiệu <b class="nw">“Sinh viên 5 Tốt”</b>. Vui lòng theo dõi thông báo từ Ban Tổ chức về thủ tục nhận giấy.</p>`;
    return;
  }
  const conThieu = moc - kq.tong;
  const kicker = conThieu <= 50 ? "Chỉ còn một bước chân" : conThieu <= 150 ? "Mốc 550 đã ở rất gần" : "Khởi đầu của một hành trình";
  const loi = conThieu <= 50
    ? "Chỉ vài câu đúng nữa thôi là bạn đã chạm mốc – hãy giữ vững nhịp ôn luyện."
    : conThieu <= 150
      ? `Dồn sức cho <b>${kyNangYeu}</b> là con đường ngắn nhất để rút ngắn khoảng cách.`
      : `Mỗi bước tiến đều có giá trị. Hãy bắt đầu từ <b>${kyNangYeu}</b> và duy trì nhịp luyện tập đều đặn mỗi ngày.`;
  hop.className = "kq-chung-nhan cn-chua";
  hop.innerHTML = `
    <div class="cn-dau">
      <div class="cn-icon">${icon("i-ten-lua")}</div>
      <div>
        <p class="cn-kicker">${kicker}</p>
        <p class="cn-tieu-de">Còn <span class="nw">${conThieu} điểm</span> nữa để chạm mốc ${moc}</p>
      </div>
    </div>
    <p class="cn-than">${loi} Khi đạt từ <span class="nw">${moc} điểm</span>, bạn sẽ được xem xét cấp Giấy chứng nhận bậc B1 trở lên từ <span class="nw">TITAN English</span>.</p>
    <div class="cn-tien-do">
      <div class="cn-thanh" role="img" aria-label="Đã đạt ${Math.round((kq.tong / moc) * 100)}% chặng đường đến mốc ${moc} điểm"><span></span></div>
      <div class="cn-thanh-nhan"><span>Bạn: ${kq.tong}</span><span>Mốc: ${moc}</span></div>
    </div>`;
  sauKhiVe(() => { $(".cn-thanh span", hop).style.width = Math.min(100, (kq.tong / moc) * 100) + "%"; });
}

function veThangBac(tong) {
  const ranh = [0, 120, 225, 550, 785, 945, DIEM_TOI_DA];
  const ten = ["Dưới A1", "A1", "A2", "B1", "B2", "C1"];
  const viTri = (d) => (d / DIEM_TOI_DA) * 100;
  let doan = "", moc = "";
  for (let i = 0; i < ten.length; i++) {
    doan += `<span class="tb-doan" data-bac="${i}" style="width:${viTri(ranh[i + 1] - ranh[i])}%"></span>`;
    if (i > 0) {
      const lop = (ranh[i] === CAU_HINH.MOC_CHUNG_NHAN ? " moc-550" : "") + (i === ten.length - 1 ? " cuoi" : "");
      moc += `<span class="tb-moc${lop}" style="left:${viTri(ranh[i])}%"><b>${ten[i]}</b>${ranh[i]}</span>`;
    }
  }
  const p = viTri(Math.min(Math.max(tong, 0), DIEM_TOI_DA));
  const lopGhim = p < 9 ? " sat-trai" : p > 91 ? " sat-phai" : "";
  $("#thang-bac").innerHTML = `
    <span class="tb-ghim${lopGhim}" style="left:${GIAM_CHUYEN_DONG ? p : 0}%"><span class="tb-ghim-chu">Bạn: <b>${tong}</b> · ${bacTheoDiem(tong)}</span></span>
    <div class="tb-ray" role="img" aria-label="Thang bậc tham khảo: ${tong} điểm thuộc bậc ${bacTheoDiem(tong)}">${doan}</div>
    ${moc}`;
  if (!GIAM_CHUYEN_DONG) sauKhiVe(() => { $(".tb-ghim").style.left = p + "%"; });
}

function theKyNang(loai, diem, cau, nhan) {
  const laNghe = loai === "nghe";
  const nhanHtml = {
    manh: `<span class="kn-the-nhan nhan-manh">${icon("i-sao")}Thế mạnh</span>`,
    yeu: `<span class="kn-the-nhan nhan-yeu">${icon("i-muc-tieu")}Tiềm năng bứt phá</span>`,
    bang: `<span class="kn-the-nhan nhan-can-bang">Hài hòa</span>`,
  }[nhan];
  const tiLe = Math.round((diem / DIEM_KY_NANG) * 100);
  return `
    <div class="kn-dau">
      <span class="kn-icon">${icon(laNghe ? "i-tai-nghe" : "i-sach")}</span>
      <div><p class="kn-ten">${laNghe ? "LISTENING" : "READING"}</p><p class="kn-phan">${laNghe ? "Nghe hiểu · Part 1–4" : "Đọc hiểu · Part 5–7"}</p></div>
      ${nhanHtml}
    </div>
    <p class="kn-diem"><span class="kn-diem-so">${diem}</span><span class="kn-diem-tren">/ ${DIEM_KY_NANG}</span></p>
    <div class="kn-thanh" role="img" aria-label="${laNghe ? "Listening" : "Reading"} đạt ${tiLe}% điểm tối đa"><span data-rong="${Math.min(100, tiLe)}"></span></div>
    <p class="kn-chi-tiet">
      ${cau !== null ? `<span>Số câu đúng: <b>${cau}</b>/100</span>` : ""}
      <span><b>${tiLe}%</b> thang điểm</span>
    </p>`;
}

function nhanXet(kq) {
  const chenh = Math.abs(kq.nghe - kq.doc);
  const manh = kq.nghe >= kq.doc ? "Listening" : "Reading";
  const yeu = kq.nghe >= kq.doc ? "Reading" : "Listening";
  const goiY = yeu === "Reading"
    ? "củng cố ngữ pháp, mở rộng từ vựng theo chủ đề và rèn kỹ năng đọc lướt Part 5–7"
    : "nghe đều đặn mỗi ngày, luyện chép chính tả và làm quen nhiều giọng đọc ở Part 1–4";
  if (chenh === 0) return "Hai kỹ năng đang ở thế <b>cân bằng hoàn hảo</b> – nâng đều cả hai sẽ giúp tổng điểm <span class=\"nw\">tiến xa hơn nữa</span>.";
  if (chenh <= 20) return `Hai kỹ năng khá <b>hài hòa</b>, ${manh} nhỉnh hơn ${chenh} điểm. Hãy duy trì nhịp luyện đều và dành thêm thời gian cho <b>${yeu}</b>: ${goiY}.`;
  return `<b>${manh}</b> đang là điểm tựa vững vàng của bạn, cao hơn ${yeu} <span class="nw">${chenh} điểm</span>. Đầu tư thêm cho <b>${yeu}</b> – ${goiY} – sẽ giúp tổng điểm <span class="nw">bứt phá rõ rệt</span>.`;
}

const LOI_TITAN_MAC_DINH = $("#titan-loi") ? $("#titan-loi").innerHTML : "";

function hienKetQua(kq, email) {
  const bac = bacTheoDiem(kq.tong);
  const nhanNghe = kq.nghe === kq.doc ? "bang" : kq.nghe > kq.doc ? "manh" : "yeu";
  const nhanDoc = kq.nghe === kq.doc ? "bang" : kq.doc > kq.nghe ? "manh" : "yeu";
  const kyNangYeu = kq.nghe >= kq.doc ? "Reading" : "Listening";
  const moc = CAU_HINH.MOC_CHUNG_NHAN;

  $("#kq-ten").textContent = kq.hoTen;
  $("#kq-msv").textContent = kq.msv;
  $("#kq-email").textContent = cheEmail(email);
  $("#kq-tong-sr").textContent = `Tổng điểm ${kq.tong} trên ${DIEM_TOI_DA}, bậc tham khảo ${bac}.`;
  const huyHieu = $("#kq-bac");
  huyHieu.classList.toggle("duoi", bac === "Dưới A1");
  huyHieu.innerHTML = bac === "Dưới A1" ? "Dưới<br>A1" : `<span><small>BẬC</small>${bac}</span>`;

  khoiChungNhan(kq, bac, kyNangYeu);
  veThangBac(kq.tong);
  $("#kn-nghe").innerHTML = theKyNang("nghe", kq.nghe, kq.ngheCau, nhanNghe);
  $("#kn-doc").innerHTML = theKyNang("doc", kq.doc, kq.docCau, nhanDoc);
  $("#kq-nhan-xet").innerHTML = nhanXet(kq);
  $("#titan-loi").innerHTML = kq.tong >= moc
    ? (bac === "C1"
      ? "Bậc <b>C1</b> – một kết quả thật ấn tượng! TITAN English sẵn sàng đồng hành để bạn hiện thực hóa chứng chỉ TOEIC/IELTS chính thức với số điểm mong muốn."
      : `Chạm bậc <b>${bac}</b> là một khởi đầu đẹp. Cùng TITAN English giữ vững phong độ và hướng tới những bậc cao hơn với lộ trình được thiết kế riêng cho bạn.`)
    : `Chỉ còn <b class="nw">${moc - kq.tong} điểm</b> đến mốc ${moc}. TITAN English sẽ cùng bạn xây dựng lộ trình tập trung vào <b>${kyNangYeu}</b> để rút ngắn khoảng cách một cách hiệu quả.`;
  $("#kq-ngay").textContent = new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

  const vung = $("#ket-qua");
  $$("[data-kq]", vung).forEach((el, i) => el.style.setProperty("--tre", 0.18 + i * 0.09 + "s"));
  vung.classList.remove("da-hien");
  $("#kq-tong-so").textContent = "0";
  chuyenMan(() => {
    document.body.classList.replace("che-do-tra-cuu", "che-do-ket-qua");
    $("#man-tra-cuu").hidden = true;
    vung.hidden = false;
    window.scrollTo({ top: 0, behavior: "auto" });
  });
  if (!history.state || !history.state.ketQua) history.pushState({ ketQua: true }, "", "#ket-qua");
  $("#kq-tieu-de").focus({ preventScroll: true });

  const tre = GIAM_CHUYEN_DONG ? 0 : 520;
  setTimeout(() => {
    vung.classList.add("da-hien");
    demSo($("#kq-tong-so"), kq.tong);
    veVongDiem(kq.tong);
    sauKhiVe(() => { $$(".kn-thanh span").forEach((s) => { s.style.width = s.dataset.rong + "%"; }); });
  }, tre);
  if (kq.tong >= moc) setTimeout(banPhaoGiay, GIAM_CHUYEN_DONG ? 0 : 1500);
}

function veTrangDau() {
  chuyenMan(() => {
    $("#ket-qua").hidden = true;
    $("#man-tra-cuu").hidden = false;
    document.body.classList.replace("che-do-ket-qua", "che-do-tra-cuu");
    window.scrollTo({ top: 0, behavior: "auto" });
  });
  $("#titan-loi").innerHTML = LOI_TITAN_MAC_DINH;
  $("#msv").value = ""; $("#email").value = ""; $("#xac-nhan").value = "";
  xoaThongBao();
  taoMaXacNhan();
  tiepTucVideo();
  $("#msv").focus({ preventScroll: true });
}

function khoiTaoKetQua() {
  $("#nut-in").addEventListener("click", () => window.print());
  $("#nut-tra-lai").addEventListener("click", () => {
    if (history.state && history.state.ketQua) history.back();
    else veTrangDau();
  });
  window.addEventListener("popstate", () => { if (!$("#ket-qua").hidden) veTrangDau(); });
  if (location.hash === "#ket-qua") history.replaceState(null, "", location.pathname + location.search);
}

/* ---------------------------------------------------------
   8. Pháo giấy + pháo dây chúc mừng (tắt khi giảm chuyển động)
   Mô phỏng theo thời gian thực (không phụ thuộc tốc độ khung hình) nên mượt trên mọi máy.
   --------------------------------------------------------- */
function banPhaoGiay() {
  if (GIAM_CHUYEN_DONG) return;
  const cv = $("#phao-giay");
  const ctx = cv.getContext("2d");
  const tl = Math.min(window.devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight;
  cv.width = W * tl; cv.height = H * tl;
  ctx.setTransform(tl, 0, 0, tl, 0, 0);
  const mau = ["#F7931E", "#FFB347", "#E5BD6A", "#F2D49B", "#1FB5F2", "#7FD3F7", "#E35A16", "#FFFFFF", "#2B5A93"];
  const nho = W < 600;
  const ngauNhien = (a, b) => a + Math.random() * (b - a);
  const hat = [], day = [];

  // Hai "khẩu pháo" ở hai góc dưới bắn chéo lên giữa màn hình
  function ban(soHat, soDay, tre) {
    for (const ben of [-1, 1]) {
      const gocX = ben < 0 ? W * 0.04 : W * 0.96, gocY = H * 0.98;
      for (let i = 0; i < soHat; i++) {
        const goc = (ben < 0 ? -Math.PI / 2 + 0.35 : -Math.PI / 2 - 0.35) + ngauNhien(-0.32, 0.32);
        const tocDo = ngauNhien(0.9, 1.6) * H * (nho ? 1.25 : 1.05);
        hat.push({ tre, x: gocX, y: gocY, vx: Math.cos(goc) * tocDo, vy: Math.sin(goc) * tocDo,
          w: ngauNhien(6, 11), h: ngauNhien(9, 16), xoay: ngauNhien(0, 6.28), vXoay: ngauNhien(-9, 9),
          lat: ngauNhien(0, 6.28), vLat: ngauNhien(6, 14), lac: ngauNhien(0, 6.28), c: mau[(Math.random() * mau.length) | 0],
          tron: Math.random() < 0.18 });
      }
      for (let i = 0; i < soDay; i++) {
        const goc = (ben < 0 ? -Math.PI / 2 + 0.3 : -Math.PI / 2 - 0.3) + ngauNhien(-0.28, 0.28);
        const tocDo = ngauNhien(1.0, 1.5) * H * (nho ? 1.2 : 1.0);
        day.push({ tre, x: gocX, y: gocY, vx: Math.cos(goc) * tocDo, vy: Math.sin(goc) * tocDo, vet: [],
          pha: ngauNhien(0, 6.28), tan: ngauNhien(9, 15), bien: ngauNhien(9, 16), day: ngauNhien(2.6, 3.8), dai: ngauNhien(70, 120),
          c: mau[(Math.random() * mau.length) | 0] });
      }
    }
  }
  ban(nho ? 90 : 160, nho ? 7 : 11, 0);
  ban(nho ? 55 : 100, nho ? 4 : 7, 0.35);

  const TONG = 5.2, MO_DAN = 1.4;
  let truoc = performance.now(), batDau = truoc;
  const ve = (t) => {
    const dt = Math.min(0.033, (t - truoc) / 1000); truoc = t;
    const troi = (t - batDau) / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = troi > TONG - MO_DAN ? Math.max(0, (TONG - troi) / MO_DAN) : 1;

    for (const p of hat) {
      if (troi < p.tre) continue;
      // lực cản không khí lớn → hạt bay chậm dần rồi lả lướt rơi xuống
      p.vx *= Math.pow(0.32, dt); p.vy *= Math.pow(0.32, dt);
      p.vy += H * 0.55 * dt;
      p.lac += dt * 3;
      p.x += (p.vx + Math.sin(p.lac) * 28) * dt; p.y += p.vy * dt;
      p.xoay += p.vXoay * dt; p.lat += p.vLat * dt;
      if (p.y > H + 30) continue;
      const lat = Math.cos(p.lat);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.xoay); ctx.scale(1, lat);
      ctx.fillStyle = p.c;
      // mặt sau tối hơn một chút khi giấy lật → cảm giác 3D
      if (p.tron) { ctx.beginPath(); ctx.arc(0, 0, p.w * 0.45, 0, 6.283); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      if (lat < 0 && !p.tron) { ctx.fillStyle = "rgba(10, 20, 40, .22)"; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
      ctx.restore();
    }

    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const d of day) {
      if (troi < d.tre) continue;
      d.vx *= Math.pow(0.22, dt); d.vy *= Math.pow(0.22, dt);
      d.vy += H * 0.26 * dt;
      d.pha += d.tan * dt;
      d.x += d.vx * dt; d.y += d.vy * dt;
      // dây uốn lượn sang hai bên quanh đường bay
      const lech = Math.sin(d.pha) * d.bien;
      d.vet.unshift({ x: d.x + lech, y: d.y });
      // cắt đuôi theo chiều dài thật để dây luôn ngắn, xoăn như dây kim tuyến
      let dai = 0;
      for (let i = 1; i < d.vet.length; i++) {
        dai += Math.hypot(d.vet[i].x - d.vet[i - 1].x, d.vet[i].y - d.vet[i - 1].y);
        if (dai > d.dai) { d.vet.length = i + 1; break; }
      }
      if (d.vet.length > 60) d.vet.length = 60;
      if (d.vet.length < 3 || d.y > H + 200) continue;
      ctx.strokeStyle = d.c; ctx.lineWidth = d.day;
      ctx.beginPath(); ctx.moveTo(d.vet[0].x, d.vet[0].y);
      for (let i = 1; i < d.vet.length - 1; i++) {
        const a = d.vet[i], b = d.vet[i + 1];
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      ctx.stroke();
    }

    if (troi < TONG) requestAnimationFrame(ve);
    else { ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); }
  };
  requestAnimationFrame(ve);
}

/* ---------------------------------------------------------
   9. Nền video YouTube (nạp sau khi trang hiển thị)
   --------------------------------------------------------- */
const video = { bat: false, player: null, dangNap: false, dangChay: false };

function datNutVideo() {
  const nut = $("#nut-video");
  nut.setAttribute("aria-pressed", String(video.bat));
  $(".nut-video-chu", nut).textContent = video.bat ? "Tắt video nền" : "Bật video nền";
  nut.setAttribute("aria-label", video.bat ? "Tắt video nền" : "Bật video nền");
  $("use", nut).setAttribute("href", video.bat ? "#i-video" : "#i-video-tat");
}

function napAnhNen(id) {
  const nen = $("#nen-anh");
  const thu = (chatLuong, duPhong) => {
    const anh = new Image();
    anh.onload = () => {
      if (anh.naturalWidth < 200 && duPhong) return thu(duPhong, null); // YouTube trả ảnh xám 120px khi không có maxres
      nen.style.backgroundImage = `url("${anh.src}")`;
      nen.classList.add("da-tai");
    };
    anh.onerror = () => { if (duPhong) thu(duPhong, null); };
    anh.src = `https://img.youtube.com/vi/${id}/${chatLuong}.jpg`;
  };
  thu("maxresdefault", "hqdefault");
}

function napVideo() {
  if (video.player) { try { video.player.playVideo(); } catch (e) { /* bỏ qua */ } return; }
  if (video.dangNap) return;
  video.dangNap = true;
  const id = CAU_HINH.YOUTUBE_ID;
  const taoPlayer = () => {
    const playerVars = {
      autoplay: 1, mute: 1, loop: 1, playlist: id, controls: 0, playsinline: 1, rel: 0,
      modestbranding: 1, start: CAU_HINH.YOUTUBE_START || 0, disablekb: 1, fs: 0, iv_load_policy: 3,
    };
    if (location.protocol.startsWith("http")) playerVars.origin = location.origin;
    video.player = new YT.Player("yt-player", {
      videoId: id, playerVars,
      events: {
        onReady: (e) => {
          const khung = e.target.getIframe();
          khung.setAttribute("tabindex", "-1");
          khung.setAttribute("aria-hidden", "true");
          khung.setAttribute("title", "Video nền giới thiệu Trung tâm Anh ngữ TITAN");
          e.target.mute();
          if (video.bat && document.visibilityState === "visible") e.target.playVideo();
        },
        onStateChange: (e) => {
          const lop = $("#nen-video");
          if (e.data === YT.PlayerState.PLAYING) { video.dangChay = true; if (video.bat) lop.classList.add("dang-chay"); }
          else if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(CAU_HINH.YOUTUBE_START || 0); e.target.playVideo(); }
          else if (e.data === YT.PlayerState.PAUSED) { lop.classList.remove("dang-chay"); }
        },
        onError: () => { $("#nen-video").classList.remove("dang-chay"); }, // bị chặn nhúng/mất mạng → giữ ảnh tĩnh
      },
    });
  };
  if (window.YT && window.YT.Player) return taoPlayer();
  const cu = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { if (cu) cu(); taoPlayer(); };
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  s.async = true;
  s.onerror = () => { video.dangNap = false; }; // bị chặn → vẫn dùng ảnh tĩnh
  document.head.appendChild(s);
}

function tamDungVideo() {
  $("#nen-video").classList.remove("dang-chay");
  if (video.player && video.player.pauseVideo) { try { video.player.pauseVideo(); } catch (e) { /* bỏ qua */ } }
}
function tiepTucVideo() { if (video.bat) napVideo(); }

async function nenTuDongPhat() {
  if (docLuu("ea-video-nen") === "tat") return false;
  if (GIAM_CHUYEN_DONG) return false;
  const kn = navigator.connection;
  if (kn && (kn.saveData || /(^|-)2g$/.test(kn.effectiveType || ""))) return false;
  if (navigator.getBattery) {
    try { const pin = await navigator.getBattery(); if (!pin.charging && pin.level < 0.2) return false; } catch (e) { /* bỏ qua */ }
  }
  return true;
}

async function khoiTaoVideo() {
  const id = CAU_HINH.YOUTUBE_ID;
  if (!id) return;
  napAnhNen(id);
  const nut = $("#nut-video");
  nut.hidden = false;
  video.bat = await nenTuDongPhat();
  datNutVideo();
  nut.addEventListener("click", () => {
    video.bat = !video.bat;
    ghiLuu("ea-video-nen", video.bat ? "bat" : "tat");
    datNutVideo();
    if (video.bat) { napVideo(); if (video.dangChay) $("#nen-video").classList.add("dang-chay"); }
    else tamDungVideo();
  });
  document.addEventListener("visibilitychange", () => {
    if (!video.player || !video.player.pauseVideo) return;
    if (document.visibilityState === "hidden") video.player.pauseVideo();
    else if (video.bat) video.player.playVideo();
  });
  if (!video.bat) return;
  // Nạp video khi trình duyệt rảnh, sau khi trang đã hiển thị → không làm chậm form
  const hen = () => (window.requestIdleCallback ? requestIdleCallback(napVideo, { timeout: 3000 }) : setTimeout(napVideo, 1200));
  if (document.readyState === "complete") hen();
  else window.addEventListener("load", hen, { once: true });
}

/* ---------------------------------------------------------
   Khởi động
   --------------------------------------------------------- */
khoiTaoLogo();
khoiTaoLienKet();
khoiTaoCaptcha();
khoiTaoForm();
khoiTaoKetQua();
khoiTaoHeader();
khoiTaoVideoGioiThieu();
khoiTaoCuon();
khoiTaoDenRoi();
khoiTaoVideo();
moManDau();
