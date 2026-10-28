/*
 * nav.js - lapisan interaksi FindMyCareer
 * Dipasang di semua halaman lewat <script src="nav.js" defer></script>.
 *
 * Isi:
 *  1. Scale-to-fit   : desain Figma 1728px otomatis menyesuaikan lebar layar
 *  2. Routing        : semua tombol/menu/footer/kartu diarahkan ke halaman yang benar
 *  3. Fitur halaman  : pilih minat, kuis (timer + skor), hasil, pembayaran, upload CV, dll.
 *  4. Util           : toast, modal, penangkap klik untuk elemen dekoratif yang menimpa tombol
 */
(function () {
  'use strict';

  var file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html') || 'index.html';
  var isPrem = /^(Prem|Payment)/.test(file);
  var beforeProfile = /^(LandingPageSignUp|MyProfile)/.test(file);
  var HOME = file === 'index.html' ? 'index.html'
           : beforeProfile ? 'LandingPageSignUp.html'
           : 'LandingComplete.html';

  /* ---------- util ---------- */
  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} return null; }

  // Satu pintu navigasi. Bisa di-override (mis. untuk tes otomatis) lewat window.FMC.navigate.
  window.FMC = window.FMC || {};
  function go(url) {
    if (typeof window.FMC.navigate === 'function') return window.FMC.navigate(url);
    location.href = /^(mailto:|https?:)/.test(url) ? url : encodeURI(url);
  }
  function open(url) { window.open(url, '_blank', 'noopener'); }

  function toast(msg, ok) {
    var t = document.getElementById('nav-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'nav-toast';
      t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);' +
        'color:#fff;padding:12px 20px;border-radius:10px;max-width:90vw;text-align:center;' +
        'font:500 14px/1.4 sans-serif;z-index:99999;opacity:0;transition:opacity .2s;pointer-events:none;zoom:1';
      document.body.appendChild(t);
    }
    t.style.background = ok ? '#0b7a4b' : '#202430';
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.style.opacity = '0'; }, 2400);
  }
  window.FMC.toast = toast;

  function modal(html, onMount) {
    var o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;background:rgba(20,24,40,.55);z-index:99998;display:flex;align-items:center;justify-content:center;padding:16px;zoom:1';
    var b = document.createElement('div');
    b.style.cssText = 'background:#fff;border-radius:16px;padding:28px;width:min(440px,100%);font:500 15px/1.5 sans-serif;color:#202430;box-shadow:0 20px 60px rgba(0,0,0,.25)';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-modal', 'true');
    b.innerHTML = html;
    o.appendChild(b);
    document.body.appendChild(o);
    function close() { o.remove(); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', esc);
    o.addEventListener('mousedown', function (e) { if (e.target === o) close(); });
    if (onMount) onMount(b, close);
    return close;
  }
  var BTN = 'border:0;border-radius:10px;padding:11px 20px;font:600 15px sans-serif;cursor:pointer;';
  var FIELD = 'width:100%;box-sizing:border-box;border:1px solid #d6ddeb;border-radius:10px;padding:11px 12px;font:500 15px sans-serif;margin:6px 0 14px;';

  /* ---------- 1. scale-to-fit ---------- */
  // Halaman dengan posisi absolut penuh (hasil export Figma) punya lebar desain tetap.
  // Halaman lain sudah fluid, jadi hanya diperkecil bila isinya melebihi lebar layar.
  var FIXED_DESIGN = { 'Question.html': 1728, 'Result.html': 1440 };

  function fitToScreen() {
    var root = document.body.firstElementChild;
    while (root && root.tagName === 'SCRIPT') root = root.nextElementSibling;
    if (!root) return;
    var vw = document.documentElement.clientWidth;
    var design = FIXED_DESIGN[file];
    var s = 1;
    if (design) {
      root.style.width = design + 'px';
      s = vw / design;
    } else {
      root.style.zoom = ''; root.style.transform = '';
      var content = root.scrollWidth;
      if (content > vw + 1) s = vw / content;
    }
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.margin = '0';
    if ('zoom' in document.documentElement.style) {
      root.style.zoom = s === 1 && !design ? '' : s;
    } else {
      root.style.transformOrigin = '0 0';
      root.style.transform = 'scale(' + s + ')';
      document.body.style.height = (root.offsetHeight * s) + 'px';
    }
  }

  /* ---------- 2. routing ---------- */
  var MAIL = 'mailto:support@findmycareer.com';
  var TEXT_ROUTES = {
    // menu utama
    'home': HOME,
    'find jobs': 'FindJobOneSite.html',
    'skill & career tests': 'SkillTest.html',
    'take career test': 'SkillTest.html',
    'mentoring': 'Mentoring.html',
    'forum communities': 'ForumComunity.html',
    'complete profile': 'MyProfile.html',
    'my profile': 'MyProfile.html',
    'profile': 'MyProfile.html',
    'profile details': 'MyProfile.html',
    // CTA
    'mentoring info': 'Mentoring.html',
    'interview prep': 'Mentoring.html',
    'apply for jobs': 'FindJobOneSite.html',
    'get matched with jobs': 'FindJobOneSite.html',
    'show all jobs': 'FindJobOneSite.html',
    'show all mentoring': 'Mentoring.html',
    'join mentoring now': 'Mentoring.html',
    'upgrade premium to join mentoring': 'Payment.html',
    'join mentoring for ((harga))': 'Mentoring.html',
    // sub-menu mentoring
    'interview mentoring': isPrem ? 'PremInterview.html' : 'MentoringInterview.html',
    'cv mentoring': isPrem ? 'PremCV.html' : 'CVMentoring.html',
    'soft skill bootcamp': isPrem ? 'PremBootcamp.html' : 'Bootcamp.html',
    'consultation': isPrem ? 'PremConsultation.html' : 'Consultation.html',
    'premium plan': 'Payment.html',
    // akun
    'login': 'SignIn.html',
    'join for free': 'Register.html',
    'submit': 'MyProfileSaved.html',
    'continue with google': 'LandingPageSignUp.html',
    'continue with apple': 'LandingPageSignUp.html',
    'sign in with google': 'LandingPageSignUp.html',
    'sign in with apple': 'LandingPageSignUp.html',
    // footer
    'career test': 'SkillTest.html',
    'mentorship': 'Mentoring.html',
    'job listing': 'FindJobOneSite.html',
    'about us': HOME,
    'career growth': 'Mentoring.html',
    'popular': 'ForumComunity.html',
    'resume tips': isPrem ? 'PremCV.html' : 'CVMentoring.html',
    'contact us': MAIL,
    'support@findmycareer.com': MAIL
  };
  var FILTER_ROUTES = { 'remote': 'FindJobRemote.html', 'hybrid': 'FindJobHybrid.html', 'on-site': 'FindJobOneSite.html' };
  var CLASS_ROUTES = [['.job-list', 'Recuritment.html']];
  var CONTAINER_SEL = '[class*="button"],[class*="btn"],[class*="link-button"],[class*="primary"],[class*="choose-plan"]';
  var INTERACTIVE = 'input,textarea,select,button,label';

  function bind(target, action) {
    if (target.getAttribute('data-nav')) return;
    target.setAttribute('data-nav', '1');
    target.style.cursor = 'pointer';
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '0');
    target.setAttribute('role', 'link');
    target._navAction = action;
    target.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a && target.contains(a)) return;
      action(e);
    });
    target.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(e); }
    });
  }

  function wrapperFor(el) {
    var c = el.closest(CONTAINER_SEL);
    if (c && c.querySelectorAll('a, [data-nav]').length <= 1) return c;
    return el;
  }

  function leafMatches(root) {
    var out = [];
    root.querySelectorAll('div, span').forEach(function (el) {
      if (el.closest('a')) return;
      var t = norm(el.textContent);
      if (!t || t.length > 40) return;
      for (var i = 0; i < el.children.length; i++) {
        if (norm(el.children[i].textContent) === t) return;
      }
      out.push([el, t]);
    });
    return out;
  }

  // Elemen dekoratif hasil export Figma sering menimpa tombol: cari tombol di bawah titik klik
  function underPoint(x, y) {
    if (!document.elementsFromPoint) return null;
    var stack = document.elementsFromPoint(x, y);
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      var nav = el.closest('[data-nav]');
      if (nav && nav._navAction) return { run: nav._navAction };
      var a = el.closest('a[href]');
      if (a) return { run: function (h) { return function () { go(h); }; }(a.getAttribute('href')) };
      if (el.matches(INTERACTIVE)) return { focus: el };
    }
    return null;
  }

  function installClickThrough() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest || t.closest('[data-nav]') || t.closest('a[href]') || t.closest(INTERACTIVE) || t.closest('[role=dialog]')) return;
      var hit = underPoint(e.clientX, e.clientY);
      if (!hit) return;
      e.preventDefault();
      if (hit.run) hit.run(e); else hit.focus.focus();
    }, true);
    var ticking = false;
    document.addEventListener('mousemove', function (e) {
      if (ticking) return;
      ticking = true;
      var x = e.clientX, y = e.clientY;
      requestAnimationFrame(function () {
        ticking = false;
        document.documentElement.style.cursor = underPoint(x, y) ? 'pointer' : '';
      });
    });
  }

  /* ---------- 3. aksi khusus per teks tombol ---------- */
  function special(t, el) {
    switch (t) {
      case 'start test':
        return function () {
          var n = (JSON.parse(store('fmc_interests') || '[]')).length;
          if (file === 'SelectInterest.html' && !n) return toast('Pilih minimal satu minat dulu ya.');
          go('Question.html');
        };
      case 'apply now':
      case 'apply job':
        if (file === 'Recuritment.html') return function () {
          if (el._applied) return toast('Kamu sudah melamar posisi ini.');
          el._applied = true;
          toast('Lamaran berhasil dikirim!', true);
          if (t === 'apply now') el.textContent = 'Applied ✓';
        };
        return function () { go('FindJobOneSite.html'); };
      case 'upload cv':
        return function () {
          var inp = document.createElement('input');
          inp.type = 'file'; inp.accept = '.pdf,.doc,.docx';
          inp.onchange = function () { if (inp.files[0]) toast('CV dipilih: ' + inp.files[0].name, true); };
          inp.click();
        };
      case 'create post':
        return function () {
          modal('<h3 style="margin:0 0 12px;font:700 20px sans-serif">Create Post</h3>' +
            '<input id="cp-t" placeholder="Judul" style="' + FIELD + '">' +
            '<textarea id="cp-b" rows="4" placeholder="Apa yang ingin kamu diskusikan?" style="' + FIELD + 'resize:vertical"></textarea>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end"><button id="cp-x" style="' + BTN + 'background:#eef0f6">Batal</button>' +
            '<button id="cp-ok" style="' + BTN + 'background:#0077b6;color:#fff">Posting</button></div>', function (b, close) {
            b.querySelector('#cp-x').onclick = close;
            b.querySelector('#cp-ok').onclick = function () {
              if (!b.querySelector('#cp-t').value.trim() || !b.querySelector('#cp-b').value.trim()) return toast('Judul dan isi post wajib diisi.');
              close(); toast('Post terkirim ke forum!', true);
            };
          });
        };
      case 'add link':
        return function () { toast('Tempel link profilmu di kolom yang tersedia, lalu klik Submit.'); };
      case 'filters':
        return function () { toast('Gunakan tab Remote / Hybrid / On-site untuk memfilter lowongan.'); };
      case 'show all interests':
        return function () { toast('Semua minat sudah ditampilkan.'); };
      case 'terms and conditions.':
        return function () { toast('Syarat & Ketentuan FindMyCareer: gunakan platform ini dengan jujur dan sesuai hukum yang berlaku.'); };
      case 'language':
      case 'english':
        return function () { toast('Saat ini bahasa yang tersedia: English.'); };
      case 'view more':
      case 'book mentor':
        return function () { toast('Fitur ini belum tersedia di versi demo.'); };
      case 'choose a mentor':
      case 'book a mentor':
        return function () { toast('Pilih mentor dari daftar di bawah.'); };
    }
    return null;
  }

  /* ---------- 4. fitur per halaman ---------- */
  function initInterests() {
    var cards = document.querySelectorAll('.select-interests [class*="job-category"]');
    if (!cards.length) return;
    var style = document.createElement('style');
    style.textContent =
      '[class*="job-category"]{transition:background .15s,border-color .15s}' +
      '[class*="job-category"].is-selected{background:#0077b6!important;border-color:#0077b6!important}' +
      '[class*="job-category"].is-selected,[class*="job-category"].is-selected *{color:#fff!important}';
    document.head.appendChild(style);
    var chosen = [];
    try { chosen = JSON.parse(store('fmc_interests') || '[]'); } catch (e) {}
    function save() {
      var names = [];
      cards.forEach(function (c) {
        if (c.classList.contains('is-selected')) names.push(norm(c.querySelector('.category-name > div').textContent));
      });
      store('fmc_interests', JSON.stringify(names));
    }
    cards.forEach(function (c) {
      var name = norm(c.querySelector('.category-name > div').textContent);
      if (chosen.indexOf(name) !== -1) c.classList.add('is-selected');
      bind(c, function () {
        c.classList.toggle('is-selected');
        c.setAttribute('aria-pressed', c.classList.contains('is-selected'));
        save();
      });
      c.setAttribute('role', 'button');
    });
  }

  var QUIZ = [
    { q: 'Refer to the code snippet below. What will be the output of this JavaScript function?',
      code: ['<k>function</k> getUser() {', '  <k>let</k> name;', '  <k>return</k> name;', '}', '', 'console.log(getUser());'],
      a: ['A. Undefined', 'B. An error message', 'C. The expected value'], c: 0 },
    { q: 'What will the following JavaScript code print to the console?',
      code: ['console.log(<k>typeof</k> <s>null</s>);'],
      a: ['A. "null"', 'B. "object"', 'C. "undefined"'], c: 1 },
    { q: 'What is the result of this comparison in JavaScript?',
      code: ['console.log(<n>0.1</n> + <n>0.2</n> === <n>0.3</n>);'],
      a: ['A. true', 'B. false', 'C. An error message'], c: 1 }
  ];
  var QUIZ_SECONDS = 20;

  function initQuiz() {
    var root = document.querySelector('.question-1');
    if (!root) return;
    var answers = [root.querySelector('.right-answ'), root.querySelector('.bad-answ'), root.querySelector('.bad-answ2')];
    var labels = [root.querySelector('.correct-answer'), root.querySelector('.incorrect-answer'), root.querySelector('.incorrect-answer2')];
    var title = root.querySelector('[class^="refer-to"]');
    var cont = root.querySelector('.btn-inactive');
    var contTxt = root.querySelector('.continue');
    var secEl = root.querySelector('.sec');
    var ring = root.querySelector('.countdown');
    var old = document.querySelector('.illustration');
    var box = document.createElement('pre');
    box.className = 'code-box';
    if (old) old.replaceWith(box); else root.appendChild(box);
    var info = document.createElement('div');
    info.className = 'q-progress';
    root.appendChild(info);

    var css = document.createElement('style');
    css.textContent =
      '.code-box{position:absolute;left:110px;top:213px;width:710px;height:376px;margin:0;box-sizing:border-box;padding:28px 32px;border-radius:12px;background:#0f172a;color:#e2e8f0;font:500 24px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;overflow:auto;white-space:pre}' +
      '.code-box k{color:#c792ea}.code-box s{color:#c3e88d}.code-box n{color:#f78c6c}' +
      '.q-progress{position:absolute;left:86px;top:36px;font:700 18px "DmSans-Bold",sans-serif;color:#7a7799;letter-spacing:.04em}' +
      '.question-1 .countdown>div{display:none}' +
      '.question-1 .countdown{border-radius:50%}' +
      '.question-1 .countdown::after{content:"";position:absolute;inset:12px;border-radius:50%;background:#fff}' +
      '.question-1 .countdown-number{z-index:2}' +
      '.question-1 .correct-answer,.question-1 .incorrect-answer,.question-1 .incorrect-answer2{width:auto!important;right:auto!important;white-space:nowrap}' +
      '.illustration{display:none!important}' +
      '.right-answ,.bad-answ,.bad-answ2{cursor:pointer;transition:transform .1s}' +
      '.right-answ:hover,.bad-answ:hover,.bad-answ2:hover{transform:translateY(-2px)}' +
      '.is-locked{cursor:default!important;pointer-events:none}' +
      '.ans-sel .rectangle-7{border-color:#0077b6!important}' +
      '.ans-ok .rectangle-7{border-color:#16a34a!important;background:#dcfce7!important}' +
      '.ans-ok .rectangle-8{background:#16a34a!important}' +
      '.ans-bad .rectangle-7{border-color:#dc2626!important;background:#fee2e2!important}' +
      '.ans-bad .rectangle-8{background:#dc2626!important}' +
      '.btn-active{background:#0077b6!important;cursor:pointer}.btn-inactive{cursor:not-allowed}.btn-active{cursor:pointer}';
    document.head.appendChild(css);

    var idx = 0, score = 0, left = QUIZ_SECONDS, timer = null, locked = false, picked = -1, order = [];

    function paintRing() {
      var pct = Math.max(0, left / QUIZ_SECONDS) * 100;
      ring.style.background = 'conic-gradient(#ffd707 ' + pct + '%, #f3f2f9 0)';
      secEl.textContent = left;
    }
    function render() {
      var Q = QUIZ[idx];
      locked = false; picked = -1; left = QUIZ_SECONDS;
      // acak urutan jawaban supaya posisi jawaban benar tidak selalu sama
      order = [0, 1, 2].sort(function () { return Math.random() - .5; });
      title.textContent = Q.q;
      box.innerHTML = Q.code.join('\n');
      info.textContent = 'QUESTION ' + (idx + 1) + ' / ' + QUIZ.length;
      answers.forEach(function (el, i) {
        el.className = el.className.replace(/\b(ans-\w+|is-locked)\b/g, '').trim();
        el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
        labels[i].textContent = Q.a[order[i]].replace(/^[A-C]\.\s*/, String.fromCharCode(65 + i) + '. ');
        el.onclick = function () { choose(i); };
        el.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(i); } };
      });
      cont.classList.remove('btn-active');
      contTxt.textContent = idx === QUIZ.length - 1 ? 'Finish' : 'Continue';
      paintRing();
      clearInterval(timer);
      timer = setInterval(function () {
        left--; paintRing();
        if (left <= 0) { clearInterval(timer); lock(-1); }
      }, 1000);
    }
    function correctPos() { return order.indexOf(QUIZ[idx].c); }
    function lock(sel) {
      if (locked) return;
      locked = true; picked = sel; clearInterval(timer);
      var cp = correctPos();
      answers.forEach(function (el, i) {
        el.classList.add('is-locked');
        if (i === cp) el.classList.add('ans-ok');
        else if (i === sel) el.classList.add('ans-bad');
      });
      if (sel === cp) score++;
      else toast(sel === -1 ? 'Waktu habis! Jawaban benar sudah ditandai.' : 'Jawaban kurang tepat. Jawaban benar ditandai hijau.');
      cont.classList.add('btn-active');
    }
    function choose(i) { if (!locked) lock(i); }
    function next() {
      if (!locked) return toast('Pilih salah satu jawaban dulu ya.');
      if (idx < QUIZ.length - 1) { idx++; render(); }
      else { store('fmc_score', score); store('fmc_total', QUIZ.length); go('Result.html'); }
    }
    cont.setAttribute('role', 'button'); cont.setAttribute('tabindex', '0');
    cont.onclick = next;
    cont.onkeydown = function (e) { if (e.key === 'Enter') next(); };
    document.addEventListener('keydown', function (e) {
      if (e.key === '1' || e.key === '2' || e.key === '3') choose(+e.key - 1);
      else if (e.key === 'Enter' && e.target === document.body) next();
    });
    render();
  }

  function initResult() {
    var wrap = document.querySelector('.result-screen');
    if (!wrap) return;
    var nums = wrap.querySelectorAll('._3');
    var s = parseInt(store('fmc_score'), 10), t = parseInt(store('fmc_total'), 10);
    if (isNaN(s) || isNaN(t)) { s = 0; t = QUIZ.length; }
    if (nums.length >= 2) { nums[0].textContent = s; nums[1].textContent = '/ ' + t; }
    var h = wrap.querySelector('.congratulation2');
    if (h) h.textContent = s === t ? 'Congratulation!' : s >= Math.ceil(t / 2) ? 'Good job!' : 'Keep practicing!';
  }

  function initPayment() {
    if (file !== 'Payment.html') return;
    var plans = document.querySelectorAll('.choose-plan');
    if (plans.length < 2) return;
    var prem = plans[1];
    prem.removeAttribute('data-nav');
    bind(prem, function () {
      modal('<h3 style="margin:0 0 4px;font:700 20px sans-serif">Premium Plan</h3>' +
        '<p style="margin:0 0 16px;color:#576675">Rp70.000 / bulan</p>' +
        '<label style="font-weight:600">Metode pembayaran</label>' +
        '<select id="pm" style="' + FIELD + '"><option>Transfer Bank</option><option>E-Wallet</option><option>Kartu Kredit/Debit</option></select>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end"><button id="pay-x" style="' + BTN + 'background:#eef0f6">Batal</button>' +
        '<button id="pay-ok" style="' + BTN + 'background:#0077b6;color:#fff">Bayar Rp70.000</button></div>', function (b, close) {
        b.querySelector('#pay-x').onclick = close;
        b.querySelector('#pay-ok').onclick = function () {
          close(); toast('Pembayaran berhasil! Selamat datang di Premium.', true);
          setTimeout(function () { go('PremInterview.html'); }, 1400);
        };
      });
    });
  }

  function initMisc() {
    // logo -> home
    document.querySelectorAll('img[class^="logoo"]').forEach(function (img) { bind(img, function () { go(HOME); }); });
    // sosial media & store
    var social = { '.facebook': 'https://facebook.com', '.twetter': 'https://twitter.com', '.linkedin': 'https://linkedin.com', '.instagram': 'https://instagram.com' };
    Object.keys(social).forEach(function (sel) {
      document.querySelectorAll('.social-media ' + sel).forEach(function (el) { bind(el, function () { open(social[sel]); }); });
    });
    document.querySelectorAll('.app-store-google-play img').forEach(function (img) {
      var u = /google/i.test(img.getAttribute('src')) ? 'https://play.google.com' : 'https://apps.apple.com';
      bind(img, function () { open(u); });
    });
    // mailto lewat link biasa
    if (file === 'SelectInterest.html') {
      var hero = document.querySelector('.hero .link-button3');
      var target = document.querySelector('.select-interests');
      if (hero && target) bind(hero, function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
  }

  function init() {
    fitToScreen();
    window.addEventListener('resize', fitToScreen);
    initInterests();
    initQuiz();
    initResult();
    initMisc();

    CLASS_ROUTES.forEach(function (r) {
      document.querySelectorAll(r[0]).forEach(function (el) { bind(el, function () { go(r[1]); }); });
    });

    // Choose Plan: kiri = gratis, kanan = premium
    document.querySelectorAll('.choose-plan').forEach(function (el, i) {
      bind(el, function () { go(i === 0 ? 'MentoringInterview.html' : 'Payment.html'); });
    });
    initPayment();

    leafMatches(document.body).forEach(function (pair) {
      var el = pair[0], t = pair[1];
      if (el.closest('[data-nav]') || el.closest('.question-1') || el.closest('.result-screen')) return;
      var sp = special(t, el);
      if (sp) { bind(wrapperFor(el), sp); return; }
      if (FILTER_ROUTES[t] && /(^|\s)(primary\d*|button\d*)(\s|$)/.test(el.className)) {
        bind(wrapperFor(el), function () { go(FILTER_ROUTES[t]); });
        return;
      }
      if (TEXT_ROUTES[t]) bind(wrapperFor(el), function () { go(TEXT_ROUTES[t]); });
    });

    // Link asli: perluas area klik ke seluruh tombol
    document.querySelectorAll('a[href]').forEach(function (a) {
      var c = a.closest(CONTAINER_SEL);
      if (!c || c === a || c.getAttribute('data-nav')) return;
      if (c.querySelectorAll('a').length !== 1) return;
      var href = a.getAttribute('href');
      bind(c, function () { go(href); });
    });

    installClickThrough();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
