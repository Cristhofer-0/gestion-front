"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import maplibregl, { Map, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';


type propsMap = {
    mode: "crear" | "editar"; //SI ES PARA CREAR o EDITAR
    lat: number;
    lon: number;
    setLati: (lat: number) => void;
    setLoni: (lon: number) => void;
    setDireccion: (direccion: string) => void;
    setDireccionError?: (error: string | null) => void;
    direccion: string;
};

//FUNCION PARA CONVERTIR DIRECCION A COORDENADAS
export const converseGeoCode = async (direccion: string) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${direccion}&format=json&limit=1`
        );
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error al hacer geocodificación inversa:', error);
    }
};

//FUNCION PARA CONVERTIR COORDENADAS A DIRECCION EXACTA
export const reverseGeocode = async (lat: number, lon: number) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        return data.display_name || 'Dirección no encontrada';
    } catch (error) {
        console.error('Error al hacer geocodificación inversa:', error);
        return 'Error al obtener dirección';
    }
};

//FUNCION PARA ENTREGAR UN MAPA CON EL MARCADOR HECHO
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
    { setLati, setLoni, setDireccion, setDireccionError, direccion, lat, lon, mode },
    ref
) {
    const mapContainer = useRef<HTMLDivElement>(null); //CONTENEDOR DEL MAPA
    const mapRef = useRef<Map | null>(null); //REFERENCIA DEL MAPA
    const markerRef = useRef<Marker | null>(null); //REFERENCIA DEL MARKADOR
    const popupRef = useRef<Popup | null>(null); //REFERENCIA DEL pop

    const attachDragEnd = () => {
        markerRef.current?.on('dragend', async () => {
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

    const createOrMoveMarker = (lng: number, lat: number, popupText?: string) => {
        if (!markerRef.current) {
            markerRef.current = new maplibregl.Marker({ draggable: true })
                .setLngLat([lng, lat])
                .addTo(mapRef.current!);
            attachDragEnd();
        } else {
            markerRef.current.setLngLat([lng, lat]);
        }

        popupRef.current?.remove();
        if (popupText) {
            popupRef.current = new maplibregl.Popup()
                .setLngLat([lng, lat])
                .setHTML(popupText)
                .addTo(mapRef.current!);
        }
    };

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
                mapRef.current.on('load', () => {
                    createOrMoveMarker(lon, lat, `
                        <strong>Dirección:</strong><br>Marcador inicial<br>
                        <strong>Coordenadas:</strong><br>
                        Lat: ${lat}<br>Lon: ${lon}
                    `);
                });
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
            const data = await converseGeoCode(query);

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const parsedLat = parseFloat(lat);
                const parsedLon = parseFloat(lon);

                setLati(parsedLat);
                setLoni(parsedLon);
                setDireccion(display_name);
                setDireccionError?.(null);

                mapRef.current?.flyTo({ center: [parsedLon, parsedLat], zoom: 16 });

                createOrMoveMarker(parsedLon, parsedLat, `
                    <strong>Dirección:</strong><br>${display_name}<br>
                    <strong>Coordenadas:</strong><br>
                    Lat: ${parsedLat}<br>Lon: ${parsedLon}
                `);
            } else {
                setDireccionError?.("No se encontró la ubicación."); // ❌ Muestra error
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
    );
});

export default MapLibreMap;
