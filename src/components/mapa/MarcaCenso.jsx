import { useEffect, useState } from 'react'
import { Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet'
import osmtogeojson from 'osmtogeojson'
import * as turf from '@turf/turf'
import * as geofire from "geofire-common"
import { collection, addDoc, query, orderBy, startAt, endAt, getDocs } from "firebase/firestore";
import { firestore } from "../../config/firebase.config"

export default function MarcarCenso() {
    const [novaQuadra, setNovaQuadra] = useState(null)
    const [censos, setCensos] = useState(null)
    const [click, setClick] = useState(null)
    const map = useMap();
    const event = useMapEvents({
        click(e) {
            const latlng = [e.latlng.lat, e.latlng.lng]
            setClick(latlng)
        },
    });

    useEffect(() => {
        console.log("useEffect")
        let ignore = false; //Evita race
        const cleanUp = () => ignore = true;

        if (!click) return cleanUp //Ignora se nao houver click

        //Busca quadra quando as seguintes condicoes
        if (map.getZoom() >= 16) {
            fetchQuadra(map.getBounds(), click).then(quadra => {
                if (!ignore) {
                    setNovaQuadra(quadra);
                    gravarCenso(quadra)
                }
            })
        } else {
            console.warn(`Impossível marcar quadra a essa altura. Amplie mais o mapa. (zoom:${map.getZoom()})`)
        }

        //Evita race condition
        return cleanUp
    }, [click])


    const fetchQuadra = async (bounds, click) => {
        console.log("fetchQuadra")
        //Prepara e chama API Overpass
        const bbox = [bounds.getSouthWest().lat, bounds.getSouthWest().lng, bounds.getNorthEast().lat, bounds.getNorthEast().lng]
        const query = "[out:json][timeout:25];(way[\"highway\"~\"^(trunk|primary|secondary|tertiary|unclassified|residential|steps|pedestrian)$\"](" + bbox + "););out body; >; out skel qt;"
        const overpass = "https://overpass-api.de/api/interpreter?data=" + query
        const response = await fetch(encodeURI(overpass));
        const osmData = await response.json();

        if (!osmData.elements.length) { console.warn("Nenhuma rua encontrada. Tente diminuir a ampliação do mapa."); return null }

        //Transforma para GEOJSON (jamas considera ways como poligono)
        const lines = osmtogeojson(osmData, { flatProperties: true, uninterestingTags: {}, polygonFeatures: [] });
        const combinedLines = turf.combine(lines) //Combina uma unica linha
        //Corrige coordenadas
        combinedLines.features.map(feature => feature.geometry.coordinates.map(points => points.forEach(coord => coord.reverse())))
        const polygons = turf.polygonize(combinedLines) //Transforma em poligonos
        //Filtra poligono clicado
        const quadra = polygons.features.filter(polygon => turf.booleanPointInPolygon(click, polygon))

        if (!quadra.length) { console.warn("Nenhuma quadra encontrada. Tente diminuir a ampliação do mapa."); return null }
        return quadra[0] //Retorna primeiro resultado, se houver
    }

    const gravarCenso = async (quadra) => {
        if (!quadra) return false
        console.log("gravarCenso");
        let centroid = turf.center(quadra);
        let geohash = geofire.geohashForLocation(turf.getCoord(centroid));
        try {
            const docRef = await addDoc(collection(firestore, "censos"), {
                geometry: JSON.stringify(quadra.geometry),
                centroid: centroid,
                geohash: geohash
            });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    return novaQuadra === null ? null : (
        <Polygon
            pathOptions={{ color: 'green', fillOpacity: .5, stroke: true }}
            positions={novaQuadra.geometry.coordinates} >
            {console.log("draw quadra")}
        </Polygon >
    )
};