import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import maplibregl, { Marker, Map, Popup } from "maplibre-gl";
import { reverseGeocode, converseGeoCode } from "./mapa"; // Asegúrate de que la ruta sea correcta

interface propsMap {
    lat: number;
    lon: number;
    setLati: (lat: number) => void;
    setLoni: (lon: number) => void;
    setDireccion: (direccion: string) => void;
    direccion: string;
}

export interface MapLibreMapHandle {
    handleSearch: () => void;
}


const MapLibreMapPe = forwardRef<MapLibreMapHandle, propsMap>(function MapLibreMapPe(
    { lat, lon, setLati, setLoni, setDireccion, direccion },
    ref) { //DECLARAR TODO

    const mapContainer = useRef<HTMLDivElement>(null); //REFERENCIA AL DIV DONDE VA EL MAPA
    const mapRef = useRef<Map | null>(null);//INSTANCIA DEL MAPA
    const markerRef = useRef<Marker | null>(null);//INSTANCIA DEL MARCADOR
    const popupRef = useRef<Popup | null>(null);//Popup de informacion

    // LAT -12.018419
    // LON -76.971028

    const attachDragEnd = () => {
        markerRef.current?.on("dragend", async () => {
            const newLngLat = markerRef.current!.getLngLat();
            const address = await reverseGeocode(newLngLat.lat, newLngLat.lng);

            popupRef.current?.remove();

            setLati(newLngLat.lat);
            setLoni(newLngLat.lng);
            setDireccion(address);

            popupRef.current = new maplibregl.Popup()
                .setLngLat([newLngLat.lng, newLngLat.lat])
                .setHTML(`
                    <strong>Dirección:</strong><br>${address}<br> 
                    <strong>Coordenadas:</strong><br>
                    Lat: ${newLngLat.lat}<br>
                    Lon: ${newLngLat.lng}
                `)
                .addTo(mapRef.current!);
        });
    };



    useEffect(() => {
        if (mapContainer.current) {
            mapRef.current = new maplibregl.Map({
                container: mapContainer.current,
                style: 'https://api.maptiler.com/maps/streets/style.json?key=FCrNwS2mCghhtRMFYe7X', //TIENE API
                center: [lon, lat], //COORDENADAS
                zoom: 16, //ZOOM MAXIMO
            });

            mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

            markerRef.current = new maplibregl.Marker({ draggable: true })
                .setLngLat([lon, lat])
                .addTo(mapRef.current);

            attachDragEnd();
        }

        return () => {
            mapRef.current?.remove();
        };
    }, []);



    const handleSearch = async () => {
        if (!direccion) return;

        const query = encodeURIComponent(`${direccion}, Perú`);

        try {
            const data = await converseGeoCode(query);

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];

                setLati(lat);
                setLoni(lon);
                setDireccion(display_name);

                mapRef.current?.flyTo({ center: [lon, lat], zoom: 16 });

                if (markerRef.current) {
                    markerRef.current.setLngLat([lon, lat]);
                    attachDragEnd();
                } else {
                    markerRef.current = new maplibregl.Marker({ draggable: true })
                        .setLngLat([lon, lat])
                        .addTo(mapRef.current!);
                    attachDragEnd();
                }

                popupRef.current?.remove();
                popupRef.current = new maplibregl.Popup()
                    .setLngLat([lon, lat])
                    .setHTML(`<strong>Dirección:</strong><br>${display_name}<br>`)
                    .addTo(mapRef.current!);
            } else {
                alert('No se encontró la ubicación.');
            }
        } catch (error) {
            console.error('Error al buscar dirección:', error);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSearch
    }));

    return (
        <div style={{ height: '30dvh', position: 'relative' }}>
            <div ref={mapContainer} style={{ height: '100%' }} />
        </div>
    )
})

export default MapLibreMapPe;
