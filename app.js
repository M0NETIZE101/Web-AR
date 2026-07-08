(function() {
  "use strict";

  const overlay = document.getElementById('permission-overlay');
  const errorScreen = document.getElementById('error-screen');
  const loading = document.getElementById('loading');
  const prompt = document.getElementById('marker-prompt');
  const startBtn = document.getElementById('start-ar-btn');
  const reloadBtn = document.getElementById('reload-btn');

  let markerDetected = false;
  let arStarted = false;

  function showError() {
    errorScreen.classList.add('visible');
    overlay.classList.add('hidden');
    loading.classList.add('hidden');
  }

  function setLoading(show) {
    loading.classList.toggle('hidden', !show);
  }

  reloadBtn.addEventListener('click', () => window.location.reload());

  async function startAR() {
    if (arStarted) return;
    arStarted = true;
    setLoading(true);

    try {
      // 1. Pre-request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Stop this stream - AR.js will create its own
      stream.getTracks().forEach(track => track.stop());

      // 2. Hide overlay
      overlay.classList.add('hidden');

      // 3. Dynamically add AR.js attributes to start it
      const scene = document.getElementById('ar-scene');
      scene.setAttribute('arjs', 
        'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3; preset: hiro'
      );

      // 4. Set up marker detection
      const marker = document.getElementById('hiro-marker');
      if (marker) {
        marker.addEventListener('markerFound', () => {
          if (!markerDetected) {
            markerDetected = true;
            prompt.classList.add('hidden');
            setLoading(false);
          }
        });

        marker.addEventListener('markerLost', () => {
          markerDetected = false;
          prompt.classList.remove('hidden');
        });
      }

      // 5. Hide loading when model loads
      const model = document.querySelector('a-marker [gltf-model]');
      if (model) {
        model.addEventListener('model-loaded', () => setLoading(false));
      }

      // 6. Safety timeout
      setTimeout(() => setLoading(false), 5000);

      console.log('✅ AR started successfully');

    } catch (err) {
      console.error('❌ Error:', err);
      showError();
    }
  }

  startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    startAR();
  });

  // Initial state
  overlay.classList.remove('hidden');
  errorScreen.classList.remove('visible');
  setLoading(false);
  prompt.classList.remove('hidden');

})();