(() => {
  // Constants / config
  const DEFAULT_CONFIG = {
    size: {
      width: 760,
      height: 310
    },
    timing: {
      completionHoldSeconds: 4
    },
    tuning: {
      initialGap: 108
    },
    road: {
      laneWidth: 108,
      scrollScale: 13,
      draftedScrollEase: 0.88
    },
    player: {
      y: 252,
      baselineSpeed: 30.6,
      maxEffort: 100,
      effortStep: 28,
      lateralSpeed: 220,
      effortSpeedGain: 0.22
    },
    group: {
      speed: 33.1,
      y: 108,
      riders: [
        { x: -38, y: -8 },
        { x: 0, y: 0 },
        { x: 38, y: 10 },
        { x: -14, y: 32 }
      ]
    },
    drag: {
      exposedPenalty: 2.55,
      draftedPenalty: 0.18,
      draftBenefit: 2.1
    },
    draftZone: {
      width: 174,
      depth: 242,
      strongDistance: 108
    },
    flow: {
      particleCount: 70,
      baseDensity: 1.18,
      draftedDensity: 0.18
    },
    effort: {
      initial: 38,
      min: 8
    },
    graph: {
      maxSeconds: 28,
      sampleStep: 0.2
    },
    endCondition: {
      holdDuration: 4
    },
    sprite: {
      src: "/images/cyclist.png"
    }
  };

  const TEMPLATE = `
    <section
      class="slipstream-figure"
      tabindex="0"
      aria-label="Bridge to the Slipstream micro-simulation"
    >
      <div class="figure-shell">
        <div class="figure-head">
          <div class="figure-title">
            <h2>Bridge to the Slipstream</h2>
            <p class="lede">Increase speed while lowering effort.</p>
          </div>
          <button data-role="startButton" class="button" type="button">Start</button>
        </div>

        <div class="figure-stage-wrap">
          <div class="chart-panel">
            <div class="graph-header">
              <span class="label">Effort spent</span>
              <strong data-role="graphHint" class="graph-hint">Rises when exposed</strong>
            </div>
            <canvas id="graphCanvas" data-role="graphCanvas" width="140" height="80" aria-hidden="true"></canvas>
          </div>

          <div class="figure-stage">
            <canvas id="simCanvas" data-role="simCanvas" width="760" height="310" aria-hidden="true"></canvas>
            <div data-role="overlayMessage" class="overlay-message" aria-live="polite" hidden></div>
          </div>

          <div class="effort-panel">
            <div class="effort-header">
              <span class="control-label">Effort</span>
              <strong data-role="effortValue" class="effort-value">38%</strong>
            </div>
            <span class="label effort-scale-high">Max</span>
            <div class="effort-fader-wrap">
              <input data-role="effortSlider" type="range" class="effort-fader" min="0" max="100" value="38" step="1">
            </div>
            <span class="label effort-scale-low">Min</span>
          </div>

          <div class="control-strip">
            <label class="control-group control-group-position">
              <span class="control-label">Position</span>
              <input data-role="positionSlider" type="range" min="-100" max="100" value="0" step="1">
            </label>
          </div>
        </div>
      </div>
    </section>
  `;

  function mountSlipstreamFigure(container, configOverrides = {}) {
    const config = mergeConfig(DEFAULT_CONFIG, configOverrides);
    container.innerHTML = TEMPLATE;

    const elements = {
      figure: container.querySelector(".slipstream-figure"),
      startButton: container.querySelector('[data-role="startButton"]'),
      effortSlider: container.querySelector('[data-role="effortSlider"]'),
      positionSlider: container.querySelector('[data-role="positionSlider"]'),
      effortValue: container.querySelector('[data-role="effortValue"]'),
      graphHint: container.querySelector('[data-role="graphHint"]'),
      overlayMessage: container.querySelector('[data-role="overlayMessage"]'),
      simCanvas: container.querySelector('[data-role="simCanvas"]'),
      graphCanvas: container.querySelector('[data-role="graphCanvas"]')
    };

    const simCtx = elements.simCanvas.getContext("2d");
    const graphCtx = elements.graphCanvas.getContext("2d");

    elements.simCanvas.width = config.size.width;
    elements.simCanvas.height = config.size.height;

    // Sprite loading
    const riderImg = new Image();
    let spriteReady = false;
    riderImg.onload = () => {
      spriteReady = true;
      if (!state.running) renderSimulation();
    };
    riderImg.src = config.sprite.src;

    // Simulation state
    const input = {
      left: false,
      right: false,
      up: false,
      down: false
    };

    const state = {
      running: false,
      finished: false,
      elapsed: 0,
      lastTime: 0,
      roadOffset: 0,
      speed: config.player.baselineSpeed,
      effort: config.effort.initial,
      cumulativeEffort: 0,
      draftLevel: 0,
      draftLabel: "Exposed",
      draftHoldTime: 0,
      gap: config.tuning.initialGap,
      playerX: 8,
      graphSamples: [],
      particles: [],
      finishFade: 0,
      draftPulse: 0,
      firstDraftTime: null
    };

    function resetState() {
      state.running = false;
      state.finished = false;
      state.elapsed = 0;
      state.lastTime = 0;
      state.roadOffset = 0;
      state.speed = config.player.baselineSpeed;
      state.effort = config.effort.initial;
      state.cumulativeEffort = 0;
      state.draftLevel = 0;
      state.draftLabel = "Exposed";
      state.draftHoldTime = 0;
      state.gap = config.tuning.initialGap;
      state.playerX = 8;
      state.finishFade = 0;
      state.draftPulse = 0;
      state.firstDraftTime = null;
      state.graphSamples = [{ t: 0, value: 0 }];
      elements.effortSlider.value = String(config.effort.initial);
      elements.positionSlider.value = String(Math.round((state.playerX / config.road.laneWidth) * 100));
      initParticles();
      updateHud();
      setOverlay("");
    }

    function initParticles() {
      state.particles = Array.from({ length: config.flow.particleCount }, () => ({
        x: Math.random() * config.size.width,
        y: Math.random() * config.size.height,
        length: 16 + Math.random() * 18,
        speedFactor: 0.7 + Math.random() * 1.3,
        alpha: 0.15 + Math.random() * 0.3
      }));
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    // Mount / start / restart logic
    function startSimulation() {
      resetState();
      state.running = true;
      elements.figure.focus();
      elements.startButton.textContent = "Restart";
      setOverlay("");
      requestAnimationFrame(frame);
    }

    function finishSimulation() {
      state.running = false;
      state.finished = true;
      state.finishFade = 1;
      setOverlay("Slipstream found");
    }

    function setOverlay(title, detail = "") {
      if (!title) {
        elements.overlayMessage.hidden = true;
        elements.overlayMessage.innerHTML = "";
        return;
      }
      const detailMarkup = detail ? `<span>${detail}</span>` : '<span hidden></span>';
      elements.overlayMessage.hidden = false;
      elements.overlayMessage.innerHTML = `<strong>${title}</strong>${detailMarkup}`;
    }

    // Input handling
    function handleKeyChange(event, pressed) {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"].includes(key)) {
        event.preventDefault();
      }
      if (key === "arrowleft" || key === "a") input.left = pressed;
      if (key === "arrowright" || key === "d") input.right = pressed;
      if (key === "arrowup" || key === "w") input.up = pressed;
      if (key === "arrowdown" || key === "s") input.down = pressed;
    }

    // Physics update
    function update(dt) {
      if (!state.running) return;

      state.elapsed += dt;

      const effortDelta = (input.up ? 1 : 0) - (input.down ? 1 : 0);
      if (effortDelta !== 0) {
        state.effort = clamp(
          state.effort + effortDelta * config.player.effortStep * dt,
          config.effort.min,
          config.player.maxEffort
        );
        elements.effortSlider.value = String(Math.round(state.effort));
      }

      const moveDelta = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      state.playerX = clamp(
        state.playerX + moveDelta * config.player.lateralSpeed * dt,
        -config.road.laneWidth,
        config.road.laneWidth
      );
      elements.positionSlider.value = String(Math.round((state.playerX / config.road.laneWidth) * 100));

      const draft = getDraftLevel();
      const previousDraftLevel = state.draftLevel;
      state.draftLevel = draft;
      state.draftLabel = draft >= 0.72 ? "Strong Draft" : draft >= 0.28 ? "Partial Draft" : "Exposed";

      if (draft >= 0.72 && previousDraftLevel < 0.72) {
        state.draftPulse = 1;
        if (state.firstDraftTime === null) {
          state.firstDraftTime = state.elapsed;
        }
      }

      const dragPenalty = lerp(config.drag.exposedPenalty, config.drag.draftedPenalty, draft);
      const effortSpeedGain = (state.effort - config.effort.initial) * config.player.effortSpeedGain;
      const targetSpeed = config.player.baselineSpeed + effortSpeedGain - dragPenalty + draft * config.drag.draftBenefit;
      const smoothing = lerp(2.4, 4.1, draft);
      state.speed += (targetSpeed - state.speed) * Math.min(1, dt * smoothing);

      state.gap += (config.group.speed - state.speed) * dt * 7;
      state.gap = clamp(state.gap, 28, 240);

      const effortCost = (0.24 + state.effort / 70) * lerp(1.24, 0.48, draft);
      state.cumulativeEffort += effortCost * dt;
      sampleGraph();

      if (draft >= 0.72 && state.gap <= config.draftZone.strongDistance + 12) {
        state.draftHoldTime += dt;
      } else {
        state.draftHoldTime = Math.max(0, state.draftHoldTime - dt * 0.6);
      }

      const roadMotion = state.speed * config.road.scrollScale * lerp(1, config.road.draftedScrollEase, draft);
      state.roadOffset = (state.roadOffset + roadMotion * dt) % 80;
      state.draftPulse = Math.max(0, state.draftPulse - dt * 1.6);
      updateParticles(dt, draft);
      updateHud();

      if (state.draftHoldTime >= config.timing.completionHoldSeconds) {
        finishSimulation();
      }
    }

    function sampleGraph() {
      const lastSample = state.graphSamples[state.graphSamples.length - 1];
      if (!lastSample || state.elapsed - lastSample.t >= config.graph.sampleStep) {
        state.graphSamples.push({
          t: state.elapsed,
          value: state.cumulativeEffort
        });
      }
    }

    function getDraftLevel() {
      const lateralDistance = Math.abs(state.playerX);
      const depthFactor = 1 - clamp((state.gap - 18) / config.draftZone.depth, 0, 1);
      const widthFactor = 1 - clamp(lateralDistance / config.draftZone.width, 0, 1);
      const riderPocket = clamp(1 - Math.abs(state.playerX + 12) / 72, 0, 1) * 0.18;
      return clamp(depthFactor * widthFactor + riderPocket, 0, 1);
    }

    function updateParticles(dt, draft) {
      const intensity = lerp(config.flow.baseDensity, config.flow.draftedDensity, draft);
      const speed = state.speed * 8.2 * intensity;
      const sway = lerp(8.5, 2.2, draft);

      for (const particle of state.particles) {
        particle.y += speed * particle.speedFactor * dt;
        particle.x += Math.sin((particle.y + state.elapsed * 12) * 0.015) * dt * sway;
        if (particle.y > config.size.height + 10) {
          particle.y = -particle.length;
          particle.x = Math.random() * config.size.width;
        }
      }
    }

    // HUD / graph rendering
    function updateHud() {
      elements.effortValue.textContent = `${Math.round(state.effort)}%`;
      elements.graphHint.textContent = state.draftLevel >= 0.7 ? "Flattens in draft" : "Rises when exposed";
    }

    function frame(timestamp) {
      if (!state.running && !state.finished) return;

      if (!state.lastTime) state.lastTime = timestamp;
      const dt = Math.min(0.033, (timestamp - state.lastTime) / 1000);
      state.lastTime = timestamp;

      if (state.running) {
        update(dt);
      } else if (state.finished) {
        state.finishFade = Math.max(0, state.finishFade - dt * 0.18);
      }

      renderSimulation();
      renderGraph();

      if (state.running) {
        requestAnimationFrame(frame);
      }
    }

    // Rendering
    function renderSimulation() {
      const { width, height } = config.size;
      simCtx.clearRect(0, 0, width, height);

      drawBackdrop();
      drawWind();
      drawRoad();
      drawDraftWake();
      drawGroup();
      drawPlayer();
      drawStageLabel();
      if (!state.running && !state.finished) drawIdlePrompt();
    }

    function drawIdlePrompt() {
      const cx = config.size.width / 2;
      const text = "Increase effort to catch the group, then ease off in the draft.";
      const pillH = 28, pillR = 8;
      simCtx.font = '13px "Helvetica Neue", Arial, sans-serif';
      const textW = simCtx.measureText(text).width;
      const pillW = textW + 28;
      const pillX = cx - pillW / 2;
      const pillY = Math.round(config.size.height * 0.57) - Math.round(pillH / 2);

      simCtx.fillStyle = "rgba(255, 251, 245, 0.88)";
      fillRoundRect(simCtx, pillX, pillY, pillW, pillH, pillR);
      simCtx.fillStyle = "#4a5558";
      simCtx.textBaseline = "middle";
      simCtx.textAlign = "center";
      simCtx.fillText(text, cx, pillY + pillH / 2);
      simCtx.textBaseline = "alphabetic";
      simCtx.textAlign = "left";
    }

    function drawBackdrop() {
      const gradient = simCtx.createLinearGradient(0, 0, 0, config.size.height);
      gradient.addColorStop(0, "#ddd5c8");
      gradient.addColorStop(1, "#c7bbaa");
      simCtx.fillStyle = gradient;
      simCtx.fillRect(0, 0, config.size.width, config.size.height);

      simCtx.fillStyle = "rgba(248, 244, 238, 0.72)";
      simCtx.fillRect(0, 0, config.size.width, 52);

      if (state.draftPulse > 0) {
        simCtx.fillStyle = `rgba(228, 243, 238, ${state.draftPulse * 0.18})`;
        simCtx.fillRect(0, 0, config.size.width, config.size.height);
      }
    }

    function drawWind() {
      const alphaBase = 0.36 - state.draftLevel * 0.28;
      for (const particle of state.particles) {
        simCtx.strokeStyle = `rgba(247, 250, 252, ${particle.alpha * alphaBase})`;
        simCtx.lineWidth = lerp(1.5, 0.8, state.draftLevel);
        simCtx.beginPath();
        simCtx.moveTo(particle.x, particle.y);
        simCtx.lineTo(particle.x, particle.y + particle.length);
        simCtx.stroke();
      }
    }

    function drawRoad() {
      const center = config.size.width / 2;
      const topY = 74;
      const bottomY = config.size.height + 12;
      const topHalf = 88;
      const bottomHalf = 260;

      simCtx.fillStyle = "#d8d0c3";
      simCtx.fillRect(0, topY - 10, config.size.width, 18);

      simCtx.fillStyle = "#6f6052";
      simCtx.beginPath();
      simCtx.moveTo(center - bottomHalf, bottomY);
      simCtx.lineTo(center - topHalf, topY);
      simCtx.lineTo(center + topHalf, topY);
      simCtx.lineTo(center + bottomHalf, bottomY);
      simCtx.closePath();
      simCtx.fill();

      simCtx.strokeStyle = "rgba(255,255,255,0.12)";
      simCtx.lineWidth = 5;
      simCtx.beginPath();
      simCtx.moveTo(center - bottomHalf + 24, bottomY);
      simCtx.lineTo(center - topHalf + 7, topY);
      simCtx.moveTo(center + bottomHalf - 24, bottomY);
      simCtx.lineTo(center + topHalf - 7, topY);
      simCtx.stroke();

      simCtx.strokeStyle = "rgba(255, 243, 217, 0.85)";
      simCtx.lineWidth = 4;
      simCtx.setLineDash([22, 18]);
      simCtx.beginPath();
      simCtx.moveTo(center, topY + (state.roadOffset % 40));
      simCtx.lineTo(center, bottomY);
      simCtx.stroke();
      simCtx.setLineDash([]);

      for (let y = topY + 22 - (state.roadOffset % 44); y < bottomY; y += 44) {
        const depth = (y - topY) / (bottomY - topY);
        const halfWidth = lerp(topHalf, bottomHalf, depth);
        simCtx.strokeStyle = "rgba(255,255,255,0.045)";
        simCtx.lineWidth = 1;
        simCtx.beginPath();
        simCtx.moveTo(center - halfWidth, y);
        simCtx.lineTo(center + halfWidth, y);
        simCtx.stroke();
      }
    }

    function drawDraftWake() {
      if (state.gap > config.draftZone.depth + 70) return;

      const center = config.size.width / 2;
      const groupY = getGroupAnchorY();
      const alpha = clamp((1 - state.gap / (config.draftZone.depth + 70)) * 0.32 + state.draftLevel * 0.08, 0, 0.34);
      const wakeWidth = config.draftZone.width * 1.4;
      const wakeTopY = groupY + 4;
      const wakeBottomY = Math.min(config.player.y + 18, groupY + config.draftZone.depth * 0.62);

      const gradient = simCtx.createLinearGradient(center, wakeTopY, center, wakeBottomY);
      gradient.addColorStop(0, `rgba(230, 243, 239, ${alpha})`);
      gradient.addColorStop(1, "rgba(230, 243, 239, 0)");

      simCtx.fillStyle = gradient;
      simCtx.beginPath();
      simCtx.moveTo(center - 52, wakeTopY);
      simCtx.quadraticCurveTo(center - wakeWidth, wakeTopY + 70, center - wakeWidth * 0.64, wakeBottomY);
      simCtx.lineTo(center + wakeWidth * 0.64, wakeBottomY);
      simCtx.quadraticCurveTo(center + wakeWidth, wakeTopY + 70, center + 52, wakeTopY);
      simCtx.closePath();
      simCtx.fill();

      simCtx.strokeStyle = `rgba(223, 238, 233, ${alpha * 1.6})`;
      simCtx.lineWidth = 1.4;
      for (let i = -1; i <= 1; i += 1) {
        simCtx.beginPath();
        simCtx.moveTo(center + i * 28, wakeTopY + 10);
        simCtx.bezierCurveTo(
          center + i * 42,
          wakeTopY + 64,
          center + i * 72,
          wakeTopY + 98,
          center + i * 54,
          wakeBottomY - 18
        );
        simCtx.stroke();
      }

      if (state.draftPulse > 0) {
        simCtx.strokeStyle = `rgba(126, 180, 170, ${state.draftPulse * 0.45})`;
        simCtx.lineWidth = 2.2;
        simCtx.stroke();
      }
    }

    function drawGroup() {
      const center = config.size.width / 2;
      const groupY = getGroupAnchorY();
      for (const rider of config.group.riders) {
        drawCyclist(center + rider.x, groupY + rider.y, 1.12);
      }
    }

    function drawPlayer() {
      const center = config.size.width / 2 + state.playerX;
      drawCyclist(center, config.player.y, 1.24);
    }

    function drawCyclist(x, y, scale) {
      if (!spriteReady) return;

      const iw = riderImg.naturalWidth;
      const ih = riderImg.naturalHeight;

      // Crop coordinates for solo rider (left side of sprite sheet).
      // Adjust these fractions if the rider appears misaligned.
      const sx = iw * 0.08;
      const sy = ih * 0.44;
      const sw = iw * 0.23;
      const sh = ih * 0.51;

      const destH = scale * 72;
      const destW = destH * (sw / sh);

      simCtx.drawImage(riderImg, sx, sy, sw, sh, x - destW / 2, y - destH * 0.35, destW, destH);
    }

    function getGroupAnchorY() {
      return config.player.y - clamp(state.gap * 1.45, 116, 198);
    }

    function drawStageLabel() {
      if (state.running && !state.finished) {
        const label = `${state.speed.toFixed(1)} km/h  ·  ${state.draftLabel}`;
        const pillX = 12, pillY = 10, pillW = 198, pillH = 26, pillR = 7;
        simCtx.fillStyle = "rgba(255, 251, 245, 0.84)";
        fillRoundRect(simCtx, pillX, pillY, pillW, pillH, pillR);
        simCtx.fillStyle = state.draftLevel >= 0.72 ? "#2f7c72" : "#334044";
        simCtx.font = '12px "Helvetica Neue", Arial, sans-serif';
        simCtx.textBaseline = "middle";
        simCtx.fillText(label, pillX + 10, pillY + pillH / 2);
        simCtx.textBaseline = "alphabetic";
      }

      if (state.finished) {
        simCtx.fillStyle = `rgba(236, 247, 243, ${0.52 + state.finishFade * 0.22})`;
        simCtx.fillRect(0, 0, config.size.width, config.size.height);
      }
    }

    function fillRoundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();
    }

    function renderGraph() {
      const width = elements.graphCanvas.width;
      const height = elements.graphCanvas.height;
      graphCtx.clearRect(0, 0, width, height);

      graphCtx.fillStyle = "#fffaf4";
      graphCtx.fillRect(0, 0, width, height);

      graphCtx.strokeStyle = "rgba(40, 48, 50, 0.08)";
      graphCtx.lineWidth = 1;
      for (let i = 1; i < 3; i += 1) {
        const y = (height / 3) * i;
        graphCtx.beginPath();
        graphCtx.moveTo(8, y);
        graphCtx.lineTo(width - 8, y);
        graphCtx.stroke();
      }

      const maxTime = Math.max(config.graph.maxSeconds, state.elapsed);
      const maxValue = Math.max(10, ...state.graphSamples.map((sample) => sample.value)) * 1.1;
      const draftStartTime = state.firstDraftTime ?? Math.max(0, state.elapsed - state.draftHoldTime);
      const draftStartX = Math.max(6, (draftStartTime / maxTime) * (width - 10) + 5);

      if (state.draftLevel >= 0.65 || state.finished) {
        graphCtx.fillStyle = "rgba(47, 124, 114, 0.12)";
        graphCtx.fillRect(draftStartX, 0, width - draftStartX, height);
        graphCtx.strokeStyle = "rgba(47, 124, 114, 0.24)";
        graphCtx.lineWidth = 1.5;
        graphCtx.beginPath();
        graphCtx.moveTo(draftStartX, 8);
        graphCtx.lineTo(draftStartX, height - 8);
        graphCtx.stroke();
      }

      graphCtx.fillStyle = "rgba(190, 95, 46, 0.08)";
      graphCtx.beginPath();

      state.graphSamples.forEach((sample, index) => {
        const x = (sample.t / maxTime) * (width - 10) + 5;
        const y = height - (sample.value / maxValue) * (height - 14) - 7;
        if (index === 0) {
          graphCtx.moveTo(x, y);
        } else {
          graphCtx.lineTo(x, y);
        }
      });

      graphCtx.lineTo(width - 5, height - 7);
      graphCtx.lineTo(5, height - 7);
      graphCtx.closePath();
      graphCtx.fill();

      graphCtx.strokeStyle = "#be5f2e";
      graphCtx.lineWidth = 3;
      graphCtx.beginPath();

      state.graphSamples.forEach((sample, index) => {
        const x = (sample.t / maxTime) * (width - 10) + 5;
        const y = height - (sample.value / maxValue) * (height - 14) - 7;
        if (index === 0) {
          graphCtx.moveTo(x, y);
        } else {
          graphCtx.lineTo(x, y);
        }
      });

      graphCtx.stroke();

      const lastSample = state.graphSamples[state.graphSamples.length - 1];
      if (lastSample) {
        const lastX = (lastSample.t / maxTime) * (width - 10) + 5;
        const lastY = height - (lastSample.value / maxValue) * (height - 14) - 7;
        graphCtx.fillStyle = state.finished || state.draftLevel >= 0.65 ? "#2f7c72" : "#be5f2e";
        graphCtx.beginPath();
        graphCtx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
        graphCtx.fill();
      }
    }

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function mergeConfig(base, overrides) {
      const merged = {};
      for (const [key, value] of Object.entries(base)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          merged[key] = { ...value };
        } else if (Array.isArray(value)) {
          merged[key] = value.map((item) => ({ ...item }));
        } else {
          merged[key] = value;
        }
      }
      for (const [key, value] of Object.entries(overrides)) {
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          merged[key] &&
          typeof merged[key] === "object" &&
          !Array.isArray(merged[key])
        ) {
          merged[key] = { ...merged[key], ...value };
        } else {
          merged[key] = value;
        }
      }
      return merged;
    }

    elements.startButton.addEventListener("click", startSimulation);
    elements.effortSlider.addEventListener("input", (event) => {
      state.effort = Number(event.target.value);
      updateHud();
    });
    elements.positionSlider.addEventListener("input", (event) => {
      state.playerX = (Number(event.target.value) / 100) * config.road.laneWidth;
    });

    elements.figure.addEventListener("keydown", (event) => handleKeyChange(event, true));
    elements.figure.addEventListener("keyup", (event) => handleKeyChange(event, false));
    elements.figure.addEventListener("pointerdown", () => {
      elements.figure.focus();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.running) {
        state.running = false;
        state.lastTime = 0;
        setOverlay("");
      }
    });

    resetState();
    renderSimulation();
    renderGraph();

    return {
      start: startSimulation,
      restart: startSimulation,
      pause() {
        state.running = false;
        state.lastTime = 0;
      },
      destroy() {
        container.innerHTML = "";
      },
      config
    };
  }

  window.mountSlipstreamFigure = mountSlipstreamFigure;
})();
