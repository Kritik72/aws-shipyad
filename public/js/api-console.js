(function () {
  var out = document.getElementById('console-output');
  var reqLabel = document.getElementById('console-request');
  var statusEl = document.getElementById('console-status');

  document.querySelectorAll('[data-try]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-try');
      var started = performance.now();
      reqLabel.textContent = 'GET ' + url;
      statusEl.textContent = 'Running';
      statusEl.className = '';
      out.textContent = '';

      fetch(url)
        .then(function (res) {
          var ms = Math.round(performance.now() - started);
          statusEl.textContent = res.status + ' ' + res.statusText + ', ' + ms + ' ms';
          statusEl.className = res.ok ? 'ok' : 'err';
          var type = res.headers.get('content-type') || '';
          return type.indexOf('application/json') !== -1
            ? res.json().then(function (j) { return JSON.stringify(j, null, 2); })
            : res.text();
        })
        .then(function (text) { out.textContent = text; })
        .catch(function (err) {
          statusEl.textContent = 'Request failed';
          statusEl.className = 'err';
          out.textContent = err.message;
        });
    });
  });
})();
