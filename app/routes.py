from flask import Blueprint, current_app, render_template, request, jsonify, send_file
import io
import requests

bp = Blueprint('routes', __name__)


@bp.route('/')
def index():
    """Render the main page with the map and search UI."""
    maps_key = current_app.config.get('GOOGLE_MAPS_API_KEY', '')
    return render_template('index.html', google_maps_api_key=maps_key)


@bp.route('/api/snapshot', methods=['POST'])
def snapshot():
    """Generate a Static Maps image based on provided polygon points.

    Expected JSON body:
    {
      "center": {"lat": -23.56, "lng": -46.65},
      "zoom": 19,
      "path": [{"lat": ..., "lng": ...}, ...],
      "markers": [{"lat": ..., "lng": ...}, ...]  # optional
    }
    """
    data = request.get_json(silent=True) or {}
    key = current_app.config.get('GOOGLE_MAPS_API_KEY', '')

    if not key:
        return jsonify({"error": "Server missing GOOGLE_MAPS_API_KEY"}), 500

    center = data.get('center')
    zoom = data.get('zoom', 18)
    path = data.get('path', [])
    markers = data.get('markers', [])

    if not center or not path:
        return jsonify({"error": "Missing center or path"}), 400

    # If not closed, close the polygon by repeating the first point at the end
    if path and (path[0]['lat'] != path[-1]['lat'] or path[0]['lng'] != path[-1]['lng']):
        path = path + [path[0]]

    # Build Static Maps URL
    base = 'https://maps.googleapis.com/maps/api/staticmap'
    size = '900x600'
    scale = '2'
    maptype = 'roadmap'

    # Path: black stroke, semi-transparent fill
    path_points = '|'.join([f"{p['lat']},{p['lng']}" for p in path])
    path_style = f"weight:3|color:0x000000ff|fillcolor:0x00897b55|{path_points}"

    marker_params = []
    for m in markers:
        marker_params.append(f"markers=scale:2|color:red|{m['lat']},{m['lng']}")

    params = [
        f"key={key}",
        f"center={center['lat']},{center['lng']}",
        f"zoom={zoom}",
        f"size={size}",
        f"scale={scale}",
        f"maptype={maptype}",
        f"path={path_style}",
    ] + marker_params

    url = base + '?' + '&'.join(params)

    resp = requests.get(url, timeout=30)
    if resp.status_code != 200:
        return jsonify({"error": "Static Maps request failed", "status": resp.status_code}), 502

    # Return as downloadable PNG
    return send_file(
        io.BytesIO(resp.content),
        mimetype='image/png',
        as_attachment=True,
        download_name='mapa.png'
    )
