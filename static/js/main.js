let map;
let polygon;
let polyPath = [];
let markers = [];
let drawingEnabled = true;

function formatMeters(m){
  if(!m || isNaN(m)) return '0 m';
  if(m >= 1000) return (m/1000).toFixed(2) + ' km';
  return Math.round(m) + ' m';
}

function formatArea(mt2){
  if(!mt2 || isNaN(mt2)) return '0 m²';
  if(mt2 >= 1_000_000) return (mt2/1_000_000).toFixed(2) + ' km²';
  return mt2.toFixed(2) + ' m²';
}

function updateMeasurements(){
  if(polyPath.length < 2){
    document.getElementById('perimeter').textContent = '0 m';
  } else {
    const len = google.maps.geometry.spherical.computeLength(polyPath);
    document.getElementById('perimeter').textContent = formatMeters(len);
  }

  if(polyPath.length < 3){
    document.getElementById('area').textContent = '0 m²';
  } else {
    const area = google.maps.geometry.spherical.computeArea(polyPath);
    document.getElementById('area').textContent = formatArea(area);
  }
}

function addPoint(latLng){
  polyPath.push(latLng);
  polygon.setPath(polyPath);
  updateMeasurements();
}

function removeLastPoint(){
  polyPath.pop();
  polygon.setPath(polyPath);
  updateMeasurements();
}

function addMarker(latLng){
  const m = new google.maps.Marker({position:latLng, map});
  markers.push(m);
}

async function downloadSnapshot(){
  if(polyPath.length < 3){
    alert('Adicione pelo menos 3 pontos para gerar a imagem.');
    return;
  }
  const center = map.getCenter().toJSON();
  const zoom = map.getZoom();
  const path = polyPath.map(ll => ll.toJSON());
  const markerList = markers.map(m => m.getPosition().toJSON());

  const resp = await fetch('/api/snapshot',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({center, zoom, path, markers: markerList})
  });
  if(!resp.ok){
    const info = await resp.json().catch(()=>({}));
    alert('Falha ao gerar imagem: ' + (info.error || resp.status));
    return;
  }
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mapa.png'; a.click();
  URL.revokeObjectURL(url);
}

window.initMap = function initMap(){
  const start = {lat: -23.56168, lng: -46.65822}; // São Paulo
  map = new google.maps.Map(document.getElementById('map'), {
    center: start,
    zoom: 18,
    mapTypeId: 'roadmap',
    clickableIcons: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
  });

  polygon = new google.maps.Polygon({
    map,
    paths: polyPath,
    strokeColor: '#000000',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: '#00897b',
    fillOpacity: 0.33,
    clickable: false,
  });

  // Add point on map click when drawing is enabled
  map.addListener('click', (e)=>{
    if(drawingEnabled){ addPoint(e.latLng); }
  });

  // Places autocomplete
  const input = document.getElementById('search-input');
  const autocomplete = new google.maps.places.Autocomplete(input, {fields:['geometry','name','formatted_address']});
  autocomplete.addListener('place_changed', ()=>{
    const place = autocomplete.getPlace();
    if(!place.geometry || !place.geometry.location){
      alert('Endereço inválido.');
      return;
    }
    map.panTo(place.geometry.location);
    map.setZoom(19);
  });

  // Buttons
  document.getElementById('btn-add').addEventListener('click', ()=>{ drawingEnabled = true; });
  document.getElementById('btn-remove').addEventListener('click', removeLastPoint);
  document.getElementById('btn-antenna').addEventListener('click', ()=>{ drawingEnabled = false; });
  map.addListener('rightclick', (e)=>{ if(!drawingEnabled) addMarker(e.latLng); });
  document.getElementById('btn-download').addEventListener('click', downloadSnapshot);
};
