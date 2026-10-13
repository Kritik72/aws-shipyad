(function () {
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var sendBtn = document.getElementById('send');
  var fields = ['name', 'email', 'topic', 'message'];

  function clearErrors() {
    fields.forEach(function (f) {
      document.getElementById(f + '-error').textContent = '';
      document.getElementById(f).removeAttribute('aria-invalid');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    var payload = {};
    fields.forEach(function (f) { payload[f] = document.getElementById(f).value; });

    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending';

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (body) { return { res: res, body: body }; }); })
      .then(function (r) {
        if (r.res.status === 201) {
          form.reset();
          statusEl.textContent = 'Message sent. Reference ' + r.body.id + '.';
          statusEl.classList.add('ok');
          return;
        }
        var errs = r.body.fields || {};
        var first = null;
        Object.keys(errs).forEach(function (f) {
          var input = document.getElementById(f);
          if (!input) return;
          input.setAttribute('aria-invalid', 'true');
          document.getElementById(f + '-error').textContent = errs[f];
          if (!first) first = input;
        });
        statusEl.textContent = 'Message not sent. Fix the highlighted fields and try again.';
        statusEl.classList.add('err');
        if (first) first.focus();
      })
      .catch(function () {
        statusEl.textContent = 'Message not sent. The server could not be reached.';
        statusEl.classList.add('err');
      })
      .finally(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send message';
      });
  });
})();
