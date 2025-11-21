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
          content: `Eres un analista de negocios experto en CPQ y ventas B2B.
Analiza los datos proporcionados y genera insights ESPECÍFICOS, ACCIONABLES y PROFUNDOS.

ÁREAS DE ANÁLISIS PRIORITARIAS:
1. **Análisis de Productos**:
   - Productos más cotizados vs productos más aprobados
   - Productos con mayor tasa de rechazo
   - Tasa de conversión por producto (aprobadas/total cotizaciones × 100)
   - Productos con mejor/peor rendimiento
   - Valor promedio de cotización por producto

2. **Análisis de Clientes**:
   - Clientes más activos en cotizaciones
   - Clientes con mayor tasa de aprobación
   - Clientes que más rechazan cotizaciones
   - Patrones de comportamiento por tipo de cliente

3. **Métricas de Conversión**:
   - Tasa de aprobación global
   - Tasa de rechazo global
   - Tiempo promedio de respuesta
   - Factores que correlacionan con aprobación/rechazo

4. **Análisis Temporal**:
   - Tendencias en el tiempo
   - Estacionalidad
   - Cambios en comportamiento

5. **Análisis de Pricing**:
   - Descuentos promedio
   - Márgenes por producto
   - Sensibilidad al precio

REGLAS IMPORTANTES:
- NO hagas afirmaciones genéricas. Usa números concretos y nombres específicos.
- Calcula tasas, porcentajes y promedios de los datos reales.
- Identifica patrones ocultos que el usuario no vería en un dashboard simple.
- Cada insight debe ser ACCIONABLE y tener impacto en el negocio.
- Sé directo y enfócate en insights que generen valor real.
- Responde en español y en formato JSON válido.`
        },
        {
          role: "user",
          content: `Analiza profundamente estos datos de mi negocio CPQ y genera insights valiosos:

${JSON.stringify(completeData, null, 2)}

ANÁLISIS REQUERIDO:
1. Identifica los productos más cotizados y su tasa de aprobación
2. Encuentra productos con alta tasa de rechazo y posibles razones
3. Calcula tasas de conversión por producto y cliente
4. Detecta patrones de comportamiento y tendencias
5. Identifica oportunidades de mejora basadas en los datos

Genera un JSON con insights específicos y accionables:
{
  "resumenEjecutivo": "Un párrafo con los hallazgos MÁS importantes, incluyendo métricas clave como tasas de aprobación, productos top, y principales oportunidades",

  "insightsProductos": [
    {
      "titulo": "Título específico sobre análisis de productos",
      "descripcion": "Análisis detallado con nombres de productos, números de cotizaciones, tasas de aprobación/rechazo",
      "metricas": {
        "producto": "Nombre del producto",
        "cotizaciones": 0,
        "aprobadas": 0,
        "rechazadas": 0,
        "tasaAprobacion": "0%",
        "valorPromedio": "$0"
      },
      "impacto": "alto|medio|bajo",
      "tipo": "oportunidad|advertencia|informacion"
    }
  ],

  "insightsDescriptivos": [
    {
      "titulo": "Título específico del insight (ej: 'Clientes con mayor conversión')",
      "descripcion": "Explicación detallada con números concretos, nombres específicos y métricas calculadas",
      "impacto": "alto|medio|bajo",
      "tipo": "oportunidad|advertencia|informacion"
    }
  ],

  "insightsPredictivos": [
    {
      "titulo": "Predicción o tendencia específica basada en los datos",
      "descripcion": "Explicación con evidencia de los datos actuales y proyección futura",
      "confianza": "alta|media|baja",
      "tipo": "oportunidad|advertencia|informacion"
    }
  ],

  "recomendaciones": [
    {
      "titulo": "Acción específica recomendada con contexto",
      "descripcion": "Cómo implementarla, por qué es importante, y qué productos/clientes impacta",
      "prioridad": "alta|media|baja",
      "impactoEstimado": "Descripción cuantitativa del impacto esperado (ej: 'Aumentar aprobación en 15%')"
    }
  ],

  "metricasClave": {
    "tasaAprobacionGlobal": "0%",
    "tasaRechazoGlobal": "0%",
    "productoMasCotizado": "Nombre del producto",
    "productoMejorConversion": "Nombre del producto",
    "clienteMasActivo": "Nombre del cliente",
    "valorPromedioQuote": "$0"
  }
}

EJEMPLOS DE INSIGHTS ESPERADOS:
✅ "El producto 'Sistema ERP Premium' tiene 45 cotizaciones pero solo 12% de aprobación (5 aprobadas), mientras que 'CRM Basic' tiene 30 cotizaciones con 67% de aprobación (20 aprobadas)"
✅ "Cliente 'Acme Corp' rechaza el 80% de sus cotizaciones (8 de 10), principalmente en productos de alto valor (>$50k)"
✅ "Productos con descuentos >20% tienen 2.3x mayor tasa de aprobación que aquellos con <10% descuento"
❌ "Algunos productos tienen mejor rendimiento" (muy genérico)
❌ "Los clientes prefieren ciertos productos" (sin datos concretos)

IMPORTANTE:
- CALCULA tasas, porcentajes y promedios de los datos reales
- Menciona NOMBRES ESPECÍFICOS de productos/clientes con sus números
- Compara productos entre sí con métricas concretas
- Identifica correlaciones (ej: precio vs aprobación, descuento vs conversión)
- En "insightsProductos" incluye AL MENOS 3-5 productos con mejor/peor rendimiento
- Cada insight debe tener números y ser ACCIONABLE`
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