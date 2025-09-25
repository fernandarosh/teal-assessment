'use client'

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw, CheckCircle2, Circle, Download } from 'lucide-react';

// Importar html2pdf dinámicamente
let html2pdf: unknown = null;

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

const questions = [
    {
      id: "autoconciencia",
      question: "¿Cómo describirías mejor tu relación con tus pensamientos y emociones en el trabajo?",
      options: [
        { value: "a", text: "Prefiero no analizar mucho lo que pienso o siento, actúo por instinto" },
        { value: "b", text: "Mantengo mis emociones bajo control y evito que interfieran" },
        { value: "c", text: "Soy consciente de mis pensamientos pero las emociones me distraen del objetivo" },
        { value: "d", text: "Reconozco tanto mis pensamientos como emociones y los integro en mis decisiones" },
        { value: "e", text: "Observo mis pensamientos y emociones como información valiosa, pero no me definen" }
      ]
    },
    {
      id: "motivacion_interior",
      question: "¿Qué te motiva más profundamente en tu trabajo?",
      options: [
        { value: "a", text: "Asegurar mi supervivencia y mantener mi posición" },
        { value: "b", text: "Crear estabilidad y seguridad para mí y los míos" },
        { value: "c", text: "Lograr resultados ambiciosos y destacar por mis logros" },
        { value: "d", text: "Inspirar y hacer una diferencia positiva en las personas" },
        { value: "e", text: "Seguir mi propósito auténtico, incluso cuando no sé exactamente hacia dónde me lleva" }
      ]
    },
    {
      id: "actitud_contacto",
      question: "Cuando interactúas con colegas o colaboradores, tu actitud natural tiende a ser:",
      options: [
        { value: "a", text: "Competitiva, busco establecer quién tiene más influencia" },
        { value: "b", text: "Respetuosa de las jerarquías y posiciones establecidas" },
        { value: "c", text: "Estratégica, enfocada en obtener beneficios mutuos" },
        { value: "d", text: "Empática, busco entender las necesidades de todos" },
        { value: "e", text: "De aceptación plena, veo a cada persona como única y valiosa" }
      ]
    },
    {
      id: "miedo",
      question: "¿Cuál de estas situaciones te genera más inquietud en el ámbito laboral?",
      options: [
        { value: "a", text: "Que alguien me humille o actúe de manera impredecible contra mí" },
        { value: "b", text: "Perder mi estatus o posición en la organización" },
        { value: "c", text: "Fracasar en alcanzar mis objetivos o metas importantes" },
        { value: "d", text: "Ser rechazado o excluido del grupo" },
        { value: "e", text: "Los miedos son información útil que me ayuda a entender la situación" }
      ]
    },
    {
      id: "estilo_liderazgo",
      question: "Cuando tienes que liderar un proyecto o equipo, tu enfoque natural es:",
      options: [
        { value: "a", text: "Dar órdenes claras y asegurarme de que se cumplan al pie de la letra" },
        { value: "b", text: "Establecer procedimientos ordenados y supervisar que se sigan correctamente" },
        { value: "c", text: "Definir objetivos claros y hacer seguimiento del rendimiento de cada persona" },
        { value: "d", text: "Inspirar al equipo con la visión y facilitar que todos participen activamente" },
        { value: "e", text: "Crear un ambiente abierto donde cada persona pueda contribuir según el momento lo requiera" }
      ]
    },
    {
      id: "toma_decisiones",
      question: "¿Cómo prefieres tomar las decisiones importantes en tu área de trabajo?",
      options: [
        { value: "a", text: "Decido yo basándome en mi experiencia y lo que considero mejor" },
        { value: "b", text: "Sigo las políticas y procedimientos establecidos por los líderes superiores" },
        { value: "c", text: "Analizo datos, objetivos claros y aplico estrategias probadas" },
        { value: "d", text: "Considero los valores compartidos y el efecto en todas las personas involucradas" },
        { value: "e", text: "Escucho qué decisión emerge naturalmente del propósito y momento de la situación" }
      ]
    },
    {
      id: "desarrollo_personal",
      question: "¿Cómo prefieres aprender y desarrollarte profesionalmente?",
      options: [
        { value: "a", text: "Aprendiendo de la experiencia directa, adaptándome sobre la marcha" },
        { value: "b", text: "A través de formación estructurada y programas de capacitación formal" },
        { value: "c", text: "Con entrenamiento específico orientado a mejorar mi rendimiento" },
        { value: "d", text: "Mediante coaching personalizado e intercambio con colegas" },
        { value: "e", text: "En espacios abiertos de aprendizaje que van más allá del contexto laboral tradicional" }
      ]
    },
    {
      id: "resolucion_conflictos",
      question: "Cuando surge un conflicto en tu equipo, tu primera reacción es:",
      options: [
        { value: "a", text: "Intervenir con autoridad para establecer quién tiene razón" },
        { value: "b", text: "Aplicar las reglas y procedimientos establecidos para estos casos" },
        { value: "c", text: "Buscar la solución más práctica y efectiva para continuar adelante" },
        { value: "d", text: "Facilitar un diálogo donde todos puedan expresar sus necesidades" },
        { value: "e", text: "Ver el conflicto como una oportunidad de crecimiento y transformación" }
      ]
    },
    {
      id: "reuniones",
      question: "¿Cómo te comportas naturalmente en las reuniones de trabajo?",
      options: [
        { value: "a", text: "Tomo el control y dirijo la conversación con energía" },
        { value: "b", text: "Me aseguro de que se mantenga el orden y se documenten los acuerdos" },
        { value: "c", text: "Me enfoco en que seamos eficientes y logremos resultados concretos" },
        { value: "d", text: "Procuro que todos tengan espacio para expresar sus opiniones y sentimientos" },
        { value: "e", text: "Ofrezco un espacio de apoyo y participo cuando siento que es apropiado" }
      ]
    },
    {
      id: "lealtad",
      question: "¿Hacia dónde diriges principalmente tu lealtad en el trabajo?",
      options: [
        { value: "a", text: "Hacia mi jefe directo y quienes me protegen" },
        { value: "b", text: "Hacia mi departamento y sus tradiciones establecidas" },
        { value: "c", text: "Hacia la organización y sus objetivos de crecimiento" },
        { value: "d", text: "Hacia los valores compartidos que nos unen como comunidad" },
        { value: "e", text: "Hacia principios que trascienden la organización y benefician al mundo" }
      ]
    },
    {
      id: "clima_trabajo",
      question: "¿Cómo describirías el ambiente laboral que prefieres?",
      options: [
        { value: "a", text: "Dinámico y competitivo, donde se valora la fuerza y determinación" },
        { value: "b", text: "Ordenado y cooperativo, donde todos conocen su lugar y función" },
        { value: "c", text: "Pragmático y orientado a resultados, donde se premia el alto rendimiento" },
        { value: "d", text: "Amigable y comunitario, donde nos cuidamos unos a otros" },
        { value: "e", text: "Abierto y creativo, donde cada persona puede expresar su autenticidad" }
      ]
    },
    {
      id: "vision_valores",
      question: "¿Cómo prefieres que se definan la visión y valores en tu organización?",
      options: [
        { value: "a", text: "No necesito que estén formalmente articulados, me adapto a las circunstancias" },
        { value: "b", text: "Deben ser establecidos claramente desde arriba y comunicados a todos" },
        { value: "c", text: "Se desarrollan estratégicamente entre la dirección y los equipos clave" },
        { value: "d", text: "Son herramientas participativas para tomar decisiones que nos beneficien a todos" },
        { value: "e", text: "Emergen naturalmente del propósito evolutivo de la organización" }
      ]
    },
    {
      id: "actitud_trabajo",
      question: "¿Cuál es tu actitud predominante hacia las tareas y responsabilidades laborales?",
      options: [
        { value: "a", text: "Uso mi poder e influencia para conseguir lo que necesito" },
        { value: "b", text: "Sigo las instrucciones con disciplina, aunque a veces tenga dudas" },
        { value: "c", text: "Todo es posible si tengo objetivos claros y la estrategia correcta" },
        { value: "d", text: "Prefiero una visión inspiradora antes que una estrategia perfecta" },
        { value: "e", text: "Mantengo una perspectiva amplia y me adapto a lo que emerge" }
      ]
    },
    {
      id: "relacion_stakeholders",
      question: "¿Cómo manejas las relaciones con clientes, proveedores y otros grupos de interés?",
      options: [
        { value: "a", text: "De manera directa y sin rodeos, estableciendo quién tiene el control" },
        { value: "b", text: "Siguiendo protocolos jerárquicos y manteniendo las formas apropiadas" },
        { value: "c", text: "Enfocándome en objetivos y estrategias que generen beneficios mutuos" },
        { value: "d", text: "Construyendo alianzas basadas en confianza y beneficio compartido" },
        { value: "e", text: "Como oportunidades de cocreación y colaboración genuina" }
      ]
    },
    {
      id: "productos_servicios",
      question: "¿Cómo prefieres que tu organización desarrolle sus productos o servicios?",
      options: [
        { value: "a", text: "Enfocándose en obtener resultados sin importar tanto el costo o método" },
        { value: "b", text: "Siguiendo estándares establecidos y procesos probados en el tiempo" },
        { value: "c", text: "Creando productos innovadores que sigan las tendencias del mercado" },
        { value: "d", text: "Desarrollando ofertas significativas y sostenibles que aporten valor real" },
        { value: "e", text: "Generando innovación ética que transforme positivamente el sector" }
      ]
    },
    {
      id: "salario",
      question: "¿Cuál consideras que debería ser la base para determinar la compensación laboral?",
      options: [
        { value: "a", text: "El poder de negociación y la capacidad de conseguir lo que uno merece" },
        { value: "b", text: "Escalas salariales establecidas según el puesto y la antigüedad" },
        { value: "c", text: "El rendimiento individual y los resultados que cada persona genera" },
        { value: "d", text: "La participación equitativa en los logros colectivos de la organización" },
        { value: "e", text: "Las posibilidades de contribución única que cada persona puede ofrecer" }
      ]
    },
    {
      id: "eficiencia_recursos",
      question: "¿Cómo crees que tu organización debería manejar sus recursos materiales y financieros?",
      options: [
        { value: "a", text: "Enfocándose en la producción sin preocuparse demasiado por los costos" },
        { value: "b", text: "Cumpliendo estrictamente las leyes y obligaciones del sector" },
        { value: "c", text: "Optimizando costos y buscando alternativas eficientes de materiales" },
        { value: "d", text: "Desarrollando cadenas de suministro sostenibles y responsables" },
        { value: "e", text: "Implementando sistemas inteligentes que se adapten dinámicamente" }
      ]
    },
    {
      id: "flujo_informacion",
      question: "¿Cómo prefieres que circule la información en tu organización?",
      options: [
        { value: "a", text: "De manera directa cuando es necesaria, sin estructuras formales" },
        { value: "b", text: "A través de reuniones programadas y canales oficiales establecidos" },
        { value: "c", text: "Mediante reuniones estratégicas e información orientada a resultados" },
        { value: "d", text: "Por plataformas formales e informales que promuevan la transparencia" },
        { value: "e", text: "A través de interacción libre y consultoría entre colegas cuando surge la necesidad" }
      ]
    },
    {
      id: "procesos",
      question: "¿Qué tipo de procesos de trabajo prefieres en tu organización?",
      options: [
        { value: "a", text: "Procesos simples y temporales que se adapten a cada situación" },
        { value: "b", text: "Procesos estandarizados y bien documentados que todos puedan seguir" },
        { value: "c", text: "Procesos flexibles enfocados en alcanzar objetivos específicos" },
        { value: "d", text: "Procesos colaborativos entre organizaciones que fortalezcan la cultura compartida" },
        { value: "e", text: "Redes libres de procesos interdisciplinarios que se organicen naturalmente" }
      ]
    },
    {
      id: "estructura_organizacion",
      question: "¿Qué tipo de estructura organizacional te resulta más natural y efectiva?",
      options: [
        { value: "a", text: "Estructura simple con división clara del trabajo y autoridad concentrada" },
        { value: "b", text: "Estructura formal con roles y responsabilidades bien definidos para cada nivel" },
        { value: "c", text: "Estructura matricial que permita colaboración flexible entre áreas" },
        { value: "d", text: "Estructura en red que facilite la colaboración y el intercambio constante" },
        { value: "e", text: "Estructura fractal donde cada parte contiene la esencia del todo" }
      ]
    }
];
  
const PersonalTealAssessment = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [shuffledQuestions, setShuffledQuestions] = useState(questions);
  const [isClient, setIsClient] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState('');
  const [userInfo, setUserInfo] = useState({
    nombre: '',
    apellidos: '',
    correo: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Efecto para inicializar el shuffling solo en el cliente
  React.useEffect(() => {
    setIsClient(true);
    setShuffledQuestions(
      questions.map(question => ({
        ...question,
        options: [...question.options].sort(() => Math.random() - 0.5)
      }))
    );
  }, []);

  const colorProfiles = {
    "Rojo": {
      description: "Enfoque en el poder personal, supervivencia y dominio directo. Te adaptas bien a ambientes caóticos y cambios rápidos, actuando con determinación e inmediatez.",
      characteristics: "Acción directa, supervivencia, poder personal, reactividad inmediata, orientación al corto plazo.",
      reflection: [
        "¿Estoy actuando principalmente desde la supervivencia, la fuerza o el control inmediato?",
        "¿Qué impacto tiene mi impulso en las relaciones con los demás y en la sostenibilidad de mis logros?",
        "¿Cómo puedo transformar la energía de la acción y la determinación en un motor más constructivo y menos reactivo?"
      ]
    },
    "Ámbar": {
      description: "Valoración del orden, jerarquía, estabilidad y procedimientos establecidos. Puedes crear estructuras duraderas y planificar a largo plazo con disciplina.",
      characteristics: "Jerarquía formal, procesos estables, planificación a largo plazo, orden y control, tradiciones establecidas.",
      reflection: [
        "¿Hasta qué punto dependo de reglas, estructuras o jerarquías para sentirme seguro?",
        "¿Qué estoy dejando de explorar por miedo a salir del orden establecido?",
        "¿Cómo puedo honrar la disciplina y la estabilidad sin perder flexibilidad ni creatividad?"
      ]
    },
    "Naranja": {
      description: "Orientación hacia resultados, innovación, competencia y éxito medible. Eficacia y logro de objetivos son tus principales motivadores.",
      characteristics: "Orientación a resultados, competencia, innovación, eficiencia y crecimiento, meritocracia.",
      reflection: [
        "¿Mido mi valor únicamente en función de mis resultados y éxitos visibles?",
        "¿Estoy sacrificando relaciones, bienestar o propósito más profundo por alcanzar metas?",
        "¿Cómo puedo equilibrar la ambición y la innovación con una visión más humana y sostenible del éxito?"
      ]
    },
    "Verde": {
      description: "Énfasis en la comunidad, valores compartidos, consenso y bienestar colectivo. Buscas justicia, igualdad y que todas las perspectivas sean valoradas.",
      characteristics: "Enfoque en personas, empoderamiento, valores compartidos, consenso en decisiones, inclusión.",
      reflection: [
        "¿Mi búsqueda de consenso y comunidad me lleva a postergar decisiones necesarias?",
        "¿Cómo aseguro que los valores compartidos no se conviertan en barreras para avanzar?",
        "¿De qué manera puedo potenciar la empatía y la colaboración sin caer en complacencia?"
      ]
    },
    "Azul": {
      description: "Integración de autogestión, propósito evolutivo y expresión auténtica del ser. Aceptas la evolución de la conciencia hacia formas más complejas de relacionarte.",
      characteristics: "Auto-gestión, plenitud, propósito evolutivo, conciencia organizacional elevada, autenticidad.",
      reflection: [
        "¿Estoy realmente encarnando el propósito evolutivo o solo lo idealizo?",
        "¿Qué tan dispuesto estoy a confiar en la autogestión y soltar el control?",
        "¿Cómo puedo traducir mi autenticidad y visión integral en acciones concretas que transformen el sistema del que soy parte?"
      ]
    }
  };

  const questionsPerPage = 5;
  const totalPages = Math.ceil(shuffledQuestions.length / questionsPerPage);

  const resetAssessment = () => {
    setResponses({});
    setCurrentPage(0);
    setShowResults(false);
    setShowWelcome(true);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setUserInfo({
      nombre: '',
      apellidos: '',
      correo: ''
    });
    setTurnstileToken('');
    setTurnstileError('');
    // Re-shuffle las preguntas cuando se resetea
    setShuffledQuestions(
      questions.map(question => ({
        ...question,
        options: [...question.options].sort(() => Math.random() - 0.5)
      }))
    );
  };

  // Función para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleStartClick = async () => {
    const nombre = userInfo.nombre && userInfo.nombre.trim();
    const apellidos = userInfo.apellidos && userInfo.apellidos.trim();
    const correo = userInfo.correo && userInfo.correo.trim();
    
    if (!nombre || !apellidos || !correo) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    if (!isValidEmail(correo)) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (!turnstileToken) {
      alert('Por favor, completa la verificación de seguridad.');
      return;
    }

    // Verificar el token de Turnstile
    try {
      const response = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });

      const data = await response.json();
      
      if (!data.success) {
        setTurnstileError('Verificación de seguridad fallida. Por favor, intenta de nuevo.');
        return;
      }
    } catch (error) {
      console.error('Error verificando Turnstile:', error);
      alert('Error en la verificación de seguridad. Por favor, intenta de nuevo.');
      return;
    }
    
    setShowWelcome(false);
  };

  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateResults = () => {
    const colorCounts = { a: 0, b: 0, c: 0, d: 0, e: 0 };
    
    Object.values(responses).forEach(response => {
      if (colorCounts.hasOwnProperty(response)) {
        colorCounts[response]++;
      }
    });

    const colorMapping = { a: "Rojo", b: "Ámbar", c: "Naranja", d: "Verde", e: "Azul" };
    const predominantLetter = Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    );
    const predominantColor = colorMapping[predominantLetter];

    const quadrants = [
      { questions: shuffledQuestions.slice(0, 4), name: "Individual - Interior" },
      { questions: shuffledQuestions.slice(4, 9), name: "Individual - Exterior" },
      { questions: shuffledQuestions.slice(9, 14), name: "Colectivo - Interior" },
      { questions: shuffledQuestions.slice(14, 20), name: "Colectivo - Exterior" }
    ];

    const quadrantAverages = quadrants.map(quadrant => {
      const quadrantResponses = quadrant.questions
        .map(q => responses[q.id])
        .filter(r => r !== undefined)
        .map(r => ({ a: 1, b: 2, c: 3, d: 4, e: 5 }[r] || 0));
      
      const average = quadrantResponses.length > 0 
        ? quadrantResponses.reduce((sum, val) => sum + val, 0) / quadrantResponses.length 
        : 0;
        
      return {
        dimension: quadrant.name,
        value: average
      };
    });

    return {
      predominantColor,
      colorCounts,
      quadrantAverages,
      info: colorProfiles[predominantColor] || colorProfiles["Naranja"]
    };
  };

const generatePDF = async () => {
  try {
    // Importar html2pdf dinámicamente solo cuando se necesite
    if (!html2pdf && typeof window !== 'undefined') {
      const html2pdfModule = await import('html2pdf.js');
      html2pdf = html2pdfModule.default || html2pdfModule;
    }
    
    if (!html2pdf) {
      alert('La funcionalidad de PDF no está disponible en este momento.');
      return;
    }
  } catch (error) {
    console.error('Error loading html2pdf:', error);
    alert('Error al cargar el generador de PDF.');
    return;
  }

  setIsGeneratingPDF(true);
  
  try {
    const result = calculateResults();
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    // Crear imagen del gráfico usando canvas
    let chartImageData = '';
    
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
      
      // Dibujar etiquetas
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      points.forEach((point, index) => {
        const labelAngle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
        const labelRadius = radius + 60;
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
        
        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, labelX, labelY + (lineIndex - lines.length/2 + 0.5) * 16);
        });
        
        // Valor
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 13px Arial';
        ctx.fillText(point.value.toFixed(1), labelX, labelY + lines.length * 8 + 15);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Arial';
      });
      
      // Etiquetas de niveles
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Arial';
      [1, 2, 3, 4, 5].forEach(level => {
        ctx.fillText(level, centerX + 8, centerY - (radius * level) / maxValue);
      });
      
      return canvas.toDataURL('image/png', 1.0);
    };
    
    chartImageData = createChartCanvas(result.quadrantAverages);
    
    // Opciones de configuración del PDF
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Evaluacion_Teal_${userInfo.nombre}_${userInfo.apellidos}.pdf`,
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
              <strong>Nombre:</strong> ${userInfo.nombre} ${userInfo.apellidos}
            </p>
            <p style="margin: 8px 0; color: #475569; font-size: 14px;">
              <strong>Correo:</strong> ${userInfo.correo}
            </p>
          </div>
        </div>

        <div style="margin-bottom: 30px; text-align: center; padding: 30px; background: linear-gradient(135deg, ${getProfileColorForPDF(result.predominantColor)}); border-radius: 16px; color: white;">
          <p style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Tu perfil predominante es</p>
          <h2 style="font-size: 48px; margin: 0; font-weight: 300; letter-spacing: -1px;">
            ${result.predominantColor}
          </h2>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 20px; font-weight: 500; text-align: center;">
            Análisis por cuadrantes
          </h3>
          <div style="width: 100%; text-align: center; margin: 30px 0; padding: 20px; background: white;">
            <img src="${chartImageData}" style="max-width: 400px; width: 400px; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: block; margin: 0 auto;" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; page-break-inside: avoid;">
            ${result.quadrantAverages.map(quadrant => `
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                <h4 style="color: #1e293b; font-size: 14px; margin-bottom: 8px; font-weight: 500;">
                  ${quadrant.dimension}
                </h4>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; position: relative;">
                    <div style="height: 100%; background: #3b82f6; border-radius: 4px; width: ${(quadrant.value / 5) * 100}%; position: absolute; top: 0; left: 0;"></div>
                  </div>
                  <span style="color: #1e293b; font-weight: 500; font-size: 14px; min-width: 40px;">
                    ${quadrant.value.toFixed(1)}/5
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 20px; font-weight: 500;">
            Descripción del perfil
          </h3>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <p style="color: #475569; line-height: 1.6; margin: 0; font-size: 14px;">
              ${result.info.description}
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px;">
            <h4 style="color: #1e293b; font-size: 16px; margin-bottom: 10px; font-weight: 500;">
              Características principales:
            </h4>
            <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 13px;">
              ${result.info.characteristics}
            </p>
          </div>
        </div>

        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 20px; font-weight: 500;">
            Reflexiones para el desarrollo personal
          </h3>
          <div style="background: #fefdf8; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px;">
            ${result.info.reflection.map((question, index) => `
              <div style="margin-bottom: ${index < result.info.reflection.length - 1 ? '15px' : '0'}; padding-left: 15px; border-left: 2px solid #fbbf24;">
                <p style="color: #92400e; font-style: italic; line-height: 1.6; margin: 0; font-size: 13px;">
                  ${question}
                </p>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h3 style="color: #1e293b; font-size: 20px; margin-bottom: 20px; font-weight: 500;">
            Distribución de respuestas
          </h3>
          <div style="display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            ${Object.entries({a: "Rojo", b: "Ámbar", c: "Naranja", d: "Verde", e: "Azul"}).map(([key, color]) => `
              <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; border: 2px solid ${result.predominantColor === color ? '#3b82f6' : '#e2e8f0'}; min-width: 80px;">
                <div style="font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 5px;">
                  ${result.colorCounts[key]}
                </div>
                <div style="font-size: 12px; color: #64748b;">
                  ${color}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; margin-top: 30px;">
          <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
            Este reporte ha sido generado automáticamente basado en tus respuestas.<br>
            Para más información, visita nuestro sitio web o contacta con nuestro equipo.
          </p>
        </div>
      </div>
    `;

    // Generar y descargar el PDF
    await html2pdf().from(pdfContent).set(options).save();
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
  } finally {
    setIsGeneratingPDF(false);
  }
};

  // Función auxiliar para obtener colores del perfil para PDF
  const getProfileColorForPDF = (color) => {
    const colorMap = {
      "Rojo": "#dc2626, #b91c1c",
      "Ámbar": "#d97706, #b45309", 
      "Naranja": "#ea580c, #c2410c",
      "Verde": "#16a34a, #15803d",
      "Azul": "#1e3a8a, #1e40af"
    };
    return colorMap[color] || "#3b82f6, #1d4ed8";
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);

    try {
      const results = calculateResults();
      
      const assessmentData = {
        userInfo,
        responses,
        results
      };

      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la evaluación');
      }

      const data = await response.json();
      console.log('Assessment submitted successfully:', data);
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextPage = async () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      setShowResults(true);
      // Auto-envío al mostrar resultados
      setTimeout(() => {
        submitAssessment();
      }, 2000);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const getCurrentPageResponses = () => {
    const startIndex = currentPage * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, shuffledQuestions.length);
    const currentQuestions = shuffledQuestions.slice(startIndex, endIndex);
    return currentQuestions.filter(q => responses[q.id]).length;
  };

  const getTotalResponses = () => {
    return Object.keys(responses).length;
  };

  const getProfileColor = (color) => {
    const colorMap = {
      "Rojo": "from-red-500 to-red-600",
      "Ámbar": "from-amber-500 to-amber-600", 
      "Naranja": "from-orange-500 to-orange-600",
      "Verde": "from-green-500 to-green-600",
      "Azul": "from-blue-800 to-blue-900"
    };
    return colorMap[color] || "from-blue-500 to-blue-600";
  };

if (showWelcome) {
  const isFormValid = userInfo.nombre && userInfo.nombre.trim() && 
                      userInfo.apellidos && userInfo.apellidos.trim() && 
                      userInfo.correo && userInfo.correo.trim() && 
                      isValidEmail(userInfo.correo) && 
                      turnstileToken;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Circle size={32} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-light text-slate-900 mb-3 tracking-tight">
            Evaluación Personal
          </h1>
          <p className="text-slate-600 leading-relaxed">
            Descubre tu perfil evolutivo organizacional a través de una experiencia cuidadosamente diseñada
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Nombre
              </label>
              <input
                type="text"
                value={userInfo.nombre}
                onChange={(e) => handleUserInfoChange('nombre', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 outline-none transition-all duration-200 text-slate-900 placeholder-slate-400"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Apellidos
              </label>
              <input
                type="text"
                value={userInfo.apellidos}
                onChange={(e) => handleUserInfoChange('apellidos', e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white/80 outline-none transition-all duration-200 text-slate-900 placeholder-slate-400"
                placeholder="Tus apellidos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Correo electrónico
              </label>
              <input
                type="email"
                value={userInfo.correo}
                onChange={(e) => handleUserInfoChange('correo', e.target.value)}
                className={`w-full px-4 py-3 bg-white/50 border-0 rounded-xl focus:ring-2 focus:bg-white/80 outline-none transition-all duration-200 text-slate-900 placeholder-slate-400 ${
                  userInfo.correo && !isValidEmail(userInfo.correo) 
                    ? 'focus:ring-red-500/20 ring-2 ring-red-500/20' 
                    : 'focus:ring-blue-500/20'
                }`}
                placeholder="ejemplo@correo.com"
              />
              {userInfo.correo && !isValidEmail(userInfo.correo) && (
                <p className="text-red-500 text-xs mt-2">
                  Por favor, ingresa un correo electrónico válido
                </p>
              )}
            </div>

            {/* Turnstile CAPTCHA - Siempre visible y funcional */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Verificación de seguridad
              </label>
              {isClient && (
                <SimpleTurnstile
                  siteKey="0x4AAAAAAB3KeyEN4HDKlMUx"
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setTurnstileError('');
                  }}
                  onError={() => {
                    setTurnstileError('Error en la verificación. Intenta refrescar la página.');
                    setTurnstileToken('');
                  }}
                  onExpire={() => {
                    setTurnstileToken('');
                    setTurnstileError('La verificación ha expirado. Por favor, complétala nuevamente.');
                  }}
                />
              )}
              {turnstileError && (
                <p className="text-red-500 text-xs mt-2">
                  {turnstileError}
                </p>
              )}
            </div>

            <button
              onClick={handleStartClick}
              disabled={!isFormValid}
              className={`w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
                isFormValid
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Comenzar evaluación
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <p className="text-xs text-blue-800/70 leading-relaxed">
              Tu información será tratada con máxima confidencialidad y utilizada únicamente para personalizar tu experiencia de evaluación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

if (showResults) {
  const result = calculateResults();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-slate-900 mb-4 tracking-tight">
            {userInfo.nombre}, estos son tus resultados
          </h1>
          <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-8">
          <div className={`bg-gradient-to-br ${getProfileColor(result.predominantColor)} p-12 rounded-3xl text-white shadow-2xl`}>
            <div className="text-center">
              <p className="text-white/80 font-light mb-2">Tu perfil predominante es</p>
              <h2 className="text-6xl font-light mb-4 tracking-tight">{result.predominantColor}</h2>
              <div className="w-16 h-0.5 bg-white/30 mx-auto rounded-full"></div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-light text-slate-900 mb-2 text-center tracking-tight">
              Análisis por cuadrantes
            </h3>
            <div className="flex justify-center items-center">
              <div className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                <RadarChartSVG data={result.quadrantAverages} size={600} />
              </div>
            </div>
            <p className="text-center text-slate-600 text-sm mt-2">
              Visualización de tu desarrollo evolutivo en cada dimensión organizacional
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
              <h4 className="text-xl font-medium text-slate-900 mb-4">Tu perfil</h4>
              <p className="text-slate-700 leading-relaxed mb-6">{result.info.description}</p>
              <div className="space-y-3">
                <h5 className="font-medium text-slate-900">Características principales</h5>
                <p className="text-slate-600 text-sm leading-relaxed">{result.info.characteristics}</p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
              <h4 className="text-xl font-medium text-slate-900 mb-4">Reflexión personal</h4>
              <div className="space-y-4">
                {result.info.reflection.map((question, index) => (
                  <p key={index} className="text-slate-700 text-sm leading-relaxed italic border-l-2 border-blue-200 pl-4">
                    {question}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {isSubmitting && (
            <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-700 font-medium">Enviando tus resultados...</p>
              </div>
            </div>
          )}

          {isSubmitted && (
            <div className="bg-green-50/50 backdrop-blur-sm border border-green-100/50 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 size={24} className="text-green-600" strokeWidth={1.5} />
                <p className="text-green-700">
                  Resultados enviados a <span className="font-medium">{userInfo.correo}</span>
                </p>
              </div>
            </div>
          )}

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
              onClick={resetAssessment}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl text-slate-700 hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <RotateCcw size={20} strokeWidth={1.5} />
              Nueva evaluación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const startIndex = currentPage * questionsPerPage;
const endIndex = Math.min(startIndex + questionsPerPage, shuffledQuestions.length);
const currentQuestions = shuffledQuestions.slice(startIndex, endIndex);

// Si aún no se ha inicializado en el cliente, mostrar un loading
if (!isClient) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Preparando evaluación...</p>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-light text-slate-900 mb-2 tracking-tight">
          Hola, {userInfo.nombre}
        </h1>
        <p className="text-slate-600">Descubre tu perfil evolutivo organizacional</p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-slate-700">
            {currentPage + 1} de {totalPages}
          </span>
          <span className="text-sm text-slate-500">
            {getTotalResponses()}/{shuffledQuestions.length} completadas
          </span>
        </div>
        
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(getTotalResponses() / shuffledQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-8">
        {currentQuestions.map((question, index) => (
          <div key={question.id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
            <h3 className="text-lg font-medium text-slate-900 mb-6 leading-relaxed">
              {startIndex + index + 1}. {question.question}
            </h3>
            <div className="space-y-3">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-blue-50/50 transition-colors duration-200">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={responses[question.id] === option.value}
                    onChange={() => handleResponse(question.id, option.value)}
                    className="mt-1 w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500/20"
                  />
                  <span className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors duration-200">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-12 pt-8">
        <button 
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            currentPage === 0 
              ? 'text-slate-400 cursor-not-allowed' 
              : 'text-slate-700 hover:bg-white/70 hover:shadow-lg bg-white/50 border border-white/20'
          }`}
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
          Anterior
        </button>

        <button 
          onClick={nextPage}
          disabled={getCurrentPageResponses() === 0}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg ${
            getCurrentPageResponses() === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {currentPage === totalPages - 1 ? 'Ver resultados' : 'Siguiente'}
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  </div>
);
};

export default PersonalTealAssessment;