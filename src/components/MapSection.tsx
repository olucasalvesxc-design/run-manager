import React from 'react';
import { MapPin, Navigation, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface MapSectionProps {
  address: string;
  raceName: string;
}

const MapSection: React.FC<MapSectionProps> = ({ address, raceName }) => {
  // Em um app real, usaríamos a API do Google Maps ou Mapbox
  // Aqui simularemos um mapa estilizado dark mode
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="relative h-full min-h-[300px] bg-slate-900 overflow-hidden group">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-[#05070A]">
         {/* Grade Estilizada */}
         <div className="absolute inset-0 opacity-20" style={{ 
           backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', 
           backgroundSize: '40px 40px' 
         }} />
         
         {/* Ruas Falsas */}
         <div className="absolute top-1/2 left-0 w-full h-px bg-white/5" />
         <div className="absolute left-1/2 top-0 w-px h-full bg-white/5" />
         <div className="absolute top-1/3 left-0 w-full h-px bg-white/5 rotate-12" />
         <div className="absolute left-1/4 top-0 w-px h-full bg-white/5 -rotate-12" />

         {/* Glow central */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-[100px]" />
      </div>

      {/* Pin Central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
         <div className="relative">
            <div className="absolute inset-0 bg-[#3B82F6] rounded-full blur-xl animate-ping opacity-20" />
            <div className="w-12 h-12 bg-[#3B82F6] rounded-[1.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] transform -translate-y-2 group-hover:-translate-y-4 transition-transform duration-500 relative z-10 border-2 border-white/20">
               <MapPin className="w-6 h-6 text-white" />
            </div>
         </div>
         <div className="mt-4 bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl scale-0 group-hover:scale-100 transition-all duration-500 origin-top">
            <p className="text-[10px] font-black italic uppercase tracking-widest text-white whitespace-nowrap">{raceName}</p>
         </div>
      </div>

      {/* Overlay Info */}
      <div className="absolute bottom-6 left-6 right-6">
         <div className="bg-black/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6]" />
            
            <div className="space-y-1">
               <div className="flex items-center gap-2 text-[#3B82F6] mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">Localização Verificada</span>
               </div>
               <p className="text-white text-xs font-black uppercase tracking-widest italic">{address}</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase italic tracking-widest">PONTO DE LARGADA & ARENA</p>
            </div>

            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3B82F6] text-white px-6 py-4 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all group/btn shadow-[0_10px_20px_rgba(59,130,246,0.3)] font-bold"
            >
               <Navigation className="w-4 h-4 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
               Abrir Maps
            </a>
         </div>
      </div>

      {/* Tags */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
         <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 text-white">
            <Info className="w-3 h-3 text-[#3B82F6]" />
            Mapa Virtual
         </div>
      </div>
    </div>
  );
};

export default MapSection;
