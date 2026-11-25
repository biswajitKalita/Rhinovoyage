// Global Configuration for RhinoVoyage Frontend
(function () {
  const isDirectBackend = window.location.port === '5000';
  const forceLocal = typeof localStorage !== 'undefined' && localStorage.getItem('RHINO_USE_LOCAL_API') === 'true';

  if (isDirectBackend || forceLocal) {
    window.API_BASE_URL = 'http://localhost:5000/api';
  } else {
    // Default to the live cloud backend on Render so that Live Server (5500/3000), file:///, and Vercel work seamlessly
    window.API_BASE_URL = 'https://rhinovoyage.onrender.com/api';
  }
})();
