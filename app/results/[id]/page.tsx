'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { RotateCcw, Download, ChevronLeft } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Tu componente RadarChartSVG (ya lo tienes, lo mantengo igual)
const RadarChartSVG = ({ data, size = 700 }) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.28;
  const maxValue = 5;
  
  const points = data.map((item, index) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const value = item.value / maxValue;
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);
    return { x, y, angle, label: item.dimension, value: item.value };
  });
  
  const gridCircles = [1, 2, 3, 4, 5].map(level => (
    <circle
      key={level}
      cx={centerX}
      cy={centerY}
      r={(radius * level) / maxValue}
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="1.5"
      opacity="0.8"
    />
  ));
  
  const gridLines = data.map((_, index) => {
    const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const endX = centerX + radius * Math.cos(angle);
    const endY = centerY + radius * Math.sin(angle);
    return (
      <line
        key={index}
        x1={centerX}
        y1={centerY}
        x2={endX}
        y2={endY}
        stroke="#cbd5e1"
        strokeWidth="1.5"
        opacity="0.6"
      />
    );
  });
  
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  
  const labels = points.map((point, index) => {
    const labelAngle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
    const labelRadius = radius + 80;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);
    
    let lines = [];
    if (point.label.includes('Individual - Interior')) {
      lines = ['Individual', 'Interior'];
    } else if (point.label.includes('Individual - Exterior')) {
      lines = ['Individual', 'Exterior'];
    } else if (point.label.includes('Colectivo - Interior')) {
      lines = ['Colectivo', 'Interior'];
    } else if (point.label.includes('Colectivo - Exterior')) {
      lines = ['Colectivo', 'Exterior'];
    }
    
    return (
      <g key={index}>
        {lines.map((line, lineIndex) => (
          <text
            key={lineIndex}
            x={labelX}
            y={labelY + (lineIndex - lines.length/2 + 0.5) * 16}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            className="text-xs sm:text-sm font-medium tracking-wide"
            fill="#64748b"
          >
            {line}
          </text>
        ))}
        <text
          x={labelX}
          y={labelY + lines.length * 8 + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fill="#1e293b"
          className="font-semibold"
        >
          {point.value.toFixed(1)}
        </text>
      </g>
    );
  });
  
  return (
   <div className="flex justify-center w-full">
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 720 720" 
        className="drop-shadow-sm max-w-full h-auto"
        style={{ aspectRatio: '1 / 1' }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.05"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(60, 60)">
          {gridCircles}
          {gridLines}
          <polygon
            points={polygonPoints}
            fill="url(#chartGradient)"
            stroke="#3b82f6"
            strokeWidth="2"
            filter="url(#glow)"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#1e40af"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}
          {labels}
          
          {[1, 2, 3, 4, 5].map(level => (
            <text
              key={level}
              x={centerX + 8}
              y={centerY - (radius * level) / maxValue}
              fontSize="10"
              fill="#94a3b8"
              dominantBaseline="middle"
              className="font-medium"
            >
              {level}
            </text>
          ))}
        </g>
      </svg>
    </div>
  </div>  
  );
};

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAssessment()
    }
  }, [params.id])

  const fetchAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        setError('Resultados no encontrados')
        return
      }

      setAssessment(data)
    } catch (err) {
      setError('Error al cargar resultados')
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    if (typeof window === 'undefined') return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Importar html2pdf dinámicamente
      const html2pdf = (await import('html2pdf.js')).default;
      const results = assessment.results;
      const currentDate = new Date().toLocaleDateString('es-ES');
      
      // Crear imagen del gráfico usando canvas
      const createChartCanvas = (data) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 600;
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.28;
        const maxValue = 5;
        
        canvas.width = size;
        canvas.height = size;
        
        if (!ctx) return '';
        
        // Fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        
        // Calcular puntos
        const points = data.map((item, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const value = item.value / maxValue;
          const x = centerX + radius * value * Math.cos(angle);
          const y = centerY + radius * value * Math.sin(angle);
          return { x, y, angle, label: item.dimension, value: item.value };
        });
        
        // Dibujar círculos de la cuadrícula
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        [1, 2, 3, 4, 5].forEach(level => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, (radius * level) / maxValue, 0, 2 * Math.PI);
          ctx.stroke();
        });
        
        // Dibujar líneas de la cuadrícula
        data.forEach((_, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const endX = centerX + radius * Math.cos(angle);
          const endY = centerY + radius * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        });
        
        // Dibujar polígono de datos
        ctx.beginPath();
        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Dibujar puntos
        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#1e40af';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        
        return canvas.toDataURL('image/png', 1.0);
      };
      
      const chartImageData = createChartCanvas(results.quadrantAverages);
      
      // Función auxiliar para obtener colores del perfil
      const getProfileColorForPDF = (color) => {
        const colorMap = {
          "Rojo": "#dc2626, #b91c1c",
          "Ámbar": "#d97706, #b45309", 
          "Naranja": "#ea580c, #c2410c",
          "Verde": "#16a34a, #15803d",
          "Teal": "#0d9488, #0f766e"
        };
        return colorMap[color] || "#3b82f6, #1d4ed8";
      };
      
      // Crear el contenido HTML del PDF
      const pdfContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
            <h1 style="color: #1e293b; font-size: 28px; margin-bottom: 10px; font-weight: 300;">
              Evaluación personal
            </h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Perfil Evolutivo Organizacional - ${currentDate}
            </p>
          </div>

          <div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; font-weight: 500;">
              Información personal
            </h2>
            <div>
              <p style="margin: 8px 0; color: #475569; font-size: 14px;">
                <strong>Nombre:</strong> ${assessment.nombre} ${assessment.apellidos}
              </p>
              <p style="margin: 8px 0; color: #475569; font-size: 14px;">
                <strong>Correo:</strong> ${assessment.correo}
              </p>
            </div>
          </div>

          <div style="margin-bottom: 30px; text-align: center; padding: 30px; background: linear-gradient(135deg, ${getProfileColorForPDF(results.predominantColor)}); border-radius: 16px; color: white;">
            <p style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Tu perfil predominante es</p>
            <h2 style="font-size: 48px; margin: 0; font-weight: 300; letter-spacing: -1px;">
              ${results.predominantColor}
            </h2>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 20px; font-weight: 500; text-align: center;">
              Análisis por cuadrantes
            </h3>
            <div style="width: 100%; text-align: center; margin: 30px 0; padding: 20px; background: white;">
              <img src="${chartImageData}" style="max-width: 400px; width: 400px; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: block; margin: 0 auto;" />
            </div>
          </div>

          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 20px; font-weight: 500;">
              Descripción del perfil
            </h3>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <p style="color: #475569; line-height: 1.6; margin: 0; font-size: 14px;">
                ${results.info.description}
              </p>
            </div>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 12px;">
              <h4 style="color: #1e293b; font-size: 16px; margin-bottom: 10px; font-weight: 500;">
                Características principales:
              </h4>
              <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 13px;">
                ${results.info.characteristics}
              </p>
            </div>
          </div>
        </div>
      `;

      // Opciones de configuración del PDF
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Evaluacion_Teal_${assessment.nombre}_${assessment.apellidos}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      // Generar y descargar el PDF
      await html2pdf().from(pdfContent).set(options).save();
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getProfileColor = (color) => {
    const colorMap = {
      "Rojo": "from-red-500 to-red-600",
      "Ámbar": "from-amber-500 to-amber-600", 
      "Naranja": "from-orange-500 to-orange-600",
      "Verde": "from-green-500 to-green-600",
      "Teal": "from-teal-500 to-teal-600"
    };
    return colorMap[color] || "from-blue-500 to-blue-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando tus resultados...</p>
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-light text-slate-900 mb-4">Resultados no encontrados</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft size={20} />
            Realizar nueva evaluación
          </button>
        </div>
      </div>
    )
  }

  const results = assessment.results

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-slate-900 mb-4 tracking-tight">
            {assessment.nombre}, estos son tus resultados
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
          <p className="text-slate-600 mt-4 text-sm">
            Evaluación realizada el {new Date(assessment.created_at).toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Perfil predominante */}
          <div className={`bg-gradient-to-br ${getProfileColor(results.predominantColor)} p-12 rounded-3xl text-white shadow-2xl`}>
            <div className="text-center">
              <p className="text-white/80 font-light mb-2">Tu perfil predominante es</p>
              <h2 className="text-6xl font-light mb-4 tracking-tight">{results.predominantColor}</h2>
              <div className="w-16 h-0.5 bg-white/30 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Gráfico radar */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-light text-slate-900 mb-2 text-center tracking-tight">
              Análisis por cuadrantes
            </h3>
            <RadarChartSVG data={results.quadrantAverages} size={600} />
            <p className="text-center text-slate-600 text-sm mt-2">
              Visualización de tu desarrollo evolutivo en cada dimensión organizacional
            </p>
          </div>

          {/* Descripción y reflexión */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
              <h4 className="text-xl font-medium text-slate-900 mb-4">Tu perfil</h4>
              <p className="text-slate-700 leading-relaxed mb-6">{results.info.description}</p>
              <div className="space-y-3">
                <h5 className="font-medium text-slate-900">Características principales</h5>
                <p className="text-slate-600 text-sm leading-relaxed">{results.info.characteristics}</p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
              <h4 className="text-xl font-medium text-slate-900 mb-4">Reflexión personal</h4>
              <div className="space-y-4">
                {results.info.reflection.map((question, index) => (
                  <p key={index} className="text-slate-700 text-sm leading-relaxed italic border-l-2 border-blue-200 pl-4">
                    {question}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button 
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className={`px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-3 transition-all duration-200 shadow-lg ${
                isGeneratingPDF 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download size={20} strokeWidth={1.5} />
                  Descargar PDF
                </>
              )}
            </button>
            
            <button 
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl text-slate-700 hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <RotateCcw size={20} strokeWidth={1.5} />
              Nueva evaluación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}