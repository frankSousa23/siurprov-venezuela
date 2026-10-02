import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  ShieldCheck,
  X,
  Copy,
  Check,
  RefreshCw,
  Building,
  MapPin,
  Calendar,
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';
import {
  BuildingTypology,
  MapBuilding,
  MultiHazardParameters,
  SimulationResult,
  SoilProfile,
  SoilProfileType,
  VenezuelaRegion
} from '../types';
import { SiurprovStudyPackage, StudyStorageService } from '../services/studyStorage';
import { SecuritySanitizer } from '../services/securitySanitizer';
import { VENEZUELA_REGIONS } from '../data/venezuelaRegions';
import { BUILDING_TYPOLOGIES } from '../data/buildingTypologies';
import { SOIL_PROFILES } from '../data/soilProfiles';

interface StudyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRegion: VenezuelaRegion;
  currentYear: number;
  currentTypology: BuildingTypology;
  currentSoilProfile: SoilProfile;
  currentScenario: MultiHazardParameters;
  currentUserBuildings: MapBuilding[];
  currentSimulationResult?: SimulationResult;
  onLoadStudy: (pkg: SiurprovStudyPackage) => void;
}

export const StudyManagerModal: React.FC<StudyManagerModalProps> = ({
  isOpen,
  onClose,
  currentRegion,
  currentYear,
  currentTypology,
  currentSoilProfile,
  currentScenario,
  currentUserBuildings,
  currentSimulationResult,
  onLoadStudy
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'preloaded' | 'library'>('export');
  
  // Export State
  const [exportTitle, setExportTitle] = useState(`Estudio Territorial - ${currentRegion.name}`);
  const [exportDesc, setExportDesc] = useState(`Evaluación de vulnerabilidad sísmica y aluvional proyectada para el año ${currentYear}.`);
  const [copiedShareToken, setCopiedShareToken] = useState(false);

  // Import State
  const [importedContent, setImportedContent] = useState('');
  const [importStatus, setImportStatus] = useState<{
    valid?: boolean;
    message?: string;
    pkg?: SiurprovStudyPackage;
    checksumStatus?: 'VERIFIED' | 'MISSING' | 'INVALID';
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved Library State
  const [localLibrary, setLocalLibrary] = useState<SiurprovStudyPackage[]>(() => StudyStorageService.getLocalLibrary());

  if (!isOpen) return null;

  // Generar paquete actual
  const currentStudyPackage = StudyStorageService.createStudyPackage(
    exportTitle,
    exportDesc,
    currentRegion,
    currentYear,
    currentTypology.id,
    currentSoilProfile.type,
    currentScenario,
    currentUserBuildings,
    currentSimulationResult
  );

  const handleDownloadFile = () => {
    StudyStorageService.downloadStudyFile(currentStudyPackage);
    StudyStorageService.saveStudyToLocalLibrary(currentStudyPackage);
    setLocalLibrary(StudyStorageService.getLocalLibrary());
  };

  const handleCopyShareToken = () => {
    const token = StudyStorageService.exportToShareableString(currentStudyPackage);
    navigator.clipboard.writeText(token);
    setCopiedShareToken(true);
    setTimeout(() => setCopiedShareToken(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportedContent(text);
      validateAndProcessImport(text);
    };
    reader.readAsText(file);
  };

  const validateAndProcessImport = (content: string) => {
    let result;
    if (content.trim().startsWith('{')) {
      result = StudyStorageService.parseStudyFile(content);
    } else {
      result = StudyStorageService.importFromShareableString(content);
    }

    if (result.success && result.package) {
      setImportStatus({
        valid: true,
        pkg: result.package,
        checksumStatus: result.checksumStatus,
        message: 'Estudio verificado correctamente. Listo para cargar al simulador.'
      });
    } else {
      setImportStatus({
        valid: false,
        message: result.error || 'Error al validar el archivo de estudio.'
      });
    }
  };

  const handleApplyImportedStudy = (pkg: SiurprovStudyPackage) => {
    onLoadStudy(pkg);
    StudyStorageService.saveStudyToLocalLibrary(pkg);
    setLocalLibrary(StudyStorageService.getLocalLibrary());
    onClose();
  };

  const handleDeleteFromLibrary = (title: string) => {
    StudyStorageService.deleteStudyFromLocalLibrary(title);
    setLocalLibrary(StudyStorageService.getLocalLibrary());
  };

  const preloadedStudies = StudyStorageService.getPreloadedStudies();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Gestor de Estudios Territoriales (.siurprov)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Portabilidad Abierta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guarda, exporta, importa y comparte estudios completos entre sistemas locales y de nube sin pérdidas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'export'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportar Estudio Actual
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'import'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Cargar / Abrir Estudio
          </button>
          <button
            onClick={() => setActiveTab('preloaded')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'preloaded'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Estudios Emblemáticos de Venezuela
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'library'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Biblioteca Local ({localLibrary.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-200 text-xs sm:text-sm">
          
          {/* TAB 1: EXPORTAR */}
          {activeTab === 'export' && (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  Metadatos del Estudio a Exportar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Título del Estudio</label>
                    <input
                      type="text"
                      value={exportTitle}
                      onChange={(e) => setExportTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">Región & Año</label>
                    <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      {currentRegion.name} ({currentYear})
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">Descripción / Observaciones Técnicas</label>
                  <textarea
                    rows={2}
                    value={exportDesc}
                    onChange={(e) => setExportDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
              </div>

              {/* Contenido del Paquete */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col gap-2.5">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Resumen del Paquete .siurprov generado:</span>
                  <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Checksum: {currentStudyPackage.metadata.checksum}
                  </span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="block text-slate-500 text-[10px]">Edificaciones</span>
                    <span className="font-bold text-white text-xs">{currentUserBuildings.length} colocadas</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="block text-slate-500 text-[10px]">Amenaza Sísmica</span>
                    <span className="font-bold text-white text-xs">
                      {currentScenario.earthquake.enabled ? `PGA ${currentScenario.earthquake.pgaG}g` : 'Desactivado'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="block text-slate-500 text-[10px]">Alud / Deslave</span>
                    <span className="font-bold text-white text-xs">
                      {currentScenario.debrisFlow.enabled ? `${currentScenario.debrisFlow.rainfallAccumulation24hMm}mm/24h` : 'Desactivado'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="block text-slate-500 text-[10px]">Daño Estimado</span>
                    <span className="font-bold text-amber-400 text-xs">
                      {currentSimulationResult?.ems98Grade.split(':')[0] || 'Calculado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleDownloadFile}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition shadow-lg shadow-sky-900/30"
                >
                  <Download className="w-4 h-4" />
                  Descargar Archivo de Estudio (.siurprov)
                </button>
                <button
                  onClick={handleCopyShareToken}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                  title="Copia el token Base64 para enviar por WhatsApp, correo o pegar en otro SIURPROV"
                >
                  {copiedShareToken ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <span>Copiar Código Portátil</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
                <span>
                  <strong>Atribución y Licencia MIT:</strong> Este archivo incluye la firma del Ing. Frank Sousa (UNERG 2025) y el enlace oficial al repositorio. Se puede abrir libremente en cualquier otra instancia de SIURPROV local o en la nube.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORTAR / CARGAR */}
          {activeTab === 'import' && (
            <div className="flex flex-col gap-5">
              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl bg-slate-950/50 hover:bg-slate-900/80 transition cursor-pointer flex flex-col items-center justify-center gap-3 text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".siurprov,.json"
                  className="hidden"
                />
                <div className="p-3 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Haga clic o arrastre un archivo .siurprov o .json aquí</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Compatible con estudios generados por SIURPROV en cualquier entorno
                  </p>
                </div>
              </div>

              {/* O Pegar Código Base64 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-medium">O pegue el código de texto / Base64 recibido:</label>
                <textarea
                  rows={3}
                  value={importedContent}
                  onChange={(e) => {
                    setImportedContent(e.target.value);
                    if (e.target.value.trim().length > 10) {
                      validateAndProcessImport(e.target.value);
                    }
                  }}
                  placeholder="Pegue aquí el contenido JSON o token Base64..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Estado de Validación */}
              {importStatus && (
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    importStatus.valid
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {importStatus.valid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Estudio Válido: {importStatus.pkg?.metadata.title}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>Error en el archivo</span>
                        </>
                      )}
                    </div>
                    {importStatus.checksumStatus && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          importStatus.checksumStatus === 'VERIFIED'
                            ? 'bg-emerald-900 text-emerald-300'
                            : 'bg-amber-900 text-amber-300'
                        }`}
                      >
                        Checksum: {importStatus.checksumStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-90">{importStatus.message}</p>

                  {importStatus.valid && importStatus.pkg && (
                    <div className="mt-2 pt-2 border-t border-emerald-900/50 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-300">
                        <span>Región: <strong>{importStatus.pkg.studyData.regionName}</strong></span> |{' '}
                        <span>Año: <strong>{importStatus.pkg.studyData.selectedYear}</strong></span> |{' '}
                        <span>Edificaciones: <strong>{importStatus.pkg.studyData.userPlacedBuildings.length}</strong></span>
                      </div>
                      <button
                        onClick={() => handleApplyImportedStudy(importStatus.pkg!)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
                      >
                        Cargar Estudio al Simulador
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ESTUDIOS EMBLEMÁTICOS PRECARGADOS */}
          {activeTab === 'preloaded' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-400">
                Selecciona uno de los escenarios históricos y prospectivos emblemáticos de Venezuela calibrados según COVENIN 1756 y series temporales de MapBiomas:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {preloadedStudies.map((study, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/60 transition flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-sky-950 text-sky-400 border border-sky-800">
                          {study.studyData.regionName.split('(')[0]}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Año {study.studyData.selectedYear}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-sky-300 transition">
                        {study.metadata.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {study.metadata.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 font-semibold">
                        {study.studyData.computedEvaluationSummary?.ems98Grade.split(':')[0] || 'Vulnerabilidad'}
                      </span>
                      <button
                        onClick={() => handleApplyImportedStudy(study)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-semibold transition"
                      >
                        Abrir Escenario
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BIBLIOTECA LOCAL */}
          {activeTab === 'library' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Estudios guardados en la memoria local de tu navegador ({localLibrary.length} guardados):
                </p>
                {localLibrary.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('siurprov_saved_studies_library');
                      setLocalLibrary([]);
                    }}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Vaciar Biblioteca
                  </button>
                )}
              </div>

              {localLibrary.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl bg-slate-950/40">
                  No hay estudios guardados en la biblioteca local todavía. Exporta un estudio para guardarlo aquí.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {localLibrary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="font-bold text-white text-xs">{item.metadata.title}</h5>
                        <p className="text-[11px] text-slate-400">
                          {item.studyData.regionName} | {new Date(item.metadata.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplyImportedStudy(item)}
                          className="px-3 py-1 rounded bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500"
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => StudyStorageService.downloadStudyFile(item)}
                          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                          title="Descargar"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFromLibrary(item.metadata.title)}
                          className="p-1.5 rounded bg-slate-800 text-rose-400 hover:bg-rose-950"
                          title="Eliminar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Formato Estándar SIURPROV v1.3</span>
            <span>•</span>
            <span>Inmune a censura & Conexión Nube/Local</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
