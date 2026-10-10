(function () {
  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');

  // Show pause button
  var show_pause = false;
  var css = getComputedStyle(document.documentElement);
  var colors = [1, 2, 3, 4, 5, 6].map(function (i) { return css.getPropertyValue('--band-' + i).trim(); });

  var layers = [
    { base: 0.24, amp: 0.055, w: [[0.9, 0.22, 0.4, 0.55], [1.7, -0.31, 2.1, 0.30], [2.9, 0.17, 4.0, 0.15]] },
    { base: 0.42, amp: 0.070, w: [[1.1, -0.28, 1.0, 0.50], [2.3, 0.36, 3.3, 0.32], [3.7, -0.20, 5.2, 0.18]] },
    { base: 0.58, amp: 0.060, w: [[1.3, 0.34, 2.6, 0.50], [2.6, -0.25, 0.7, 0.32], [4.1, 0.29, 3.9, 0.18]] },
    { base: 0.75, amp: 0.075, w: [[0.8, -0.38, 4.4, 0.52], [1.9, 0.27, 1.5, 0.30], [3.3, -0.33, 2.8, 0.18]] },
    { base: 0.87, amp: 0.045, w: [[1.0, 0.26, 5.5, 0.55], [2.1, -0.40, 0.2, 0.30], [3.5, 0.22, 3.1, 0.15]] }
  ];

  var W = 0, H = 0, dpr = 1;
  var paused = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = 0, last = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function edge(layer, x) {

    var span = Math.max(W, 900);
    var u = x / span;
    var s = 0;
    for (var i = 0; i < layer.w.length; i++) {
      var p = layer.w[i];
      s += p[3] * Math.sin(u * p[0] * Math.PI * 2 + t * p[1] + p[2]);
    }
    return layer.base * H + s * layer.amp * H;
  }

  function draw() {
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, W, H);
    var step = 8;
    for (var i = 0; i < layers.length; i++) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W + step; x += step) ctx.lineTo(x, edge(layers[i], x));
      ctx.lineTo(W + step, H);
      ctx.closePath();
      ctx.fillStyle = colors[i + 1];
      ctx.fill();
    }
  }

  function frame(now) {
    if (!paused) {
      if (last) t += Math.min((now - last) / 1000, 0.1);
      draw();
    }
    last = now;
    requestAnimationFrame(frame);
  }

  var btn = null;
  function setPaused(p) {
    paused = p;
    if (btn) btn.textContent = p ? 'Play' : 'Pause';
  }
  if (show_pause) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Pause';
    btn.style.cssText = 'position:fixed;left:16px;bottom:16px;padding:8px 14px;border:0;border-radius:999px;' +
      'background:rgba(255,255,255,0.85);color:#4a2f63;font:500 13px system-ui,sans-serif;cursor:pointer';
    btn.addEventListener('click', function () { setPaused(!paused); });
    document.body.appendChild(btn);
  }
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space') { e.preventDefault(); setPaused(!paused); }
  });

  window.addEventListener('resize', resize);
  resize();
  if (reduce) { setPaused(true); } else { requestAnimationFrame(frame); }
})();