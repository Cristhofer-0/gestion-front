"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl, { Map, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';


type propsMap = {
    mode: "crear" | "editar";
    lat: number;
    lon: number;
    setLati: (lat: number) => void;
    setLoni: (lon: number) => void;
    setDireccion: (direccion: string) => void; //direccion : String {Recibe parametro}
    direccion: string;
}


export const converseGeoCode = async (direccion: string) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${direccion}&format=json&limit=1` //BUSCA LA DIRECCION
        )
        const data = await res.json();
        return data;
    }
    catch (error) {
        console.error('Error al hacer geocodificación inversa:', error);
    }
}

export const reverseGeocode = async (lat: number, lon: number) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}` //BUSCA INFO DEL LUGAR
        );
        const data = await res.json();
        return data.display_name || 'Dirección no encontrada'; //DEVUELVE EL NOMBRE
    } catch (error) {
        console.error('Error al hacer geocodificación inversa:', error);
        return 'Error al obtener dirección';
    }
}; //DEJAR

export const mapByLanLon = (lat: number, lon: number, container: HTMLElement) => {
    const map = new maplibregl.Map({
        container,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=FCrNwS2mCghhtRMFYe7X',
        center: [lon, lat],
        zoom: 16,
    });

    new maplibregl.Marker().setLngLat([lon, lat]).addTo(map);
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
};



export interface MapLibreMapHandle {
    handleSearch: () => void;
}

const MapLibreMap = forwardRef<MapLibreMapHandle, propsMap>(function MapLibreMap(
    { setLati, setLoni, setDireccion, direccion, lat, lon, mode },
    ref) { //DECLARAR TODO

    const mapContainer = useRef<HTMLDivElement>(null); //REFERENCIA AL DIV DONDE VA EL MAPA
    const mapRef = useRef<Map | null>(null);//INSTANCIA DEL MAPA
    const markerRef = useRef<Marker | null>(null);//INSTANCIA DEL MARCADOR
    const popupRef = useRef<Popup | null>(null);//Popup de informacion

    // LAT -12.018419
    // LON -76.971028

    useEffect(() => {
        if (mapContainer.current) {
            mapRef.current = new maplibregl.Map({
                container: mapContainer.current,
                style: 'https://api.maptiler.com/maps/streets/style.json?key=FCrNwS2mCghhtRMFYe7X',
                center: [lon, lat],
                zoom: 16,
            });

            mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

            if (mode === "editar") {
                markerRef.current = new maplibregl.Marker({ draggable: true })
                    .setLngLat([lon, lat])
                    .addTo(mapRef.current);

            }
        }
        return () => {
            mapRef.current?.remove();
        };
    }, []);


    const handleSearch = async () => {
        if (!direccion) return;

        const query = encodeURIComponent(`${direccion}, Perú`);

        try {
            const data = await converseGeoCode(query); //obtiene la direccion

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0]; //obtiene el primer dato 

                const parsedLat = parseFloat(lat);
                const parsedLon = parseFloat(lon);

                setLati(parsedLat); //setea la latitud
                setLoni(parsedLon); //setea la longitud
                setDireccion(display_name);


                mapRef.current?.flyTo({ center: [lon, lat], zoom: 16 }); //CENTRA COMO VUELO A ESOS DATOS

                if (markerRef.current) { //SI EL MARCADOR YA EXISTE
                    markerRef.current.setLngLat([lon, lat]); //MUEVELO A ESAS CORDS


                } else {
                    markerRef.current = new maplibregl.Marker({ draggable: true }) //CREA EL MARKADOR
                        //QUE TAMBIEN ES DRAGGABLE (movible)
                        .setLngLat([lon, lat])
                        .addTo(mapRef.current!);

                    // Evento al soltar el marcador
                    markerRef.current.on('dragend', async () => {//CUANDO LO SUELTAS
                        const newLngLat = markerRef.current!.getLngLat(); //conseguir coordenadas

                        const address = await reverseGeocode(newLngLat.lat, newLngLat.lng); //obtener nombre
                        setDireccion(address)

                        if (popupRef.current) popupRef.current.remove();

                        setLati(newLngLat.lat); //setea la latitud
                        setLoni(newLngLat.lng); //setea la longitud

                        popupRef.current = new maplibregl.Popup() //alerta
                            .setLngLat([newLngLat.lng, newLngLat.lat])//Direccion
                            .setHTML(`
                      <strong>Dirección:</strong><br>${address}<br> 
                      <strong>Coordenadas:</strong><br>
                      Lat: ${newLngLat.lat}<br>
                      Lon: ${newLngLat.lng}
                         `).addTo(mapRef.current!); //añadelo a mapRef
                    });
                }


                if (popupRef.current) popupRef.current.remove(); //si existe el aviso, botalo
                popupRef.current = new maplibregl.Popup() //generar nuevo aviso con =>
                    .setLngLat([lon, lat])
                    .setHTML(`<strong>Dirección:</strong><br>${display_name}<br>`)
                    .addTo(mapRef.current!);
            } else {
                alert('No se encontró la ubicación.'); //CAMBIAR CON LA ALE$RTA DE SHADCN
            }
        } catch (error) {
            console.error('Error al buscar dirección:', error);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSearch
    }));

    return (
        <div style={{ height: '50dvh', position: 'relative' }}>
            <div ref={mapContainer} style={{ height: '100%' }} />
        </div>
    )
})
export default MapLibreMap;
