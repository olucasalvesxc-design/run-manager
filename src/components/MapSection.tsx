import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface MapSectionProps {
  location: string;
}

const MapSection: React.FC<MapSectionProps> = ({ location }) => {
  const encodedLocation = encodeURIComponent(location);
  // Using the standard embed URL which works without an API key for search/place display
  const mapsUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const externalLink = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

  return (
    <div className="w-full bg-slate-900 border border-white/5 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
            <MapPin className="text-yellow-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-white italic uppercase tracking-tighter">Localização do Evento</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{location}</p>
          </div>
        </div>
        
        <a 
          href={externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:text-yellow-300 transition-colors bg-slate-950 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ExternalLink className="w-3 h-3" />
          Ver no Google Maps
        </a>
      </div>

      <div className="w-full h-[300px] md:h-[450px] relative bg-slate-950">
         <iframe 
            width="100%" 
            height="100%" 
            title="Mapa da Localização"
            frameBorder="0" 
            style={{ 
              border: 0, 
              filter: 'grayscale(1) invert(0.9) opacity(0.8) contrast(1.1)',
            }} 
            src={mapsUrl} 
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5"></div>
      </div>
    </div>
  );
};

export default MapSection;
