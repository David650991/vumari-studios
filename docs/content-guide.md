---
project: VUMARI STUDIOS
author: David Vidal Ramírez
year: 2026
---

# Guía de contenido

La voz de VUMARI STUDIOS es clara, profesional, directa y cercana. Los textos
explican problemas, decisiones y entregables concretos, evitando promesas vagas.

No se publican clientes, estadísticas, premios, testimonios, alianzas, resultados
o servicios que no estén confirmados. Un dato faltante se omite del sitio público
o se registra internamente como `PENDIENTE DE DEFINIR`.

## VUMARI Tools

La redacción de las herramientas debe cumplir estas reglas:

- identificar como experimental cualquier herramienta que mantenga ese estado;
- no presentar una herramienta como estable o publicada antes de que lo esté;
- no prometer compatibilidad que no esté implementada y probada;
- no utilizar expresiones como “ilimitado”;
- limitar cualquier afirmación de privacidad al flujo realmente comprobado;
- explicar las características no soportadas en lenguaje directo;
- usar mensajes humanos para selección, proceso, resultado y error;
- no presentar anuncios, afiliados, patrocinios, cuentas premium o pagos como
  implementados, porque actualmente no existen.

### Estado que debe comunicarse

SRT → VTT y VTT → SRT son herramientas experimentales que procesan archivos
localmente en el navegador. Ninguna está publicada en producción.

### Limitaciones de SRT → VTT

- Requiere SRT numerado.
- Lee texto UTF-8 con o sin BOM.
- Mantiene el archivo completo en memoria.
- No existe un tamaño máximo medido y documentado.
- No traduce ni corrige el texto.

### Alcance de VTT → SRT

Soporta WebVTT simple, timestamps largos y cortos, texto multilínea, UTF-8 con o
sin BOM y saltos LF o CRLF.

Rechaza explícitamente cue identifiers, cue settings, bloques `NOTE`, `STYLE` y
`REGION`, además de marcado WebVTT avanzado. No debe describirse como compatible
con todo el estándar WebVTT.

## Portafolio

- `client`: trabajo real y autorizado para un cliente.
- `internal`: proyecto propio de VUMARI STUDIOS.
- `concept`: demostración conceptual identificada expresamente.

Los resultados sólo se incluyen cuando hay información verificable.
