import { useEffect, useState } from 'react'
import { Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet'
import osmtogeojson from 'osmtogeojson'
import { combine, polygonize, booleanPointInPolygon, bboxClip } from '@turf/turf'

function MapClickHandler() {
    const [quadra, setQuadra] = useState(null)
    const [click, setClick] = useState(null)
    const map = useMap();

    useEffect(() => {
        getQuadra(map.getBounds(), click).then(quadra => setQuadra(quadra))
    }, [click])

    const getQuadra = async (bounds, click) => {
        console.log("chamou async function")
        if (map.getZoom() < 16) {
            console.warn("Impossível marcar quadra a essa altura. Dê um zoom")
            return null
        }

        //Prepara chama a API Overpass
        const bbox = [bounds.getSouthWest().lat, bounds.getSouthWest().lng, bounds.getNorthEast().lat, bounds.getNorthEast().lng]
        const query = "[out:json][timeout:25];(way[\"highway\"~\"^(trunk|primary|secondary|tertiary|unclassified|residential|steps|pedestrian)$\"](" + bbox + "););out body; >; out skel qt;"
        const overpass = "https://overpass-api.de/api/interpreter?data=" + query
        const response = await fetch(encodeURI(overpass));
        const osmData = await response.json();
        //Transforma para GEOJSON
        const lines = osmtogeojson(osmData);
        //Combina uma unica linha
        const combinedLines = combine(lines)
        //Corrige coordenadas
        combinedLines.features.map(feature => feature.geometry.coordinates.map(points => points.forEach(coord => coord.reverse())))
        //Recorta somente linhas visiveis
        const clipedLines = bboxClip(combinedLines.features[0], bbox)
        //Transforma em poligonos
        const polygons = polygonize(clipedLines)

        const quadra = polygons.features.filter(function (polygon) {
            return booleanPointInPolygon(click, polygon)
        })
        return quadra.length > 0 ? quadra[0] : null
    }

    const event = useMapEvents({
        click(e) {
            const latlng = [e.latlng.lat, e.latlng.lng]
            setClick(latlng)
        },
    });

    //return null
    return quadra === null ? null : (
        <Polygon
            pathOptions={{ color: 'green', fillOpacity: .5, stroke: true }}
            positions={quadra.geometry.coordinates} >
            {console.log("write quadra")}
        </Polygon >
    )
};

export default MapClickHandler