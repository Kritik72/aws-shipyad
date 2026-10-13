(function () {
  var S = window.Shipyard;
  var esc = S.esc;
  var filter = document.getElementById('env-filter');
  var refreshBtn = document.getElementById('refresh');
  var updated = document.getElementById('updated');

  function renderInstance(info) {
    var items = [
      ['Pod', info.hostname],
      ['Environment', info.environment],
      ['Version', info.version],
      ['Node.js', info.node],
      ['Uptime', S.duration(info.uptimeSeconds)]
    ];
    document.getElementById('instance').innerHTML = items.map(function (i) {
      return '<div><dt>' + esc(i[0]) + '</dt><dd>' + esc(i[1]) + '</dd></div>';
    }).join('');
  }

  function renderEnvironments(list) {
    document.getElementById('env-rows').innerHTML = list.map(function (e) {
      return '<tr>' +
        '<td><span class="dot dot-' + esc(e.name) + '" aria-hidden="true"></span>' + esc(e.label) +
          (e.current ? '<span class="this-pod">(this instance)</span>' : '') + '</td>' +
        '<td>' + esc(e.version) + '</td>' +
        '<td><span class="status status-ok">' + esc(e.status) + '</span></td>' +
        '<td>' + esc(e.replicas.ready) + '/' + esc(e.replicas.desired) + '</td>' +
        '<td><code>' + esc(e.namespace) + '</code></td>' +
        '<td>' + esc(S.timeAgo(e.lastDeployedAt)) + '</td>' +
      '</tr>';
    }).join('');
  }

  function renderDeployments(list) {
    var body = document.getElementById('deploy-rows');
    if (!list.length) {
      body.innerHTML = '<tr><td colspan="8" class="muted">No deployments for this environment yet.</td></tr>';
      return;
    }
    body.innerHTML = list.map(function (d) {
      var cls = 'result result-' + d.status.replace(/\s+/g, '-');
      return '<tr>' +
        '<td>' + esc(d.id) + '</td>' +
        '<td>' + esc(d.version) + '</td>' +
        '<td><span class="dot dot-' + esc(d.env) + '" aria-hidden="true"></span>' + esc(d.env) + '</td>' +
        '<td><span class="' + esc(cls) + '">' + esc(d.status) + '</span></td>' +
        '<td class="commit">' + esc(d.commit) + '</td>' +
        '<td>' + esc(d.author) + '</td>' +
        '<td>' + esc(S.duration(d.durationSec)) + '</td>' +
        '<td>' + esc(S.timeAgo(d.startedAt)) + '</td>' +
      '</tr>';
    }).join('');
  }

  function load() {
    refreshBtn.disabled = true;
    var env = filter.value;
    var deployUrl = '/api/deployments' + (env ? '?env=' + encodeURIComponent(env) : '');

    Promise.all([S.getJSON('/api/info'), S.getJSON('/api/environments'), S.getJSON(deployUrl)])
      .then(function (r) {
        renderInstance(r[0]);
        renderEnvironments(r[1].data);
        renderDeployments(r[2].data);
        updated.textContent = 'Updated ' + new Date().toLocaleTimeString();
      })
      .catch(function (err) {
        updated.textContent = 'Could not load data: ' + err.message + '. Check that the server is running, then select Refresh.';
      })
      .finally(function () { refreshBtn.disabled = false; });
  }

  refreshBtn.addEventListener('click', load);
  filter.addEventListener('change', load);
  load();
  setInterval(load, 30000);
})();
