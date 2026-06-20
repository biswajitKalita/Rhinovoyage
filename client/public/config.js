// Global Configuration for RhinoVoyage Frontend
window.API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://rhinovoyage.onrender.com/api';
