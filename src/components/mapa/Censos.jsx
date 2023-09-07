import { useEffect, useState } from 'react'
import { Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet'
import osmtogeojson from 'osmtogeojson'
import * as turf from '@turf/turf'
import * as geofire from "geofire-common"
import { collection, addDoc, query, orderBy, startAt, endAt, getDocs, where } from "firebase/firestore";
import { firestore } from "../../config/firebase.config"

export default function Censos() {
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

        fetchCensos().then((censos) => {
            if (censos) setCensos(censos)
        })

        if (!click) return cleanUp //Ignora se nao houver click
        //Evita race condition
        return cleanUp
    }, [click])

    const fetchCensos = async () => {
        let center = map.getCenter()
        let metros = 200
        const bounds = geofire.geohashQueryBounds([center.lat, center.lng], metros);
        const promises = [];
        for (const b of bounds) {
            const q = query(
                collection(firestore, 'censos'),
                where("congregacao", "==", "Espanhola"),
                orderBy('geohash'),
                startAt(b[0]),
                endAt(b[1]));
            promises.push(getDocs(q));
        }
        // Collect all the query results together into a single list
        const snapshots = await Promise.all(promises);

        const censos = [];
        snapshots.forEach((snap) => {
            snap.forEach(doc => {
                let id = doc.id
                let data = doc.data()
                censos.push({ id: id, data: data })
            })
        })
        return censos
    }

    return censos === null ? null : (<>{
        censos.map(censo => {
            return <Polygon
                key={censo.id}
                pathOptions={{ color: 'purple', fillOpacity: .5, stroke: true }}
                positions={JSON.parse(censo.data.geometry).coordinates} >
            </Polygon >
        })
    }</>)
};