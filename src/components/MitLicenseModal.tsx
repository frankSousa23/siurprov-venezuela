import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  X,
  ExternalLink,
  Github,
  Award,
  BookOpen,
  Terminal
} from 'lucide-react';

interface MitLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MitLicenseModal: React.FC<MitLicenseModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const mitLicenseText = `MIT License

Copyright (c) 2026 Ing. Frank Sousa (frankalfonso1988@gmail.com) y Contribuidores de SIURPROV.
Repositorio: https://github.com/frankalfonso1988/SIURPROV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

NOTA DE MENCIÓN (cortesía, no es una condición adicional de la licencia):
Se agradece que se mencione al autor original (Ing. Frank Sousa) y el
repositorio https://github.com/frankalfonso1988/SIURPROV en trabajos derivados.

RECONOCIMIENTO A MAPBIOMAS VENEZUELA:
Este proyecto utiliza y reconoce los datos geoespaciales, clasificaciones y
series históricas de cobertura y uso del suelo provistas por MapBiomas
Venezuela y la Red Amazónica de Información Socioambiental Georreferenciada
(RAISG).`;

  const gitBashCommands = `# Pasos para inicializar y publicar tu nuevo repositorio en GitHub:
git init
git add .
git commit -m "feat: SIURPROV v1.2 - Simulador Urbano de Proyección para Venezuela con MapBiomas y COVENIN 1756"
git branch -M main
git remote add origin https://github.com/frankalfonso1988/SIURPROV.git
git push -u origin main`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(key);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Licencia MIT & Atribución Científica MapBiomas
              </h3>
              <p className="text-xs text-slate-400">
                Código abierto para investigación, educación en ingeniería civil y gestión de emergencias
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs text-slate-300">
          {/* Frank Sousa Author & Repo Attribution Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 via-indigo-950/60 to-slate-950 border border-sky-600/40 flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-sky-300 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-400" />
                Mención al Autor y Repositorio Oficial
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-200 text-[10px] font-mono border border-sky-700/50">
                UNERG 2025
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Es una licencia MIT estándar. Como cortesía, se agradece <strong>mencionar al autor original y el repositorio oficial</strong> en trabajos derivados:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Autor: </span>
                <strong className="text-white">Ing. Frank Sousa</strong>
                <span className="text-slate-500"> (frankalfonso1988@gmail.com)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-400">
                <Github className="w-3.5 h-3.5" />
                <span>github.com/frankalfonso1988/SIURPROV</span>
              </div>
            </div>
          </div>

          {/* MapBiomas Venezuela Attribution Box */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Agradecimiento y Reconocimiento Formal a MapBiomas Venezuela
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-mono">
                RAISG Partner
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              SIURPROV rinde tributo y agradecimiento a la plataforma <strong>MapBiomas Venezuela</strong> y a la <strong>Red Amazónica de Información Socioambiental Georreferenciada (RAISG)</strong> por el invaluable aporte de datos abiertos multitemporales sobre cobertura y uso del suelo. Su trabajo es el cimiento para que este simulador pueda evaluar la vulnerabilidad en las cuencas y terrenos venezolanos.
            </p>
          </div>

          {/* GitHub Repo Setup Guide */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <Github className="w-4 h-4 text-sky-400" />
                Comandos de Terminal para Publicar en GitHub
              </span>
              <button
                onClick={() => copyToClipboard(gitBashCommands, 'git')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              >
                {copiedType === 'git' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Comandos</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              <pre>{gitBashCommands}</pre>
            </div>
          </div>

          {/* Full MIT License text */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs">
                Texto Oficial de la Licencia MIT (LICENSE)
              </span>
              <button
                onClick={() => copyToClipboard(mitLicenseText, 'mit')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              >
                {copiedType === 'mit' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Licencia</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {mitLicenseText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
