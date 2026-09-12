import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { selectedPinIcon } from "../map/markerIcon";
import { FiXCircle } from "react-icons/fi";

export default function MapModal({ isOpen, onClose, latitude, longitude, locationLabel }) {
  if (!isOpen || !latitude || !longitude) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div>
            <h3 className="text-base font-bold text-[#14233b]">Location Map</h3>
            <p className="text-xs text-slate-400">{locationLabel || "Complaint location"}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiXCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Full Map */}
        <div className="h-[calc(100%-4rem)]">
          <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={selectedPinIcon} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
