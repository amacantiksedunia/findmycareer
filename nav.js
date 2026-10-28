/*
 * nav.js
 * Menghidupkan menu dan tombol yang di export Figma cuma berupa <div>.
 * Dipasang di semua halaman lewat <script src="nav.js" defer></script>.
 * Rute diatur di objek TEXT_ROUTES dan CLASS_ROUTES di bawah.
 */
(function () {
  var file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  if (file === '') file = 'index.html';

  var isPrem = /^(Prem|Payment)/.test(file);
  var beforeProfile = /^(LandingPageSignUp|MyProfile)/.test(file);

  var HOME = file === 'index.html' ? 'index.html'
           : beforeProfile ? 'LandingPageSignUp.html'
           : 'LandingComplete.html';

  // Rute berdasarkan teks tombol (huruf kecil)
  var TEXT_ROUTES = {
    'home': HOME,
    'find jobs': 'FindJobOneSite.html',
    'skill & career tests': 'SkillTest.html',
    'take career test': 'SkillTest.html',
    'mentoring': 'Mentoring.html',
    'mentoring info': 'Mentoring.html',
    'interview prep': 'Mentoring.html',
    'forum communities': 'ForumComunity.html',
    'apply for jobs': 'FindJobOneSite.html',
    'get matched with jobs': 'FindJobOneSite.html',
    'join mentoring now': 'Mentoring.html',
    'upgrade premium to join mentoring': 'Mentoring.html',
    'join mentoring for ((harga))': 'Mentoring.html',
    'interview mentoring': isPrem ? 'PremInterview.html' : 'MentoringInterview.html',
    'cv mentoring': isPrem ? 'PremCV.html' : 'CVMentoring.html',
    'soft skill bootcamp': isPrem ? 'PremBootcamp.html' : 'Bootcamp.html',
    'consultation': isPrem ? 'PremConsultation.html' : 'Consultation.html',
    'premium plan': 'Payment.html',
    'login': 'SignIn.html',
    'join for free': 'Register.html',
    'my profile': 'MyProfile.html',
    'profile': 'MyProfile.html',
    'profile details': 'MyProfile.html',
    'submit': 'MyProfileSaved.html',
    'continue with google': 'LandingPageSignUp.html',
    'continue with apple': 'LandingPageSignUp.html',
    'sign in with google': 'LandingPageSignUp.html',
    'sign in with apple': 'LandingPageSignUp.html'
  };

  // Teks yang hanya jadi tombol bila class-nya cocok (biar label biasa tidak ikut)
  var FILTER_ROUTES = {
    'remote': 'FindJobRemote.html',
    'hybrid': 'FindJobHybrid.html',
    'on-site': 'FindJobOneSite.html'
  };

  // Tombol yang belum punya halaman tujuan, tampil pesan singkat
  var DEMO_ONLY = ['apply now', 'apply job', 'book mentor', 'view more'];

  // Rute berdasarkan class (kartu)
  var CLASS_ROUTES = [
    ['.job-list', 'Recuritment.html'],
    ['.job-category', 'Selected.html']
  ];

  var CONTAINER_SEL = '[class*="button"],[class*="btn"],[class*="link-button"],[class*="primary"],[class*="choose-plan"]';

  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }

  function go(url) { location.href = encodeURI(url); }

  function toast(msg) {
    var t = document.getElementById('nav-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'nav-toast';
      t.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);' +
        'background:#202430;color:#fff;padding:12px 20px;border-radius:10px;' +
        'font:500 14px/1.4 sans-serif;z-index:99999;opacity:0;transition:opacity .2s;pointer-events:none';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.style.opacity = '0'; }, 2200);
  }

  function bind(target, action) {
    if (target.getAttribute('data-nav')) return;
    target.setAttribute('data-nav', '1');
    target.style.cursor = 'pointer';
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '0');
    target.setAttribute('role', 'link');
    target._navAction = action;
    target.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a && target.contains(a)) return; // biarkan link asli bekerja
      action();
    });
    target.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') action();
    });
  }

  // Cari wadah tombol supaya seluruh area tombol bisa diklik, bukan cuma teksnya
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
        if (norm(el.children[i].textContent) === t) return; // ambil elemen terdalam
      }
      out.push([el, t]);
    });
    return out;
  }


  // Elemen dekoratif hasil export Figma sering menimpa tombol sehingga klik tidak sampai.
  // Solusinya: saat klik jatuh di elemen penimpa, cari tombol atau link yang ada di bawah titik itu.
  var INTERACTIVE = 'input,textarea,select,button,label';

  function underPoint(x, y) {
    var stack = document.elementsFromPoint(x, y);
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      var nav = el.closest('[data-nav]');
      if (nav && nav._navAction) return { run: nav._navAction };
      var a = el.closest('a[href]');
      if (a) return { run: function (h) { return function () { location.href = h; }; }(a.getAttribute('href')) };
      if (el.matches(INTERACTIVE)) return { focus: el };
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || t.closest('[data-nav]') || t.closest('a[href]') || t.closest(INTERACTIVE)) return;
    var hit = underPoint(e.clientX, e.clientY);
    if (!hit) return;
    e.preventDefault();
    if (hit.run) hit.run(); else hit.focus.focus();
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

  function init() {
    // 1. Kartu dan wadah besar
    CLASS_ROUTES.forEach(function (r) {
      document.querySelectorAll(r[0]).forEach(function (el) {
        bind(el, function () { go(r[1]); });
      });
    });

    // 2. Tombol Choose Plan: pertama = free, kedua = premium
    var plans = document.querySelectorAll('.choose-plan');
    plans.forEach(function (el, i) {
      var url = i === 0 ? 'PremInterview.html' : 'Payment.html';
      bind(el, function () { go(url); });
    });

    // 3. Teks tombol
    leafMatches(document.body).forEach(function (pair) {
      var el = pair[0], t = pair[1];
      if (el.closest('[data-nav]')) return;

      if (FILTER_ROUTES[t] && /(^|\s)(primary\d*|button\d*)(\s|$)/.test(el.className)) {
        var u = FILTER_ROUTES[t];
        bind(wrapperFor(el), function () { go(u); });
        return;
      }
      if (t === 'apply job' && file !== 'Recuritment.html') {
        bind(wrapperFor(el), function () { go('FindJobOneSite.html'); });
        return;
      }
      if (TEXT_ROUTES[t]) {
        var url = TEXT_ROUTES[t];
        if (url === file) url = file; // tetap di halaman yang sama
        bind(wrapperFor(el), function () { go(url); });
        return;
      }
      if (DEMO_ONLY.indexOf(t) !== -1) {
        bind(wrapperFor(el), function () { toast('Fitur ini belum tersedia di versi demo.'); });
      }
    });

    // 4. Link yang sudah ada: perluas area klik ke seluruh tombol
    document.querySelectorAll('a[href]').forEach(function (a) {
      var c = a.closest(CONTAINER_SEL);
      if (!c || c === a || c.getAttribute('data-nav')) return;
      if (c.querySelectorAll('a').length !== 1) return;
      var href = a.getAttribute('href');
      bind(c, function () { location.href = href; });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
