import { CanvasElement, CanvasState, TextElement, ShapeElement, ImageElement } from '../types/elements';

export type OutputFormat = 'html' | 'react' | 'vue' | 'tailwind';
export type PromptLanguage = 'de' | 'en' | 'fr' | 'es' | 'ru';

export interface GeneratedPrompt {
  readable: string;
  json: string;
  combined: string;
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

interface Translation {
  posY: readonly [string, string, string, string, string];
  posX: readonly [string, string, string];
  noElements: string;
  role: (format: string) => string;
  contextLabel: string;
  layoutDescLabel: string;
  pageDesc: (w: number, h: number) => string;
  pixelNote: string;
  techSpecLabel: string;
  instructionLabel: string;
  coreInstructions: (format: string) => string[];
  formatInstructions: Record<OutputFormat, string>;
  imgNote: string;
  measureNote: string;
  noResponsiveNote: (w: number) => string;
  responsiveInstructions: string;
  addToExistingInstructions: string;
  descHeading:   (content: string, pos: string, fs: number, color: string, hLevel: number) => string;
  descParagraph: (content: string, pos: string, fs: number) => string;
  descButton:    (content: string, pos: string, w: number, h: number, bg: string) => string;
  descImage:     (placeholder: string, pos: string, w: number, h: number) => string;
  descRectangle: (pos: string, w: number, h: number, bg: string) => string;
  descCircle:    (pos: string, w: number, h: number, bg: string) => string;
}

const TRANSLATIONS: Record<PromptLanguage, Translation> = {
  // ── Deutsch ────────────────────────────────────────────────────────────────
  de: {
    posY: ['ganz-oben', 'oben', 'mitte', 'unten', 'ganz-unten'],
    posX: ['links', 'zentriert', 'rechts'],
    noElements: 'Noch keine Elemente auf dem Canvas. Füge Elemente hinzu und generiere dann den Prompt.',
    role: (f) => `Du bist ein Web-Entwickler. Baue folgendes Layout als ${f}.`,
    contextLabel: 'KONTEXT',
    layoutDescLabel: 'LAYOUT-BESCHREIBUNG',
    pageDesc: (w, h) => `Eine Seite (${w}×${h}px) mit folgenden Elementen:`,
    pixelNote: 'Das Layout soll pixel-genau dem Design entsprechen. Halte dich an alle Farben, Positionen und Größen.',
    techSpecLabel: 'TECHNISCHE SPEZIFIKATION (JSON)',
    instructionLabel: 'ANWEISUNG',
    coreInstructions: (f) => [
      '- Halte dich exakt an die Maße, Farben und Positionen aus der JSON-Spezifikation',
      '- Nutze die Layout-Beschreibung für den Gesamtkontext und das Gefühl',
      `- Setze das Layout in sauberem ${f} um`,
    ],
    formatInstructions: {
      html:     '- Nutze sauberes HTML5 und inline CSS oder ein <style>-Tag\n- Kein externes CSS-Framework',
      react:    '- Nutze React funktionale Komponenten\n- Nutze Tailwind CSS für alle Styles\n- Exportiere die Hauptkomponente als default export',
      vue:      '- Nutze Vue 3 Single File Components (<template>, <script setup>, <style scoped>)\n- Kein externes CSS-Framework außer optionalem Tailwind',
      tailwind: '- Nutze HTML5 mit Tailwind CSS Klassen\n- Kein zusätzliches CSS außer Tailwind',
    },
    imgNote:          '- Bilder als <img> mit passendem alt-Text aus dem placeholder-Feld',
    measureNote:      '- Alle Maße in px (außer bei Tailwind – dort nächstbeste Utility-Klasse)',
    noResponsiveNote: (w) => `- Responsivität ist nicht erforderlich – Desktop-Layout (${w}px breit)`,
    addToExistingInstructions: `IN BESTEHENDES DESIGN INTEGRIEREN:
- Integriere dieses Layout in ein bestehendes Projekt – baue nichts von Grund auf neu
- Passe dich an das vorhandene Design-System an: Farbpalette, Typografie, Abstände und Komponenten-Muster
- Verwende keine neuen Design-Bibliotheken oder CSS-Frameworks, wenn bereits welche im Projekt existieren
- Halte dich an bestehende Konventionen (Klassen-Benennung, Dateistruktur, Komponenten-API)
- Nutze bestehende Komponenten und Utilities wo immer möglich statt neue zu erstellen
- Passe Abstände und Größen dem bestehenden Rhythmus des Designs an
- Stelle sicher, dass das neue Layout sich nahtlos ins bestehende einfügt`,
    responsiveInstructions: `RESPONSIVES DESIGN:
- Mache das Layout vollständig responsiv mit diesen Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1440px)
- Mobile (< 640px): Elemente vertikal stapeln, volle Breite, Abstände reduzieren
- Tablet (640px–1024px): Layout für mittlere Bildschirme anpassen, ggf. 2-spaltig
- Desktop (> 1024px): Exaktes Layout aus der JSON-Spezifikation verwenden
- Schriftgrößen auf kleineren Bildschirmen proportional skalieren
- Buttons und interaktive Elemente auf Mobile mindestens 44px hoch
- Bilder immer mit max-width: 100% und height: auto
- Visuelle Hierarchie und Lesbarkeit auf allen Breakpoints beibehalten`,
    descHeading:   (c, pos, fs, col, h) => `Eine H${h}-Überschrift "${c}" (${pos}, Schriftgröße ${fs}px, Farbe ${col})`,
    descParagraph: (c, pos, fs)      => `Ein Textabsatz "${c}" (${pos}, ${fs}px)`,
    descButton:    (c, pos, w, h, bg)=> `Ein Button "${c}" (${pos}, ${w}×${h}px, Hintergrund ${bg})`,
    descImage:     (p, pos, w, h)    => `Ein Bild-Platzhalter: "${p}" (${pos}, ${w}×${h}px)`,
    descRectangle: (pos, w, h, bg)   => `Ein Rechteck (${pos}, ${w}×${h}px, Hintergrund ${bg})`,
    descCircle:    (pos, w, h, bg)   => `Ein Kreis (${pos}, ${w}×${h}px, Hintergrund ${bg})`,
  },

  // ── English ────────────────────────────────────────────────────────────────
  en: {
    posY: ['very-top', 'top', 'center', 'bottom', 'very-bottom'],
    posX: ['left', 'centered', 'right'],
    noElements: 'No elements on the canvas yet. Add elements and then generate the prompt.',
    role: (f) => `You are a web developer. Build the following layout as ${f}.`,
    contextLabel: 'CONTEXT',
    layoutDescLabel: 'LAYOUT DESCRIPTION',
    pageDesc: (w, h) => `A page (${w}×${h}px) with the following elements:`,
    pixelNote: 'The layout should match the design pixel-perfectly. Follow all colors, positions and sizes.',
    techSpecLabel: 'TECHNICAL SPECIFICATION (JSON)',
    instructionLabel: 'INSTRUCTIONS',
    coreInstructions: (f) => [
      '- Follow the exact dimensions, colors and positions from the JSON specification',
      '- Use the layout description for overall context and feel',
      `- Implement the layout in clean ${f}`,
    ],
    formatInstructions: {
      html:     '- Use clean HTML5 with inline CSS or a <style> tag\n- No external CSS framework',
      react:    '- Use React functional components\n- Use Tailwind CSS for all styles\n- Export the main component as default export',
      vue:      '- Use Vue 3 Single File Components (<template>, <script setup>, <style scoped>)\n- No external CSS framework except optional Tailwind',
      tailwind: '- Use HTML5 with Tailwind CSS utility classes\n- No additional CSS except Tailwind',
    },
    imgNote:          '- Images as <img> with appropriate alt text from the placeholder field',
    measureNote:      '- All measurements in px (except Tailwind – use the nearest utility class)',
    noResponsiveNote: (w) => `- Responsiveness is not required – desktop layout (${w}px wide)`,
    addToExistingInstructions: `INTEGRATE INTO EXISTING DESIGN:
- Integrate this layout into an existing project — do not build from scratch
- Match the existing design system: color palette, typography, spacing and component patterns
- Do not introduce new design libraries or CSS frameworks if the project already has them
- Follow existing conventions (class naming, file structure, component API)
- Reuse existing components and utilities wherever possible instead of creating new ones
- Align spacing and sizing to the existing design rhythm
- Ensure the new layout blends seamlessly into what already exists`,
    responsiveInstructions: `RESPONSIVE DESIGN:
- Make the layout fully responsive using these breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1440px)
- Mobile (< 640px): stack elements vertically, full width, reduce spacing
- Tablet (640px–1024px): adapt layout for medium screens, consider 2-column grids
- Desktop (> 1024px): use the exact layout from the JSON specification
- Scale font sizes down proportionally on smaller screens
- Buttons and interactive elements must be at least 44px tall on mobile
- Images always with max-width: 100% and height: auto
- Maintain visual hierarchy and readability across all breakpoints`,
    descHeading:   (c, pos, fs, col, h) => `An H${h} heading "${c}" (${pos}, font-size ${fs}px, color ${col})`,
    descParagraph: (c, pos, fs)      => `A text paragraph "${c}" (${pos}, ${fs}px)`,
    descButton:    (c, pos, w, h, bg)=> `A button "${c}" (${pos}, ${w}×${h}px, background ${bg})`,
    descImage:     (p, pos, w, h)    => `An image placeholder: "${p}" (${pos}, ${w}×${h}px)`,
    descRectangle: (pos, w, h, bg)   => `A rectangle (${pos}, ${w}×${h}px, background ${bg})`,
    descCircle:    (pos, w, h, bg)   => `A circle (${pos}, ${w}×${h}px, background ${bg})`,
  },

  // ── Français ───────────────────────────────────────────────────────────────
  fr: {
    posY: ['tout-en-haut', 'en-haut', 'milieu', 'en-bas', 'tout-en-bas'],
    posX: ['gauche', 'centré', 'droite'],
    noElements: "Aucun élément sur le canvas. Ajoutez des éléments puis générez le prompt.",
    role: (f) => `Tu es un développeur web. Construis la mise en page suivante en ${f}.`,
    contextLabel: 'CONTEXTE',
    layoutDescLabel: 'DESCRIPTION DE LA MISE EN PAGE',
    pageDesc: (w, h) => `Une page (${w}×${h}px) avec les éléments suivants :`,
    pixelNote: 'La mise en page doit correspondre exactement au design. Respecte toutes les couleurs, positions et tailles.',
    techSpecLabel: 'SPÉCIFICATION TECHNIQUE (JSON)',
    instructionLabel: 'INSTRUCTIONS',
    coreInstructions: (f) => [
      '- Respecte exactement les dimensions, couleurs et positions de la spécification JSON',
      '- Utilise la description pour le contexte global et le ressenti visuel',
      `- Implémente la mise en page en ${f} propre`,
    ],
    formatInstructions: {
      html:     '- Utilise du HTML5 propre avec du CSS inline ou une balise <style>\n- Aucun framework CSS externe',
      react:    '- Utilise des composants fonctionnels React\n- Utilise Tailwind CSS pour tous les styles\n- Exporte le composant principal en tant que default export',
      vue:      '- Utilise des Vue 3 Single File Components (<template>, <script setup>, <style scoped>)\n- Aucun framework CSS externe sauf Tailwind optionnel',
      tailwind: '- Utilise HTML5 avec les classes utilitaires Tailwind CSS\n- Aucun CSS supplémentaire sauf Tailwind',
    },
    imgNote:          '- Images en tant que <img> avec un texte alt approprié issu du champ placeholder',
    measureNote:      '- Toutes les mesures en px (sauf Tailwind – utilise la classe utilitaire la plus proche)',
    noResponsiveNote: (w) => `- Le responsive n'est pas requis – mise en page desktop (${w}px de large)`,
    addToExistingInstructions: `INTÉGRER DANS UN DESIGN EXISTANT :
- Intègre cette mise en page dans un projet existant — ne recrée rien de zéro
- Adapte-toi au design system existant : palette de couleurs, typographie, espacements et patterns de composants
- N'introduis pas de nouvelles bibliothèques ou frameworks CSS si le projet en possède déjà
- Respecte les conventions existantes (nommage des classes, structure de fichiers, API des composants)
- Réutilise les composants et utilitaires existants autant que possible au lieu d'en créer de nouveaux
- Aligne les espacements et les tailles sur le rythme du design existant
- Assure-toi que la nouvelle mise en page s'intègre harmonieusement dans ce qui existe`,
    responsiveInstructions: `DESIGN RESPONSIVE :
- Rendre la mise en page entièrement responsive avec ces breakpoints : sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1440px)
- Mobile (< 640px) : empiler les éléments verticalement, pleine largeur, réduire les espacements
- Tablette (640px–1024px) : adapter pour les écrans moyens, envisager une grille 2 colonnes
- Desktop (> 1024px) : utiliser exactement la mise en page de la spécification JSON
- Réduire proportionnellement les tailles de police sur les petits écrans
- Les boutons et éléments interactifs doivent faire au moins 44px de hauteur sur mobile
- Images toujours avec max-width: 100% et height: auto
- Maintenir la hiérarchie visuelle et la lisibilité sur tous les breakpoints`,
    descHeading:   (c, pos, fs, col, h) => `Un titre H${h} "${c}" (${pos}, taille de police ${fs}px, couleur ${col})`,
    descParagraph: (c, pos, fs)      => `Un paragraphe de texte "${c}" (${pos}, ${fs}px)`,
    descButton:    (c, pos, w, h, bg)=> `Un bouton "${c}" (${pos}, ${w}×${h}px, fond ${bg})`,
    descImage:     (p, pos, w, h)    => `Un placeholder d'image : "${p}" (${pos}, ${w}×${h}px)`,
    descRectangle: (pos, w, h, bg)   => `Un rectangle (${pos}, ${w}×${h}px, fond ${bg})`,
    descCircle:    (pos, w, h, bg)   => `Un cercle (${pos}, ${w}×${h}px, fond ${bg})`,
  },

  // ── Español ────────────────────────────────────────────────────────────────
  es: {
    posY: ['muy-arriba', 'arriba', 'centro', 'abajo', 'muy-abajo'],
    posX: ['izquierda', 'centrado', 'derecha'],
    noElements: 'Aún no hay elementos en el canvas. Añade elementos y luego genera el prompt.',
    role: (f) => `Eres un desarrollador web. Construye el siguiente diseño como ${f}.`,
    contextLabel: 'CONTEXTO',
    layoutDescLabel: 'DESCRIPCIÓN DEL DISEÑO',
    pageDesc: (w, h) => `Una página (${w}×${h}px) con los siguientes elementos:`,
    pixelNote: 'El diseño debe coincidir exactamente con el mockup. Sigue todos los colores, posiciones y tamaños.',
    techSpecLabel: 'ESPECIFICACIÓN TÉCNICA (JSON)',
    instructionLabel: 'INSTRUCCIONES',
    coreInstructions: (f) => [
      '- Sigue exactamente las dimensiones, colores y posiciones de la especificación JSON',
      '- Usa la descripción del diseño para el contexto general y el aspecto visual',
      `- Implementa el diseño en ${f} limpio`,
    ],
    formatInstructions: {
      html:     '- Usa HTML5 limpio con CSS inline o una etiqueta <style>\n- Sin framework CSS externo',
      react:    '- Usa componentes funcionales de React\n- Usa Tailwind CSS para todos los estilos\n- Exporta el componente principal como default export',
      vue:      '- Usa Vue 3 Single File Components (<template>, <script setup>, <style scoped>)\n- Sin framework CSS externo excepto Tailwind opcional',
      tailwind: '- Usa HTML5 con clases de utilidad Tailwind CSS\n- Sin CSS adicional excepto Tailwind',
    },
    imgNote:          '- Imágenes como <img> con texto alt apropiado del campo placeholder',
    measureNote:      '- Todas las medidas en px (excepto Tailwind – usa la clase utilitaria más cercana)',
    noResponsiveNote: (w) => `- No se requiere diseño responsive – layout de escritorio (${w}px de ancho)`,
    addToExistingInstructions: `INTEGRAR EN DISEÑO EXISTENTE:
- Integra este layout en un proyecto existente — no construyas desde cero
- Adáptate al sistema de diseño existente: paleta de colores, tipografía, espaciados y patrones de componentes
- No introduzcas nuevas librerías o frameworks CSS si el proyecto ya tiene los suyos
- Sigue las convenciones existentes (nomenclatura de clases, estructura de archivos, API de componentes)
- Reutiliza componentes y utilidades existentes siempre que sea posible en lugar de crear nuevos
- Alinea los espaciados y tamaños al ritmo del diseño existente
- Asegúrate de que el nuevo layout se integre fluidamente en lo que ya existe`,
    responsiveInstructions: `DISEÑO RESPONSIVE:
- Hacer el diseño completamente responsive con estos breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1440px)
- Móvil (< 640px): apilar elementos verticalmente, ancho completo, reducir espaciados
- Tablet (640px–1024px): adaptar para pantallas medianas, considerar cuadrícula de 2 columnas
- Desktop (> 1024px): usar exactamente el layout de la especificación JSON
- Reducir proporcionalmente los tamaños de fuente en pantallas pequeñas
- Botones y elementos interactivos deben tener al menos 44px de altura en móvil
- Imágenes siempre con max-width: 100% y height: auto
- Mantener la jerarquía visual y legibilidad en todos los breakpoints`,
    descHeading:   (c, pos, fs, col, h) => `Un encabezado H${h} "${c}" (${pos}, tamaño de fuente ${fs}px, color ${col})`,
    descParagraph: (c, pos, fs)      => `Un párrafo de texto "${c}" (${pos}, ${fs}px)`,
    descButton:    (c, pos, w, h, bg)=> `Un botón "${c}" (${pos}, ${w}×${h}px, fondo ${bg})`,
    descImage:     (p, pos, w, h)    => `Un marcador de imagen: "${p}" (${pos}, ${w}×${h}px)`,
    descRectangle: (pos, w, h, bg)   => `Un rectángulo (${pos}, ${w}×${h}px, fondo ${bg})`,
    descCircle:    (pos, w, h, bg)   => `Un círculo (${pos}, ${w}×${h}px, fondo ${bg})`,
  },

  // ── Русский ────────────────────────────────────────────────────────────────
  ru: {
    posY: ['самый-верх', 'верх', 'центр', 'низ', 'самый-низ'],
    posX: ['слева', 'по-центру', 'справа'],
    noElements: 'На холсте пока нет элементов. Добавьте элементы и сгенерируйте промпт.',
    role: (f) => `Ты веб-разработчик. Создай следующий макет в формате ${f}.`,
    contextLabel: 'КОНТЕКСТ',
    layoutDescLabel: 'ОПИСАНИЕ МАКЕТА',
    pageDesc: (w, h) => `Страница (${w}×${h}px) со следующими элементами:`,
    pixelNote: 'Макет должен точно соответствовать дизайну. Соблюдай все цвета, позиции и размеры.',
    techSpecLabel: 'ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ (JSON)',
    instructionLabel: 'ИНСТРУКЦИИ',
    coreInstructions: (f) => [
      '- Строго соблюдай размеры, цвета и позиции из JSON-спецификации',
      '- Используй описание макета для общего контекста и визуального ощущения',
      `- Реализуй макет на чистом ${f}`,
    ],
    formatInstructions: {
      html:     '- Используй чистый HTML5 с inline CSS или тегом <style>\n- Без внешних CSS-фреймворков',
      react:    '- Используй функциональные компоненты React\n- Используй Tailwind CSS для всех стилей\n- Экспортируй главный компонент как default export',
      vue:      '- Используй Vue 3 Single File Components (<template>, <script setup>, <style scoped>)\n- Без внешних CSS-фреймворков кроме опционального Tailwind',
      tailwind: '- Используй HTML5 с утилитарными классами Tailwind CSS\n- Никакого дополнительного CSS кроме Tailwind',
    },
    imgNote:          '- Изображения как <img> с подходящим alt из поля placeholder',
    measureNote:      '- Все размеры в px (кроме Tailwind – используй ближайший утилитарный класс)',
    noResponsiveNote: (w) => `- Адаптивность не требуется – десктопный макет (${w}px в ширину)`,
    addToExistingInstructions: `ИНТЕГРАЦИЯ В СУЩЕСТВУЮЩИЙ ДИЗАЙН:
- Интегрируй этот макет в существующий проект — не создавай с нуля
- Следуй существующей дизайн-системе: цветовая палитра, типографика, отступы и паттерны компонентов
- Не вводи новые библиотеки или CSS-фреймворки, если они уже есть в проекте
- Соблюдай принятые конвенции (именование классов, структура файлов, API компонентов)
- Переиспользуй существующие компоненты и утилиты везде где возможно
- Согласуй отступы и размеры с ритмом существующего дизайна
- Убедись, что новый макет органично вписывается в уже существующее`,
    responsiveInstructions: `АДАПТИВНЫЙ ДИЗАЙН:
- Сделать макет полностью адаптивным с брейкпоинтами: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1440px)
- Мобильный (< 640px): элементы вертикально, полная ширина, уменьшить отступы
- Планшет (640px–1024px): адаптировать для средних экранов, возможна 2-колоночная сетка
- Десктоп (> 1024px): использовать точный макет из JSON-спецификации
- Пропорционально уменьшать размеры шрифтов на маленьких экранах
- Кнопки и интерактивные элементы не менее 44px в высоту на мобильном
- Изображения всегда с max-width: 100% и height: auto
- Сохранять визуальную иерархию и читаемость на всех брейкпоинтах`,
    descHeading:   (c, pos, fs, col, h) => `Заголовок H${h} "${c}" (${pos}, размер шрифта ${fs}px, цвет ${col})`,
    descParagraph: (c, pos, fs)      => `Текстовый абзац "${c}" (${pos}, ${fs}px)`,
    descButton:    (c, pos, w, h, bg)=> `Кнопка "${c}" (${pos}, ${w}×${h}px, фон ${bg})`,
    descImage:     (p, pos, w, h)    => `Заглушка изображения: "${p}" (${pos}, ${w}×${h}px)`,
    descRectangle: (pos, w, h, bg)   => `Прямоугольник (${pos}, ${w}×${h}px, фон ${bg})`,
    descCircle:    (pos, w, h, bg)   => `Круг (${pos}, ${w}×${h}px, фон ${bg})`,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<OutputFormat, string> = {
  html:     'HTML/CSS',
  react:    'React + Tailwind',
  vue:      'Vue',
  tailwind: 'HTML + Tailwind CSS',
};

function getPositionLabel(
  el: CanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  t: Translation
): string {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const xRatio = cx / canvasWidth;
  const yRatio = cy / canvasHeight;

  let yLabel: string;
  if (yRatio < 0.2)      yLabel = t.posY[0];
  else if (yRatio < 0.4) yLabel = t.posY[1];
  else if (yRatio < 0.6) yLabel = t.posY[2];
  else if (yRatio < 0.8) yLabel = t.posY[3];
  else                   yLabel = t.posY[4];

  let xLabel: string;
  if (xRatio < 0.33)      xLabel = t.posX[0];
  else if (xRatio < 0.66) xLabel = t.posX[1];
  else                    xLabel = t.posX[2];

  return `${yLabel}-${xLabel}`;
}

function truncate(text: string, max = 60): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function describeElement(
  el: CanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  t: Translation
): string {
  const pos = getPositionLabel(el, canvasWidth, canvasHeight, t);

  switch (el.type) {
    case 'heading':
      return t.descHeading(truncate((el as TextElement).content), pos, (el as TextElement).fontSize, (el as TextElement).color, (el as TextElement).hLevel ?? 1);
    case 'paragraph':
      return t.descParagraph(truncate((el as TextElement).content), pos, (el as TextElement).fontSize);
    case 'button':
      return t.descButton((el as TextElement).content, pos, el.width, el.height, (el as TextElement).backgroundColor);
    case 'image':
      return t.descImage((el as ImageElement).placeholder, pos, el.width, el.height);
    case 'rectangle':
      return t.descRectangle(pos, el.width, el.height, (el as ShapeElement).backgroundColor);
    case 'circle':
      return t.descCircle(pos, el.width, el.height, (el as ShapeElement).backgroundColor);
  }
}

function elementToJsonSpec(
  el: CanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  t: Translation
): Record<string, unknown> {
  const pos = getPositionLabel(el, canvasWidth, canvasHeight, t);
  const base = {
    id: el.id,
    type: el.type,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    opacity: el.opacity,
    zIndex: el.zIndex,
    position_label: pos,
  };

  switch (el.type) {
    case 'heading':
    case 'paragraph':
    case 'button': {
      const tx = el as TextElement;
      return {
        ...base,
        ...(tx.type === 'heading' ? { hLevel: tx.hLevel ?? 1, htmlTag: `h${tx.hLevel ?? 1}` } : {}),
        content: tx.content,
        fontSize: tx.fontSize,
        fontFamily: tx.fontFamily,
        fontWeight: tx.fontWeight,
        fontStyle: tx.fontStyle ?? 'normal',
        color: tx.color,
        backgroundColor: tx.backgroundColor,
        textAlign: tx.textAlign,
        textTransform: tx.textTransform ?? 'none',
        textDecoration: tx.textDecoration ?? 'none',
        letterSpacing: tx.letterSpacing ?? 'normal',
        lineHeight: tx.lineHeight ?? 'normal',
        borderRadius: tx.borderRadius,
      };
    }
    case 'rectangle':
    case 'circle': {
      const s = el as ShapeElement;
      return { ...base, backgroundColor: s.backgroundColor, borderColor: s.borderColor, borderWidth: s.borderWidth, borderRadius: s.borderRadius };
    }
    case 'image': {
      const img = el as ImageElement;
      return {
        ...base,
        placeholder:    img.placeholder,
        objectFit:      img.objectFit,
        objectPosition: img.objectPosition ?? 'center',
        borderRadius:   img.borderRadius,
        borderWidth:    img.borderWidth  ?? 0,
        borderColor:    img.borderColor  ?? '#d1d5db',
        shadow:         img.shadow       ?? 'none',
        grayscale:      img.grayscale    ?? false,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function generatePrompt(
  state: CanvasState,
  userContext = '',
  outputFormat: OutputFormat = 'html',
  language: PromptLanguage = 'de',
  responsive = false,
  addToExisting = false
): GeneratedPrompt {
  const { elements, canvasWidth, canvasHeight } = state;
  const t = TRANSLATIONS[language];
  const formatLabel = FORMAT_LABELS[outputFormat];

  if (elements.length === 0) {
    return { readable: t.noElements, json: '{}', combined: t.noElements };
  }

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // --- READABLE ---
  const contextLine = userContext.trim()
    ? `\n${t.contextLabel}: ${userContext.trim()}\n`
    : '';

  const descriptions = sorted
    .map((el) => `- ${describeElement(el, canvasWidth, canvasHeight, t)}`)
    .join('\n');

  const readable = `${t.role(formatLabel)}
${contextLine}
${t.layoutDescLabel}:
${t.pageDesc(canvasWidth, canvasHeight)}

${descriptions}

${t.pixelNote}`;

  // --- JSON ---
  const jsonSpec = {
    canvas: { width: canvasWidth, height: canvasHeight },
    elements: sorted.map((el) => elementToJsonSpec(el, canvasWidth, canvasHeight, t)),
  };
  const json = JSON.stringify(jsonSpec, null, 2);

  // --- COMBINED ---
  const instructions = [
    ...t.coreInstructions(formatLabel),
    t.formatInstructions[outputFormat],
    t.imgNote,
    t.measureNote,
    responsive ? '' : t.noResponsiveNote(canvasWidth),
  ].filter(Boolean).join('\n');

  const responsiveBlock    = responsive    ? `\n${t.responsiveInstructions}`    : '';
  const addToExistingBlock = addToExisting ? `\n${t.addToExistingInstructions}` : '';

  const combined = `${readable}

${t.techSpecLabel}:
\`\`\`json
${json}
\`\`\`

${t.instructionLabel}:
${instructions}${responsiveBlock}${addToExistingBlock}`;

  return { readable, json, combined };
}
