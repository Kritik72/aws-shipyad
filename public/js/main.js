// Shared helpers and mobile navigation.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  window.Shipyard = {
    esc: function (value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    timeAgo: function (iso) {
      var sec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
      if (sec < 60) return 'just now';
      var min = Math.round(sec / 60);
      if (min < 60) return min + ' min ago';
      var hr = Math.round(min / 60);
      if (hr < 24) return hr + (hr === 1 ? ' hour ago' : ' hours ago');
      var d = Math.round(hr / 24);
      return d + (d === 1 ? ' day ago' : ' days ago');
    },
    duration: function (sec) {
      var m = Math.floor(sec / 60);
      var s = sec % 60;
      return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
    },
    getJSON: function (url) {
      return fetch(url, { headers: { Accept: 'application/json' } }).then(function (res) {
        if (!res.ok) throw new Error(url + ' returned ' + res.status);
        return res.json();
      });
    }
  };
})();
