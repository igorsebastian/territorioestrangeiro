import React from 'react'
import { useMap, MapContainer, LayersControl, TileLayer, useMapEvents } from 'react-leaflet'
import LocationMarker from './Location';
import L from 'leaflet';

import "leaflet/dist/leaflet.css";
import './styles.css'

//Ajusta icone default
import iconDefault from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import MarcarCenso from './MarcaCenso';
import Censos from './Censos';
L.Marker.prototype.options.icon = L.icon({
  iconUrl: iconDefault,
  shadowUrl: iconShadow
});


function Mapa({ children }) {
  const center = [-20.465182, -54.621828];
  const tileClass = false ? 'map-tiles' : 'algo'

  return (
    <MapContainer
      style={{ zIndex: '1' }}
      center={center}
      zoom={17}
      scrollWheelZoom={true}
      updateWhenZooming={false}
      updateWhenIdle={true}
      preferCanvas={true}
      renderer={L.canvas()}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className={tileClass} />
      <LocationMarker />
      <MarcarCenso />
      <Censos />
    </MapContainer>
  )
}

export default Mapa;