import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 1. Guardar en base de datos
    const { data: savedData, error: dbError } = await supabase
      .from('assessments')
      .insert([
        {
          nombre: data.userInfo.nombre,
          apellidos: data.userInfo.apellidos,
          correo: data.userInfo.correo,
          responses: data.responses,
          results: data.results,
          predominant_color: data.results.predominantColor,
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Error saving to database: ' + dbError.message 
      }, { status: 500 });
    }

    console.log('Assessment saved successfully:', {
      id: savedData.id,
      nombre: data.userInfo.nombre,
      perfil: data.results.predominantColor,
      timestamp: savedData.created_at
    });

    // 2. Preparar datos para webhook
    const webhookData = {
      id: savedData.id,
      nombre: data.userInfo.nombre,
      apellidos: data.userInfo.apellidos,
      correo: data.userInfo.correo,
      fecha: new Date().toLocaleDateString('es-ES'),
      perfil_predominante: data.results.predominantColor,
      conteo_rojo: data.results.colorCounts.a || 0,
      conteo_amber: data.results.colorCounts.b || 0,
      conteo_naranja: data.results.colorCounts.c || 0,
      conteo_verde: data.results.colorCounts.d || 0,
      conteo_teal: data.results.colorCounts.e || 0,
      individual_interior: data.results.quadrantAverages[0]?.value.toFixed(2) || '0',
      individual_exterior: data.results.quadrantAverages[1]?.value.toFixed(2) || '0',
      colectivo_interior: data.results.quadrantAverages[2]?.value.toFixed(2) || '0',
      colectivo_exterior: data.results.quadrantAverages[3]?.value.toFixed(2) || '0',
      link_resultados: `https://teal-assessment.vercel.app/results/${savedData.id}`,
      respuestas_detalladas: Object.entries(data.responses)
        .map(([pregunta, respuesta]) => `${pregunta}: ${respuesta.toUpperCase()}`)
        .join('\n'),
    };

    // 3. Enviar webhook si está configurado
    if (process.env.WEBHOOK_URL && process.env.WEBHOOK_URL !== 'temp') {
      try {
        const webhookResponse = await fetch(process.env.WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });
        
        if (webhookResponse.ok) {
          console.log('Webhook sent successfully');
        } else {
          console.log('Webhook failed:', webhookResponse.status);
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    } else {
      console.log('Webhook not configured');
    }

    return NextResponse.json({ 
      message: 'Assessment saved successfully',
      id: savedData.id,
      webhookSent: !!(process.env.WEBHOOK_URL && process.env.WEBHOOK_URL !== 'temp')
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}