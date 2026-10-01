(() => {
  const canvas = document.querySelector("#particle-canvas");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!canvas || !window.THREE || !window.gsap || reducedMotion.matches) {
    window.BirthdayParticles = null;
    return;
  }

  const PARTICLE_COUNT = 3600;
  const AMBIENT_CAT_PARTICLES = 1550;
  const COLOR_MIST = new THREE.Color("#172027");
  const COLOR_WARM = new THREE.Color("#b86a30");

  class BirthdayParticleScene {
    constructor() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.mode = "ambient";
      this.morphProgress = 0;
      this.introPlayed = false;

      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.setClearColor(0x000000, 0);

      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(
        -this.width / 2,
        this.width / 2,
        this.height / 2,
        -this.height / 2,
        -1000,
        1000,
      );
      this.camera.position.z = 500;

      this.geometry = new THREE.BufferGeometry();
      this.positions = new Float32Array(PARTICLE_COUNT * 3);
      this.colors = new Float32Array(PARTICLE_COUNT * 3);
      this.fromPositions = new Float32Array(PARTICLE_COUNT * 3);
      this.toPositions = new Float32Array(PARTICLE_COUNT * 3);
      this.fromColors = new Float32Array(PARTICLE_COUNT * 3);
      this.toColors = new Float32Array(PARTICLE_COUNT * 3);

      const ambientCat = this.sampleDrawing(this.drawAmbientCat(), AMBIENT_CAT_PARTICLES, 0.36);
      ambientCat.forEach((point) => {
        point.z = (Math.random() - 0.5) * 90;
      });
      this.fillShape(ambientCat, this.positions, this.colors);
      this.fromPositions.set(this.positions);
      this.toPositions.set(this.positions);
      this.fromColors.set(this.colors);
      this.toColors.set(this.colors);

      this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
      this.geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
      this.material = new THREE.PointsMaterial({
        size: 3.4,
        map: this.makeParticleTexture(),
        transparent: true,
        opacity: 0.68,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        sizeAttenuation: false,
      });

      this.points = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.points);
      this.geometry.setDrawRange(0, AMBIENT_CAT_PARTICLES);
      this.resize();
      this.setAmbientAnchor();
      canvas.classList.add("is-active");
      window.addEventListener("resize", () => this.resize());
      this.render();
    }

    makeParticleTexture() {
      const dot = document.createElement("canvas");
      dot.width = 64;
      dot.height = 64;
      const context = dot.getContext("2d");
      const glow = context.createRadialGradient(32, 32, 1, 32, 32, 31);
      glow.addColorStop(0, "rgba(255,255,255,1)");
      glow.addColorStop(0.18, "rgba(255,255,255,0.95)");
      glow.addColorStop(0.55, "rgba(255,255,255,0.28)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(dot);
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.left = -this.width / 2;
      this.camera.right = this.width / 2;
      this.camera.top = this.height / 2;
      this.camera.bottom = -this.height / 2;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height, false);
      if (this.mode === "ambient" && this.points) this.setAmbientAnchor();
    }

    fillShape(points, positionArray, colorArray) {
      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        const offset = index * 3;
        const point = points[index % points.length];
        const jitter = index >= points.length ? 1.8 : 0;
        positionArray[offset] = point.x + (Math.random() - 0.5) * jitter;
        positionArray[offset + 1] = point.y + (Math.random() - 0.5) * jitter;
        positionArray[offset + 2] = point.z;
        const color = Math.random() > 0.92 ? COLOR_WARM : COLOR_MIST;
        colorArray[offset] = color.r;
        colorArray[offset + 1] = color.g;
        colorArray[offset + 2] = color.b;
      }
    }

    setAmbientAnchor() {
      this.points.position.set(
        -this.width / 2 + Math.min(this.width * 0.15, 285),
        this.height / 2 - Math.min(this.height * 0.18, 175),
        0,
      );
    }

    makeDrawing(width, height) {
      const drawing = document.createElement("canvas");
      drawing.width = width;
      drawing.height = height;
      return { drawing, context: drawing.getContext("2d") };
    }

    drawAmbientCat() {
      const { drawing, context } = this.makeDrawing(440, 330);
      context.strokeStyle = "#172027";
      context.fillStyle = "#172027";
      context.lineWidth = 30;
      context.lineCap = "round";
      context.lineJoin = "round";

      // 参考图 1：低矮圆脸、两只小耳朵和左右各两道短胡须。
      context.beginPath();
      context.moveTo(94, 136);
      context.bezierCurveTo(88, 94, 96, 69, 122, 72);
      context.lineTo(157, 87);
      context.bezierCurveTo(194, 77, 247, 77, 283, 87);
      context.lineTo(318, 72);
      context.bezierCurveTo(344, 69, 352, 94, 346, 136);
      context.moveTo(84, 178);
      context.bezierCurveTo(91, 244, 132, 265, 220, 265);
      context.bezierCurveTo(308, 265, 349, 244, 356, 178);
      context.stroke();

      [[160, 192], [280, 192]].forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, 18, 0, Math.PI * 2);
        context.fill();
      });

      [[58, 174, 87, 179], [64, 214, 93, 206], [382, 174, 353, 179], [376, 214, 347, 206]].forEach(
        ([x1, y1, x2, y2]) => {
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.stroke();
        },
      );
      return drawing;
    }

    drawBasketball() {
      const { drawing, context } = this.makeDrawing(620, 620);
      context.translate(310, 310);
      context.strokeStyle = "#b86a30";
      context.lineWidth = 15;
      context.beginPath();
      context.arc(0, 0, 178, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(-178, 0);
      context.lineTo(178, 0);
      context.moveTo(0, -178);
      context.bezierCurveTo(-82, -92, -82, 92, 0, 178);
      context.moveTo(0, -178);
      context.bezierCurveTo(82, -92, 82, 92, 0, 178);
      context.stroke();
      return drawing;
    }

    drawPaw(size = 1) {
      const { drawing, context } = this.makeDrawing(620, 560);
      context.translate(310, 292);
      context.scale(size, size);
      context.fillStyle = "#725038";
      context.beginPath();
      context.ellipse(0, 70, 104, 88, 0, 0, Math.PI * 2);
      context.fill();
      [[-115, -58, -0.35], [-40, -112, -0.12], [42, -112, 0.12], [116, -57, 0.35]].forEach(([x, y, angle]) => {
        context.beginPath();
        context.ellipse(x, y, 43, 57, angle, 0, Math.PI * 2);
        context.fill();
      });
      return drawing;
    }

    drawReferencePaw() {
      const { drawing, context } = this.makeDrawing(500, 560);
      context.strokeStyle = "#725038";
      context.fillStyle = "#725038";
      context.lineWidth = 34;
      context.lineCap = "round";
      context.lineJoin = "round";

      // 参考图 2：云朵状掌缘、左侧下垂轮廓、四枚趾垫和一枚大掌垫。
      context.beginPath();
      context.moveTo(126, 468);
      context.lineTo(132, 318);
      context.bezierCurveTo(82, 300, 68, 264, 86, 226);
      context.bezierCurveTo(99, 198, 122, 188, 148, 194);
      context.bezierCurveTo(142, 151, 165, 121, 200, 119);
      context.bezierCurveTo(225, 117, 244, 130, 254, 151);
      context.bezierCurveTo(270, 123, 297, 111, 328, 120);
      context.bezierCurveTo(361, 130, 376, 157, 369, 192);
      context.bezierCurveTo(404, 184, 435, 202, 445, 234);
      context.bezierCurveTo(458, 274, 433, 308, 391, 319);
      context.stroke();

      [[153, 244], [209, 179], [298, 179], [355, 244]].forEach(([x, y]) => {
        context.beginPath();
        context.arc(x, y, 23, 0, Math.PI * 2);
        context.fill();
      });

      context.beginPath();
      context.moveTo(202, 300);
      context.bezierCurveTo(205, 253, 235, 228, 267, 228);
      context.bezierCurveTo(303, 228, 329, 255, 330, 302);
      context.bezierCurveTo(296, 316, 237, 316, 202, 300);
      context.fill();
      return drawing;
    }

    sampleDrawing(drawing, limit, worldScale = 1) {
      const context = drawing.getContext("2d");
      const pixels = context.getImageData(0, 0, drawing.width, drawing.height).data;
      const candidates = [];
      const step = 3;
      for (let y = 0; y < drawing.height; y += step) {
        for (let x = 0; x < drawing.width; x += step) {
          const pixel = (y * drawing.width + x) * 4;
          if (pixels[pixel + 3] > 80) {
            candidates.push({
              x,
              y,
              r: pixels[pixel] / 255,
              g: pixels[pixel + 1] / 255,
              b: pixels[pixel + 2] / 255,
            });
          }
        }
      }

      const fitScale = Math.min(
        (this.width * 0.86) / drawing.width,
        (this.height * 0.58) / drawing.height,
      ) * worldScale;
      const selectedCount = Math.min(limit, candidates.length);
      const sampleStride = candidates.length / selectedCount;
      const selected = Array.from({ length: selectedCount }, (_, index) =>
        candidates[Math.floor(index * sampleStride)]);
      return selected.map((point) => ({
        x: (point.x - drawing.width / 2) * fitScale,
        y: (drawing.height / 2 - point.y) * fitScale,
        z: (Math.random() - 0.5) * 16,
        r: point.r,
        g: point.g,
        b: point.b,
      }));
    }

    sampleImageElement(image, limit, colorStrength = 1) {
      if (!image.naturalWidth || !image.naturalHeight) return [];
      const maxSampleWidth = 520;
      const sampleScale = Math.min(1, maxSampleWidth / image.naturalWidth);
      const sampleWidth = Math.max(1, Math.round(image.naturalWidth * sampleScale));
      const sampleHeight = Math.max(1, Math.round(image.naturalHeight * sampleScale));
      const drawing = document.createElement("canvas");
      drawing.width = sampleWidth;
      drawing.height = sampleHeight;
      const context = drawing.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
      const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
      const candidates = [];
      const step = 2;

      for (let y = 0; y < sampleHeight; y += step) {
        for (let x = 0; x < sampleWidth; x += step) {
          const pixel = (y * sampleWidth + x) * 4;
          if (pixels[pixel + 3] > 36) {
            candidates.push({
              x,
              y,
              r: pixels[pixel] / 255,
              g: pixels[pixel + 1] / 255,
              b: pixels[pixel + 2] / 255,
            });
          }
        }
      }

      if (!candidates.length) return [];
      const rect = image.getBoundingClientRect();
      const style = window.getComputedStyle(image);
      let renderedLeft = rect.left;
      let renderedTop = rect.top;
      let renderedWidth = rect.width;
      let renderedHeight = rect.height;

      if (style.objectFit === "contain") {
        const fitScale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
        renderedWidth = image.naturalWidth * fitScale;
        renderedHeight = image.naturalHeight * fitScale;
        renderedLeft = rect.right - renderedWidth;
        renderedTop = rect.bottom - renderedHeight;
      }

      const selectedCount = Math.min(limit, candidates.length);
      const goldenRatio = 0.61803398875;
      const sampleOffset = Math.random();
      return Array.from({ length: selectedCount }, (_, index) => {
        const point = candidates[Math.floor(((sampleOffset + index * goldenRatio) % 1) * candidates.length)];
        const screenX = renderedLeft + (point.x / sampleWidth) * renderedWidth;
        const screenY = renderedTop + (point.y / sampleHeight) * renderedHeight;
        return {
          x: screenX - this.width / 2,
          y: this.height / 2 - screenY,
          z: (Math.random() - 0.5) * 80,
          r: point.r * colorStrength,
          g: point.g * colorStrength,
          b: point.b * colorStrength,
        };
      });
    }

    makeScatter(count) {
      return Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * this.width * 1.35,
        y: (Math.random() - 0.5) * this.height * 1.25,
        z: (Math.random() - 0.5) * 500,
        r: COLOR_MIST.r,
        g: COLOR_MIST.g,
        b: COLOR_MIST.b,
      }));
    }

    morphTo(points, duration, ease = "power3.inOut", drawCount = points.length) {
      const usablePoints = points.length ? points : this.makeScatter(PARTICLE_COUNT);
      this.fromPositions.set(this.positions);
      this.fromColors.set(this.colors);
      this.geometry.setDrawRange(0, Math.min(drawCount, PARTICLE_COUNT));

      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        const offset = index * 3;
        const point = usablePoints[index % usablePoints.length];
        const jitter = index >= usablePoints.length ? 2.5 : 0;
        this.toPositions[offset] = point.x + (Math.random() - 0.5) * jitter;
        this.toPositions[offset + 1] = point.y + (Math.random() - 0.5) * jitter;
        this.toPositions[offset + 2] = point.z;
        this.toColors[offset] = point.r;
        this.toColors[offset + 1] = point.g;
        this.toColors[offset + 2] = point.b;
      }

      this.morphProgress = 0;
      return new Promise((resolve) => {
        gsap.to(this, {
          morphProgress: 1,
          duration,
          ease,
          overwrite: true,
          onComplete: resolve,
        });
      });
    }

    wait(seconds) {
      return new Promise((resolve) => gsap.delayedCall(seconds, resolve));
    }

    fadeTo(opacity, duration = 0.5) {
      return new Promise((resolve) => {
        gsap.to(this.material, { opacity, duration, ease: "power2.out", onComplete: resolve });
      });
    }

    async hideGateCat() {
      this.mode = "shape";
      await this.fadeTo(0, 0.45);
      canvas.classList.remove("is-active");
    }

    async playIntroAssembly(onReveal) {
      if (this.introPlayed) {
        onReveal();
        return;
      }
      this.introPlayed = true;
      const skyline = document.querySelector(".city-scene__skyline");
      const bouquet = document.querySelector(".intro__bouquet");

      try {
        await Promise.all([skyline.decode(), bouquet.decode()]);
        const targets = [
          ...this.sampleImageElement(skyline, 2500),
          ...this.sampleImageElement(bouquet, 1050, 0.8),
        ];
        if (targets.length < 300) throw new Error("Not enough visible pixels for the intro assembly.");

        this.mode = "shape";
        this.points.position.set(0, 0, 0);
        this.material.size = 2.9;
        this.material.opacity = 0;
        this.fillShape(this.makeScatter(PARTICLE_COUNT), this.positions, this.colors);
        this.geometry.setDrawRange(0, Math.min(targets.length, PARTICLE_COUNT));
        canvas.classList.add("is-active");

        await Promise.all([
          this.fadeTo(0.88, 0.45),
          this.morphTo(targets, 2.1, "power3.out", targets.length),
        ]);
        await this.wait(0.42);
        onReveal();
        await this.fadeTo(0, 0.72);
      } catch (error) {
        console.warn("Intro particle assembly skipped:", error);
        onReveal();
      } finally {
        this.material.size = 3.4;
        canvas.classList.remove("is-active");
      }
    }

    async playBasketballToPaw(onSwap) {
      this.mode = "shape";
      this.points.position.set(0, 0, 0);
      canvas.classList.add("is-active");
      this.material.opacity = 0;
      const ball = this.sampleDrawing(this.drawBasketball(), 1150, 0.72);
      const paw = this.sampleDrawing(this.drawReferencePaw(), 1050, 0.62);
      await this.fadeTo(0.78, 0.28);
      await this.morphTo(ball, 0.7, "power2.out", 1150);
      await this.morphTo(paw, 0.82, "power3.inOut", 1050);
      await this.wait(0.65);
      onSwap();
      await this.wait(0.18);
      await this.morphTo(this.makeScatter(1050), 0.7, "power2.in", 1050);
      await this.fadeTo(0, 0.38);
      canvas.classList.remove("is-active");
    }

    render() {
      if (this.mode === "ambient") {
        const time = performance.now();
        this.points.rotation.y = Math.sin(time * 0.00042) * 0.3;
        this.points.rotation.x = Math.cos(time * 0.00028) * 0.055;
      } else {
        this.points.rotation.set(0, 0, 0);
      }

      const progress = this.morphProgress;
      for (let index = 0; index < PARTICLE_COUNT * 3; index += 1) {
        this.positions[index] = this.fromPositions[index] +
          (this.toPositions[index] - this.fromPositions[index]) * progress;
        this.colors[index] = this.fromColors[index] +
          (this.toColors[index] - this.fromColors[index]) * progress;
      }
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(() => this.render());
    }
  }

  window.BirthdayParticles = new BirthdayParticleScene();
})();
