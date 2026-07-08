(function() {
  "use strict";

  // DOM refs
  const overlay = document.getElementById('permission-overlay');
  const errorScreen = document.getElementById('error-screen');
  const loading = document.getElementById('loading');
  const prompt = document.getElementById('marker-prompt');
  const startBtn = document.getElementById('start-ar-btn');
  const reloadBtn = document.getElementById('reload-btn');
  const scene = document.getElementById('ar-scene');
  const marker = document.getElementById('hiro-marker');

  let markerDetected = false;

  // --- Helpers ---
  function showError() {
    errorScreen.classList.add('visible');
    overlay.classList.add('hidden');
    loading.classList.add('hidden');
  }

  function setLoading(show) {
    if (show) loading.classList.remove('hidden');
    else loading.classList.add('hidden');
  }

  // --- Reload ---
  reloadBtn.addEventListener('click', () => window.location.reload());

  // --- Main start function ---
  async function startAR() {
    setLoading(true);

    try {
      // 1. Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      stream.getTracks().forEach(t => t.stop());

      // 2. Hide overlay
      overlay.classList.add('hidden');

      // 3. Force AR.js to fully re-initialise with camera
      //    Remove existing arjs attribute (if any)
      scene.removeAttribute('arjs');

      //    Wait a tick for the removal to take effect
      await new Promise(r => setTimeout(r, 50));

      //    Set the attribute with sourceType: 'webcam'
      scene.setAttribute('arjs', {
        sourceType: 'webcam',
        debugUIEnabled: false,
        detectionMode: 'mono_and_matrix',
        matrixCodeType: '3x3',
        preset: 'hiro'
      });

      //    Give AR.js time to create its video element and systems
      await new Promise(r => setTimeout(r, 200));

      // 4. Get the AR system and explicitly start it
      const arSystem = scene.systems['arjs'];
      if (!arSystem) {
        throw new Error('AR.js system not found after reinit');
      }

      //    Start the video pipeline
      arSystem.start();

      //    (Optional) If the video exists, log its state
      if (arSystem.video) {
        console.log('✅ Video element created:', arSystem.video);
        arSystem.video.addEventListener('loadedmetadata', () => {
          console.log('📹 Video metadata loaded, readyState:', arSystem.video.readyState);
        });
        arSystem.video.addEventListener('playing', () => {
          console.log('📹 Video is playing');
          setLoading(false);
        });
        arSystem.video.addEventListener('error', (e) => {
          console.error('❌ Video error:', e);
        });
      } else {
        console.warn('⚠️ No video element – AR.js may not have initialised correctly');
      }

      // 5. Set up marker detection
      marker.addEventListener('markerFound', function onFound() {
        if (!markerDetected) {
          markerDetected = true;
          prompt.classList.add('hidden');
          setLoading(false);
        }
      });

      // 6. Hide loading when model loads
      const model = document.querySelector('a-marker a-entity[gltf-model]');
      if (model) {
        model.addEventListener('model-loaded', () => {
          setLoading(false);
        });
      }

      // 7. Safety timeout (hide loading after 6s anyway)
      setTimeout(() => setLoading(false), 6000);

    } catch (err) {
      console.error('❌ Camera/AR init error:', err);
      showError();
    }
  }

  // --- Click handler ---
  startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    startAR();
  });

  // Initial UI
  overlay.classList.remove('hidden');
  errorScreen.classList.remove('visible');
  setLoading(false);
  prompt.classList.remove('hidden');

  console.log('✅ AR ready. Click "Start AR" to begin.');
})();