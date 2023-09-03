import React, { useState, useEffect } from 'react'
import { useMap, Marker, Popup, /*Circle*/ } from 'react-leaflet'
import L from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

export default function LocationMarker() {
    const [position, setPosition] = useState(null);
    const [accuracy, setAccuracy] = useState(null);

    const map = useMap();

    useEffect(() => {
        const interval = setInterval(() => {
            //console.log("GPS update");
            map.locate().on("locationfound", function (e) {
                setPosition(e.latlng);
                setAccuracy(e.accuracy);
                //map.flyTo(e.latlng, map.getZoom());
                //const radius = e.accuracy;
                //const circle = L.circle(e.latlng, radius);
                //circle.addTo(map);
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [map]);

    function gpsMarkerIcon() {
        const iconGPS = new L.Icon({
            iconAnchor: [16, 32],
            iconUrl: icon,
            shadowUrl: iconShadow,
        });
        return iconGPS;
    }

    return position === null ? null : (
        <>
            {/* <Circle center={position} radius={accuracy}>
            </Circle> */}
            <Marker position={position} icon={gpsMarkerIcon()}>
                <Popup>Precisão {accuracy.toFixed(0)} metros</Popup>
            </Marker>
        </>
    )
}