import { useEffect, useState } from 'react'
import { Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet'
import osmtogeojson from 'osmtogeojson'
import { combine, polygonize, booleanPointInPolygon, bboxClip } from '@turf/turf'

export default function MarcaCenso() {
    const [quadra, setQuadra] = useState(null)
    const [click, setClick] = useState(null)
    const map = useMap();

    useEffect(() => {
        console.log("useEffect")

        const fetchQuadra = async (bounds, click) => {
            //Prepara e chama API Overpass
            const bbox = [bounds.getSouthWest().lat, bounds.getSouthWest().lng, bounds.getNorthEast().lat, bounds.getNorthEast().lng]
            const query = "[out:json][timeout:25];(way[\"highway\"~\"^(trunk|primary|secondary|tertiary|unclassified|residential|steps|pedestrian)$\"](" + bbox + "););out body; >; out skel qt;"
            const overpass = "https://overpass-api.de/api/interpreter?data=" + query
            const response = await fetch(encodeURI(overpass));
            const osmData = await response.json();

            if (!osmData.elements.length) { console.warn("Nenhuma rua encontrada. Tente diminuir a ampliação do mapa."); return null }

            //Transforma para GEOJSON (jamas considera ways como poligono)
            const lines = osmtogeojson(osmData, { flatProperties: true, uninterestingTags: {}, polygonFeatures: [] });
            const combinedLines = combine(lines) //Combina uma unica linha
            //Corrige coordenadas
            combinedLines.features.map(feature => feature.geometry.coordinates.map(points => points.forEach(coord => coord.reverse())))
            const polygons = polygonize(combinedLines) //Transforma em poligonos
            //Filtra poligono clicado
            const quadra = polygons.features.filter(polygon => booleanPointInPolygon(click, polygon))
            
            if (!quadra.length) { console.warn("Nenhuma quadra encontrada. Tente diminuir a ampliação do mapa."); return null }
            return quadra[0] //Retorna primeiro resultado, se houver
        }

        //Busca quadra quando as seguintes condicoes
        if (click) {
            if (map.getZoom() >= 16) {
                fetchQuadra(map.getBounds(), click).then(quadra => setQuadra(quadra))
            } else {
                console.warn(`Impossível marcar quadra a essa altura. Amplie mais o mapa. (zoom:${map.getZoom()})`)
            }
        }
    }, [click])

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