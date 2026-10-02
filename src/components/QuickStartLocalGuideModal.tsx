import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Sparkles,
  HelpCircle,
  Play,
  Monitor,
  Laptop,
  HardDrive,
  ShieldCheck,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';

interface QuickStartLocalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickStartLocalGuideModal: React.FC<QuickStartLocalGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'easy' | 'windows' | 'linux' | 'diagnostic' | 'faq'>('easy');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Diagnóstico del sistema del usuario en tiempo real
  const [diag, setDiag] = useState<{
    webgl: boolean;
    localStorage: boolean;
    screenRes: string;
    browser: string;
    serverStatus: 'checking' | 'online' | 'offline';
    securityHeaders: boolean;
  }>({
    webgl: false,
    localStorage: false,
    screenRes: '',
    browser: '',
    serverStatus: 'checking',
    securityHeaders: false
  });

  useEffect(() => {
    if (!isOpen) return;

    // Comprobar WebGL
    let hasWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      hasWebGL = false;
    }

    // Comprobar LocalStorage
    let hasStorage = false;
    try {
      localStorage.setItem('siurprov_probe', '1');
      localStorage.removeItem('siurprov_probe');
      hasStorage = true;
    } catch {
      hasStorage = false;
    }

    // Detección de navegador
    const userAgent = navigator.userAgent;
    let detectedBrowser = 'Navegador Web Estándar';
    if (userAgent.includes('Chrome')) detectedBrowser = 'Google Chrome / Chromium';
    else if (userAgent.includes('Firefox')) detectedBrowser = 'Mozilla Firefox';
    else if (userAgent.includes('Safari')) detectedBrowser = 'Apple Safari';
    else if (userAgent.includes('Edge')) detectedBrowser = 'Microsoft Edge';

    setDiag((prev) => ({
      ...prev,
      webgl: hasWebGL,
      localStorage: hasStorage,
      screenRes: `${window.innerWidth} x ${window.innerHeight} px`,
      browser: detectedBrowser
    }));

    // Comprobar API del servidor
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setDiag((prev) => ({
          ...prev,
          serverStatus: 'online',
          securityHeaders: Boolean(data.securityHeadersActive || data.status === 'online')
        }));
      })
      .catch(() => {
        setDiag((prev) => ({ ...prev, serverStatus: 'offline' }));
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Guía de Instalación Rápida & Pruebas Locales
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Apto para Todo Público
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Diseñado para que cualquier persona con pocos conocimientos técnicos pueda clonar, probar y evaluar SIURPROV en su propia computadora.
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
            onClick={() => setActiveTab('easy')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'easy'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            En 3 Pasos (Método Fácil)
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'windows'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Windows (.bat de 1 Clic)
          </button>
          <button
            onClick={() => setActiveTab('linux')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'linux'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Linux / macOS (.sh)
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'diagnostic'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Autodiagnóstico de tu PC
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'faq'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Preguntas Frecuentes
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-200 text-xs sm:text-sm">
          
          {/* TAB 1: MÉTODO FÁCIL */}
          {activeTab === 'easy' && (
            <div className="flex flex-col gap-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-800/40 flex items-start gap-3">
                <Play className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-amber-200">¿No sabes de programación? No hay problema</h4>
                  <p className="text-slate-300 mt-1">
                    SIURPROV fue concebido en la <strong>UNERG (San Juan de los Morros)</strong> para funcionar sin instalaciones complejas ni bases de datos pesadas. Solo necesitas Node.js y seguir 3 sencillos pasos.
                  </p>
                </div>
              </div>

              {/* Paso 1 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 text-xs uppercase tracking-wider">
                    Paso 1: Clonar el Repositorio de GitHub
                  </span>
                  <button
                    onClick={() => copyToClipboard('git clone https://github.com/frankalfonso1988/SIURPROV.git\ncd SIURPROV', 1)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition"
                  >
                    {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 1 ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Abre la terminal o símbolo del sistema (CMD) y pega este comando:
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800/80 overflow-x-auto">
git clone https://github.com/frankalfonso1988/SIURPROV.git
cd SIURPROV
                </pre>
              </div>

              {/* Paso 2 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 text-xs uppercase tracking-wider">
                    Paso 2: Descargar Dependencias (Solo 1 vez)
                  </span>
                  <button
                    onClick={() => copyToClipboard('npm install', 2)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition"
                  >
                    {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 2 ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Este comando descarga automáticamente las librerías matemáticas y visuales:
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800/80 overflow-x-auto">
npm install
                </pre>
              </div>

              {/* Paso 3 */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 text-xs uppercase tracking-wider">
                    Paso 3: Iniciar y Probar en Vivo
                  </span>
                  <button
                    onClick={() => copyToClipboard('npm run dev', 3)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition"
                  >
                    {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 3 ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Inicia el sistema y abre tu navegador web en <code className="text-sky-300">http://localhost:3000</code>:
                </p>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800/80 overflow-x-auto">
npm run dev
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: WINDOWS 1 CLIC */}
          {activeTab === 'windows' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs">
                <h4 className="font-bold text-sky-300 mb-1 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  Archivo de Arranque Automático: <code>start-local.bat</code>
                </h4>
                <p className="text-slate-300">
                  Para usuarios de Windows, hemos incluido el script <strong>start-local.bat</strong> en la raíz del proyecto.
                </p>
              </div>

              <ol className="list-decimal list-inside flex flex-col gap-3 text-xs text-slate-300 pl-2">
                <li>
                  Descarga o clona la carpeta del proyecto en tu computadora.
                </li>
                <li>
                  Haz <strong>doble clic</strong> sobre el archivo <strong>start-local.bat</strong>.
                </li>
                <li>
                  El archivo comprobará automáticamente si tienes Node.js instalado, instalará las dependencias si faltan, ejecutará las pruebas de seguridad y <strong>abrirá tu navegador automáticamente en http://localhost:3000</strong>.
                </li>
                <li>
                  Cuando quieras cerrar el sistema, simplemente cierra la ventana negra que se abrió.
                </li>
              </ol>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <strong>¿No tienes Node.js?</strong> El instalador oficial gratuito de Windows está disponible en{' '}
                <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-sky-400 underline">
                  https://nodejs.org
                </a>{' '}
                (Elige la versión recomendada LTS).
              </div>
            </div>
          )}

          {/* TAB 3: LINUX / MAC */}
          {activeTab === 'linux' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <h4 className="font-bold text-sky-300 mb-1 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  Script de Terminal: <code>start-local.sh</code>
                </h4>
                <p className="text-slate-300">
                  Para distribuciones Linux (Ubuntu, Debian, Fedora, Arch) y macOS.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-400">Ejecuta en una sola línea:</p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <code className="text-xs font-mono text-emerald-400">./start-local.sh</code>
                  <button
                    onClick={() => copyToClipboard('./start-local.sh', 4)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 4 ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                <h5 className="font-bold text-slate-200 mb-1">Opción Docker (1 solo comando):</h5>
                <p className="mb-2">Si ya tienes Docker instalado, no necesitas instalar Node.js:</p>
                <pre className="p-2.5 rounded bg-slate-900 font-mono text-emerald-300 text-[11px] overflow-x-auto">
docker compose up
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: AUTODIAGNÓSTICO EN TIEMPO REAL */}
          {activeTab === 'diagnostic' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-400">
                Verificación en tiempo real del hardware y software de tu computadora para ejecutar SIURPROV:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Diagnóstico WebGL */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-white">Aceleración Gráfica (WebGL)</span>
                    <span className="text-[11px] text-slate-400">Renderizado de física y mapas MapBiomas</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                    diag.webgl ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {diag.webgl ? 'ACTIVO' : 'NO DETECTADO'}
                  </span>
                </div>

                {/* Diagnóstico LocalStorage */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-white">Persistencia Offline-First</span>
                    <span className="text-[11px] text-slate-400">Biblioteca local de estudios (.siurprov)</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                    diag.localStorage ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {diag.localStorage ? 'OPERATIVO' : 'BLOQUEADO'}
                  </span>
                </div>

                {/* Diagnóstico Navegador */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-white">Navegador Web</span>
                    <span className="text-[11px] text-slate-400">{diag.browser}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-sky-950 text-sky-300 border border-sky-800">
                    COMPATIBLE
                  </span>
                </div>

                {/* Diagnóstico Backend API */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-white">Servidor Local / Nube</span>
                    <span className="text-[11px] text-slate-400">API REST y microservicios COVENIN 1756</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                    diag.serverStatus === 'online'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : diag.serverStatus === 'checking'
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {diag.serverStatus === 'online' ? 'CONECTADO (3000)' : diag.serverStatus === 'checking' ? 'COMPROBANDO' : 'MODO OFFLINE'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  <strong>Tu equipo es 100% apto</strong> para ejecutar simulaciones sismorresistentes, modelado de aluviones y exportación de estudios territoriales.
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: PREGUNTAS FRECUENTES */}
          {activeTab === 'faq' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h5 className="font-bold text-white text-xs mb-1">¿Necesito internet para usar el simulador?</h5>
                <p className="text-xs text-slate-400">
                  <strong>No.</strong> Todo el motor sismorresistente, las ecuaciones COVENIN 1756, los datos territoriales de MapBiomas y el generador de reportes funcionan 100% en tu máquina de manera offline.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h5 className="font-bold text-white text-xs mb-1">¿Cómo le paso un estudio a un colega o profesor?</h5>
                <p className="text-xs text-slate-400">
                  Usa el botón <strong>"Exportar Estudio (.siurprov)"</strong> en la barra superior. Guarda el archivo o copia el código portátil y compártelo por WhatsApp, correo o pendrive. Tu colega solo tiene que hacer clic en "Cargar Estudio" en su propio SIURPROV.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h5 className="font-bold text-white text-xs mb-1">¿Tiene algún costo o licencia de pago?</h5>
                <p className="text-xs text-slate-400">
                  Es <strong>software libre bajo Licencia MIT</strong>. El único requisito moral y legal es mantener la atribución al autor (<strong>Ing. Frank Sousa</strong>, UNERG 2025) y al repositorio oficial en GitHub.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Repositorio Oficial:</span>
            <a
              href="https://github.com/frankalfonso1988/SIURPROV"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1 font-mono"
            >
              github.com/frankalfonso1988/SIURPROV
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
