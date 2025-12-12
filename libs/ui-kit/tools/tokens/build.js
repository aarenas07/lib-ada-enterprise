const fs = require('fs');
const path = require('path');

// --- CONFIGURACIÓN ---
const INPUT_DIR = path.join(__dirname, 'input');
const OUTPUT_DIR = path.join(__dirname, '../../../ui-kit/src/lib/styles/tokens/output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'variables.css');

// Asegurar que existe el directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// --- UTILIDADES ---
const toKebabCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase a kebab
        .replace(/[\s_]+/g, '-')             // espacios y guiones bajos a guiones
        .toLowerCase();
};

let cssContent = `/**
 * ARCHIVO GENERADO AUTOMÁTICAMENTE. NO EDITAR MANUALMENTE.
 * Generado por: tools/tokens/build.js
 */\n\n`;

// --- PROCESADOR DE COLORES (bds.json) ---
try {
    const bdsData = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, 'bds.json'), 'utf8'));
    console.log('🎨 Procesando Colores (bds.json)...');

    // Mapeo de nombres de tokens de Figma a nombres limpios para CSS
    // Esto asegura que "Primary Container" se convierta en "primary-container"

    Object.keys(bdsData).forEach(themeName => {
        const themeObj = bdsData[themeName];

        // Si es 'light', usamos :root para que sea el default. Si no, creamos una clase.
        // Nota: Mapeamos 'light' a :root Y .theme-light, otros solo a su clase.
        let selector = themeName === 'light' ? ':root, .theme-light' : `.theme-${toKebabCase(themeName)}`;

        // Angular Material M3 a veces usa 'light-medium-contrast', normalizamos nombres
        if (themeName === 'light_medium_contrast') selector = '.theme-light-medium-contrast';

        cssContent += `${selector} {\n`;

        // 1. Procesar Esquemas (Schemes) -> var(--bds-sys-*)
        if (themeObj.Schemes) {
            Object.entries(themeObj.Schemes).forEach(([key, token]) => {
                const cssVarName = `--bds-sys-${toKebabCase(key)}`;
                cssContent += `  ${cssVarName}: ${token.value};\n`;
            });
        }

        // 2. Procesar Paletas (Palettes) -> var(--bds-ref-*)
        // Solo necesitamos escribir las paletas una vez (generalmente en :root), 
        // pero si cambian por tema, las dejamos aquí. Normalmente las paletas son constantes.
        // Asumiremos que si están dentro del tema, podrían cambiar.
        if (themeObj.Palettes) {
            Object.entries(themeObj.Palettes).forEach(([key, token]) => {
                const cssVarName = `--bds-ref-${toKebabCase(key)}`;
                cssContent += `  ${cssVarName}: ${token.value};\n`;
            });
        }

        cssContent += `}\n\n`;
    });

} catch (e) {
    console.error('Error procesando bds.json. Asegúrate de que el archivo existe en tools/tokens/input/', e);
}

// --- PROCESADOR DE FORMAS (shape.json) ---
try {
    const shapeData = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, 'shape.json'), 'utf8'));
    console.log('📐 Procesando Formas (shape.json)...');

    cssContent += `:root {\n`;
    if (shapeData.Corner) {
        Object.entries(shapeData.Corner).forEach(([key, token]) => {
            const cssVarName = `--bds-shape-corner-${toKebabCase(key)}`;
            // Asumimos px si es un número puro, pero shape.json a veces trae valores crudos.
            const value = typeof token.value === 'number' ? `${token.value}px` : token.value;
            cssContent += `  ${cssVarName}: ${value};\n`;
        });
    }
    cssContent += `}\n\n`;

} catch (e) {
    console.warn('Advertencia: No se encontró shape.json o falló su lectura.');
}

// --- PROCESADOR DE TIPOGRAFÍA (typescale.json) ---
try {
    const typeData = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, 'typescale.json'), 'utf8'));
    console.log('🔤 Procesando Tipografía (typescale.json)...');

    // Aquí generamos variables individuales para cada propiedad
    // Ejemplo: --bds-typescale-display-large-size: 57px;

    cssContent += `:root {\n`;
    if (typeData.Static) { // Asumiendo que todo está dentro de "Static"
        Object.entries(typeData.Static).forEach(([role, props]) => {
            const roleName = toKebabCase(role); // display-large

            Object.entries(props).forEach(([prop, token]) => {
                const propName = toKebabCase(prop); // size, weight, line-height
                let value = token.value;

                // Limpieza de referencias cruzadas como "{Static.Font.Brand}"
                if (typeof value === 'string' && value.startsWith('{')) {
                    // Por simplicidad, aquí deberíamos resolver la referencia o hacer un fallback.
                    // Para este script básico, vamos a hardcodear Roboto si detectamos font reference,
                    // o dejarlo como var() si tuviéramos esas vars definidas.
                    // MEJOR OPCIÓN: Mapear a una variable de sistema de fuente.
                    if (value.includes('Font.Brand')) value = 'var(--bds-font-brand)';
                    else if (value.includes('Font.Plain')) value = 'var(--bds-font-plain)';
                    else if (value.includes('Weight.Regular')) value = '400';
                    else if (value.includes('Weight.Medium')) value = '500';
                    else if (value.includes('Weight.Bold')) value = '700';
                }

                // Añadir px a Size y Line Height si son números
                if ((propName === 'size' || propName === 'line-height') && typeof value === 'number') {
                    value = `${value}px`;
                }

                // Conversión de tracking (letter-spacing)
                // Figma suele dar tracking en % o ems raros, a veces números float.
                // Si es un número pequeño (ej -0.25), asumimos que en CSS es rem o em, 
                // pero Material a veces usa px. Mantendremos el valor crudo + 'px' si no es decimal,
                // o 'rem' si es pequeño. Ajusta según tu necesidad de diseño.
                // Material 3 spec usa px para tracking usualmente o rem.
                if (propName === 'tracking' && typeof value === 'number') {
                    value = `${value}px`;
                }

                cssContent += `  --bds-typescale-${roleName}-${propName}: ${value};\n`;
            });

            // Variable compuesta (shorthand) para facilitar uso en mixins
            // font: weight size/line-height family
            cssContent += `  --bds-typescale-${roleName}: var(--bds-typescale-${roleName}-weight) var(--bds-typescale-${roleName}-size)/var(--bds-typescale-${roleName}-line-height) var(--bds-typescale-${roleName}-font);\n`;
        });
    }

    // Definiciones base de fuentes (hardcoded o extraídas de font_theme.json si lo incluyes)
    cssContent += `  --bds-font-brand: 'Roboto', sans-serif;\n`;
    cssContent += `  --bds-font-plain: 'Roboto', sans-serif;\n`;

    cssContent += `}\n\n`;

} catch (e) {
    console.warn('Advertencia: No se encontró typescale.json o falló su lectura.', e);
}

// --- ESCRIBIR ARCHIVO ---
fs.writeFileSync(OUTPUT_FILE, cssContent);
console.log(`✅ ¡Éxito! Variables generadas en: ${OUTPUT_FILE}`);