import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Calculator,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCode2,
  Terminal,
  BrainCircuit
} from 'lucide-react';
import { LEARNING_CURRICULUM } from '../data/learningCurriculum';

export const CivilEngineeringLab: React.FC = () => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(LEARNING_CURRICULUM[0].id);
  const activeLesson = LEARNING_CURRICULUM.find((l) => l.id === selectedLessonId) || LEARNING_CURRICULUM[0];

  // State for the interactive formula variables
  const [varValues, setVarValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    activeLesson.interactiveVariables.forEach((v) => {
      initial[v.id] = v.defaultValue;
    });
    return initial;
  });

  // Re-initialize variables when changing lesson
  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const newLesson = LEARNING_CURRICULUM.find((l) => l.id === lessonId);
    if (newLesson) {
      const initial: Record<string, number> = {};
      newLesson.interactiveVariables.forEach((v) => {
        initial[v.id] = v.defaultValue;
      });
      setVarValues(initial);
    }
  };

  const handleVarChange = (id: string, val: number) => {
    setVarValues((prev) => ({ ...prev, [id]: val }));
  };

  const computedResult = activeLesson.compute(varValues);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
              <span>Escuela SIURPROV: Laboratorio de Ingeniería Civil & Código</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold">
                Plan 3 Días / Semana
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Aprende simultáneamente la física sismorresistente venezolana y los algoritmos en TypeScript
            </p>
          </div>
        </div>

        {/* Lesson Category Navigator */}
        <div className="flex flex-wrap items-center gap-1.5">
          {LEARNING_CURRICULUM.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                selectedLessonId === lesson.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lesson.title.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Civil Engineering Concept & Step-by-Step Calculator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Lesson Overview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  Módulo: {activeLesson.category} | Nivel: {activeLesson.difficulty}
                </span>
                <h4 className="text-lg font-bold text-slate-100 mt-0.5">
                  {activeLesson.title}
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeLesson.summary}
            </p>

            {/* Formula Box */}
            <div className="p-3.5 rounded-lg bg-slate-900 border border-indigo-900/40 flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Fórmula Fundamental:
              </span>
              <div className="font-mono text-base font-bold text-indigo-300 bg-slate-950/80 p-2.5 rounded-md border border-slate-800 text-center tracking-wide">
                {activeLesson.formulaLatex}
              </div>
              <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed pt-1">
                {activeLesson.formulaExplanation}
              </pre>
            </div>
          </div>

          {/* Interactive Calculator Workbench */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Banco de Cálculo Interactivo (Ajuste los Parámetros)
              </span>
              <span className="text-[11px] text-slate-400">Pruébelo en tiempo real</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeLesson.interactiveVariables.map((v) => (
                <div key={v.id} className="flex flex-col gap-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-200">{v.label}</span>
                    <span className="font-mono font-bold text-sky-400">
                      {varValues[v.id] ?? v.defaultValue} {v.unit !== 'adimensional' && v.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={v.min}
                    max={v.max}
                    step={v.step}
                    value={varValues[v.id] ?? v.defaultValue}
                    onChange={(e) => handleVarChange(v.id, parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">{v.description}</span>
                </div>
              ))}
            </div>

            {/* Live Arithmetic Computation Card */}
            <div
              className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
                computedResult.status === 'Falla Estructural'
                  ? 'bg-red-950/40 border-red-800 text-red-200'
                  : computedResult.status === 'Alerta'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Resultado del Cálculo:
                </span>
                <span className="font-mono font-bold text-sm">
                  {computedResult.formatted}
                </span>
              </div>

              <p className="text-xs leading-relaxed">{computedResult.explanation}</p>

              {/* Step by step arithmetic breakdown */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Paso a paso matemático:
                </span>
                {computedResult.steps.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col text-xs bg-slate-950/70 p-2 rounded border border-slate-800"
                  >
                    <span className="font-semibold text-slate-200">{s.step}</span>
                    <span className="font-mono text-indigo-300 text-[11px] mt-0.5">
                      {s.calculation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: TypeScript Implementation & 1-Year Study Plan (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Code Inspector */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-sky-400" />
                Cómo se Programa en TypeScript
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Clean Code</span>
            </div>

            <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>engine.ts</span>
              </div>
              <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                {activeLesson.codeSnippet}
              </pre>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Explicación de Programación:</strong> {activeLesson.codeExplanation}
            </p>
          </div>

          {/* Dedicated 1-Year Study Plan for the User */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Ruta de Desarrollo (1 Año: 3 Días/Sem x 2h)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Metodología Frank</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <strong className="text-sky-300">Día 1: Geotecnia & MapBiomas</strong>
                  <span className="text-[10px] text-slate-500 font-mono">2 Horas</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Lectura de rásteres satelitales, clasificación de coberturas de suelo, coeficientes C y mecánica de suelos COVENIN (S1 a S4).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <strong className="text-emerald-300">Día 2: Dinámica Estructural COVENIN 1756</strong>
                  <span className="text-[10px] text-slate-500 font-mono">2 Horas</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Espectros de aceleración, cálculo de cortante basal, derivas de entrepiso y criterios de diseño columna fuerte - viga débil.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <strong className="text-indigo-300">Día 3: Programación TypeScript & Simulación</strong>
                  <span className="text-[10px] text-slate-500 font-mono">2 Horas</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Renderizado en Canvas HTML5, bucles de física numérica (Euler/Verlet), matrices de rigidez y arquitectura modular de software libre.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Con este ritmo sostenido de 6 horas semanales, dominarás tanto la base técnica para ejercer y auditar ingeniería civil en Venezuela como la capacidad de programar simuladores científicos de clase mundial.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
