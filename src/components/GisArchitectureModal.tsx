import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Globe2,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  ExternalLink,
  BookOpen,
  Sparkles,
  FileCode,
  Download,
  Terminal,
  Cpu
} from 'lucide-react';

interface GisArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GisArchitectureModal: React.FC<GisArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'pipeline' | 'qgis'>('comparison');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col text-slate-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Arquitectura Geoespacial: Open Source vs GEE vs ArcGIS</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Guía para Frank Sousa
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cómo estructurar el ecosistema de mapas libres, procesamiento satelital y simulación física en Venezuela
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'comparison'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ¿Por qué NO ArcGIS? (Comparativa)
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'pipeline'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Google Earth Engine + MapBiomas
          </button>
          <button
            onClick={() => setActiveTab('qgis')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'qgis'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QGIS & Formato Abierto GeoJSON
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6 text-xs text-slate-300">
          {/* TAB 1: Comparison between Open Source, GEE and ArcGIS */}
          {activeTab === 'comparison' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-300">
                <h4 className="font-bold text-sm text-slate-100 mb-1">
                  Respuesta a tu duda sobre herramientas de mapas:
                </h4>
                <p>
                  Para un proyecto de código abierto como <strong>SIURPROV</strong>, no depender de plataformas cerradas es vital. Aquí tienes la radiografía exacta de por qué el camino abierto es el superior:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* ArcGIS (Esri) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-red-900/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-red-400">ArcGIS (Esri)</span>
                    <Lock className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 self-start">
                    Software Privativo
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-400 pt-1">
                    <li>❌ Licencias comerciales muy costosas ($1,500 - $10,000/año).</li>
                    <li>❌ Formatos cerrados y dependencia de servidores externos.</li>
                    <li>❌ Si se cae la conexión o caduca la licencia, tu software deja de funcionar.</li>
                    <li>❌ No permite auditoría de código abierto por la comunidad.</li>
                  </ul>
                </div>

                {/* Google Earth Engine (GEE) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-400">Google Earth Engine</span>
                    <Globe2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 self-start">
                    Nube de Supercómputo Satelital
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-400 pt-1">
                    <li>✅ Acceso libre para investigación y proyectos de impacto público.</li>
                    <li>✅ Procesa petabytes de imágenes Landsat y Sentinel en segundos.</li>
                    <li>✅ Es la plataforma oficial donde corre <strong>MapBiomas Venezuela</strong>.</li>
                    <li>⭐ Su función es el <strong>backend satelital</strong> (exportar capas).</li>
                  </ul>
                </div>

                {/* Open Source Web GIS (SIURPROV) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-sky-800/80 flex flex-col gap-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-sky-400">SIURPROV (Web GIS Libre)</span>
                    <Unlock className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 self-start">
                    100% Abierto & Offline
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 pt-1">
                    <li>✅ Funciona sin internet una vez cargado (ideal para cortes eléctricos).</li>
                    <li>✅ Cero costos de licencia: corre en tu navegador o localmente.</li>
                    <li>✅ Integra física de ingeniería civil en tiempo real (COVENIN 1756).</li>
                    <li>✅ Exporta a <strong>GeoJSON estándar</strong> compatible con QGIS.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEE + MapBiomas Pipeline */}
          {activeTab === 'pipeline' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  ¿Cómo funciona el flujo MapBiomas ➔ Google Earth Engine ➔ SIURPROV?
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  MapBiomas Venezuela no inventó los satélites: utiliza la constelación <strong>Landsat (NASA/USGS)</strong> y <strong>Sentinel-2 (ESA)</strong>. Los algoritmos de clasificación de cobertura vegetal y uso del suelo corren en los servidores de <strong>Google Earth Engine</strong>.
                </p>
              </div>

              {/* Step pipeline */}
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-100">Captura Satelital (Landsat/Sentinel)</strong>
                    <p className="text-[11px] text-slate-400">
                      Fotografías multiespectrales de Venezuela tomadas cada 5-16 días desde 1985 hasta el presente.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-100">Clasificación en Google Earth Engine (GEE)</strong>
                    <p className="text-[11px] text-slate-400">
                      Algoritmos Random Forest clasifican cada píxel de 30m en bosque, sabana, mancha urbana consolidada, asentamiento en ladera o agua.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-100">Integración en SIURPROV (Cliente Navegador)</strong>
                    <p className="text-[11px] text-slate-400">
                      SIURPROV toma esos índices históricos, proyecta escenarios futuros (2030-2050), calcula el coeficiente de escorrentía $C$ y evalúa si una edificación resistirá o colapsará.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QGIS and GeoJSON integration */}
          {activeTab === 'qgis' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-sm text-sky-400 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  QGIS: El Software Libre de Referencia para tus Mapas en Local
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cuando estés en tu computadora local y con electricidad, instala <strong>QGIS (Quantum GIS)</strong> desde <code className="text-sky-300">qgis.org</code>. Es el estándar mundial libre (equivalente gratuito y superior a ArcGIS).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/60 flex flex-col gap-2">
                <strong className="text-indigo-200">Compatibilidad con GeoJSON:</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Todas las construcciones que detectes o coloques en SIURPROV se pueden exportar con el botón <strong>"Exportar GeoJSON"</strong>. Ese archivo lo puedes arrastrar directamente a QGIS o subirlo a GitHub, y se mostrará como un mapa interactivo con todos los cálculos de deriva y daño sismorresistente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">Diseñado con tecnología libre soberana para Venezuela</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
