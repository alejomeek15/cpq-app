// api/generate-insights.js
// Vercel Serverless Function para generar insights de forma SEGURA
// Con integración automática de Braintrust usando wrapOpenAI

import { OpenAI } from 'openai';
import { wrapOpenAI, initLogger } from 'braintrust';

// Inicializar el logger de Braintrust
// Esto crea el proyecto en Braintrust si no existe
const logger = initLogger({
  projectName: 'cpq-insights',
  apiKey: process.env.BRAINTRUST_API_KEY,
});

// Inicializar OpenAI con wrapper de Braintrust
// wrapOpenAI() captura AUTOMÁTICAMENTE todas las llamadas como traces
const openai = wrapOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1. Validar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const token = authHeader.split('Bearer ')[1];
    const userId = token.substring(0, 10);

    // 2. Obtener datos del request
    const { completeData } = req.body;

    if (!completeData) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // 3. Validar tamaño de datos
    const dataSize = JSON.stringify(completeData).length;
    const MAX_SIZE = 500000;
    
    if (dataSize > MAX_SIZE) {
      return res.status(413).json({ 
        error: 'Datos muy grandes', 
        maxSize: MAX_SIZE,
        currentSize: dataSize 
      });
    }

    const startTime = Date.now();
    console.log('🤖 Generando insights con IA...');

    // 4. Llamar a OpenAI (automáticamente tracked por Braintrust)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un analista de negocios SENIOR, especialista en optimización de embudos de venta (funnels) y análisis de catálogos de productos para negocios B2B.
Tu misión es encontrar "dinero sobre la mesa": oportunidades no evidentes, productos problemáticos y palancas de crecimiento.
Analiza los datos proporcionados para generar insights CUANTITATIVOS, ESPECÍFICOS y ACCIONABLES.
Usa siempre nombres de productos y clientes cuando sea relevante. No uses términos genéricos.
Tu análisis debe ser profundo, como si estuvieras presentando tus hallazgos al CEO de la empresa.
Responde SIEMPRE en español y en formato JSON válido, sin excepción.`
        },
        {
          role: "user",
          content: `A continuación se presentan los datos completos de mi negocio CPQ. Realiza un análisis exhaustivo siguiendo las áreas prioritarias que te detallo.

**Contexto Clave de los Datos:**
- 'cotizaciones': Contiene todas las cotizaciones, su estado (Aprobada, Rechazada, etc.) y su valor.
- 'productos.analisis': Contiene un resumen pre-calculado del rendimiento de cada producto (veces cotizado, tasa de conversión, etc.). ¡Esta sección es crucial!
- 'clientes': El listado de mis clientes.

**Datos Completos:**
${JSON.stringify(completeData, null, 2)}

**Áreas de Análisis Prioritarias (Enfócate en esto):**

1.  **Análisis de Rendimiento de Productos (CRÍTICO):**
    *   **Productos Estrella:** ¿Cuáles son los 2-3 productos más cotizados Y con la mejor tasa de conversión? Menciona sus nombres y números exactos.
    *   **Productos Problemáticos:** ¿Qué productos se cotizan mucho pero tienen una tasa de conversión MUY BAJA? ¿Cuál podría ser la causa (precio, descripción, etc.)?
    *   **Joyas Ocultas:** ¿Hay productos que se cotizan poco pero su tasa de conversión es altísima (ej. > 80%)? Podrían ser oportunidades de venta cruzada.
    *   **Relación Valor/Aprobación:** ¿Los productos más caros tienen menor tasa de aprobación?

2.  **Análisis del Embudo de Ventas (Funnel):**
    *   ¿En qué estado del embudo ('Enviada', 'En negociación') se estancan más cotizaciones? ¿Qué porcentaje representan sobre el total?
    *   ¿Cuál es el ticket promedio de las cotizaciones 'Aprobadas' vs las 'Rechazadas'? ¿Estamos perdiendo cotizaciones de alto valor?

3.  **Análisis de Clientes:**
    *   ¿Quiénes son los clientes que más cotizaciones aprobadas tienen (no solo en cantidad, sino en valor total)?
    *   ¿Hay algún patrón de productos que compran los mejores clientes?

**Formato de Salida Obligatorio (JSON):**
Genera un JSON con los insights basados en tu análisis de las áreas prioritarias.

{
  "resumenEjecutivo": "Un párrafo con los 2-3 hallazgos MÁS impactantes y accionables de tu análisis. Debe incluir nombres y números.",
  "insightsDescriptivos": [
    {
      "titulo": "Ej: 'Producto Estrella: El 'Servicio de Consultoría Avanzada' tiene un 75% de conversión'",
      "descripcion": "Análisis detallado sobre un hallazgo descriptivo. Usa números de los datos para soportar tu afirmación. Por ejemplo, de X veces cotizado, se aprobó Y veces.",
      "impacto": "alto|medio|bajo",
      "tipo": "oportunidad|advertencia|informacion"
    }
  ],
  "insightsPredictivos": [
    {
      "titulo": "Ej: 'Tendencia: Las cotizaciones con más de 5 ítems tienen menor probabilidad de cierre'",
      "descripcion": "Basado en los datos, qué tendencia o predicción puedes hacer. Explica tu razonamiento.",
      "confianza": "alta|media|baja",
      "tipo": "oportunidad|advertencia"
    }
  ],
  "recomendaciones": [
    {
      "titulo": "Ej: 'Acción: Promocionar las 'Joyas Ocultas' en las nuevas cotizaciones'",
      "descripcion": "Una acción específica y clara que puedo tomar. Explica cómo implementarla y el porqué, basado en tus insights.",
      "prioridad": "alta|media|baja",
      "impactoEstimado": "Descripción cualitativa del impacto esperado. Ej: 'Podría incrementar el ticket promedio en un 15%'."
    }
  ]
}
`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const duration = Date.now() - startTime;
    const insightsText = completion.choices[0].message.content;
    const insights = JSON.parse(insightsText);
    const tokensUsed = completion.usage.total_tokens;
    const cost = (tokensUsed * 0.00002).toFixed(4);

    console.log('✅ Insights generados exitosamente');
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      userId: userId,
      tokensUsed: tokensUsed,
      cost: cost,
      duration: `${duration}ms`,
      dataSize: `${(dataSize / 1024).toFixed(2)}KB`,
      braintrustTracked: true
    }));

    return res.status(200).json({
      success: true,
      insights,
      metadata: {
        model: completion.model,
        tokensUsed: tokensUsed,
        cost: cost,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        braintrustTracked: true
      }
    });

  } catch (error) {
    console.error('❌ Error generando insights:', error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Límite de rate excedido. Intenta de nuevo en unos momentos.' 
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'Error de configuración del servidor' 
      });
    }

    return res.status(500).json({ 
      error: 'Error generando insights',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}