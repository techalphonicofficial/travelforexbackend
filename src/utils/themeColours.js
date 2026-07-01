const THEME_COLOUR_DEFINITIONS = [
  { key: 'theme_brand_primary', cssVar: '--brand-primary', label: 'Brand Primary', group: 'Primary Palette', type: 'color', default: '#026eb5' },
  { key: 'theme_brand_primary_hover', cssVar: '--brand-primary-hover', label: 'Brand Primary Hover', group: 'Primary Palette', type: 'color', default: '#005f9f' },
  { key: 'theme_brand_primary_light', cssVar: '--brand-primary-light', label: 'Brand Primary Light', group: 'Primary Palette', type: 'color', default: '#c5e5fb' },
  { key: 'theme_brand_primary_border', cssVar: '--brand-primary-border', label: 'Brand Primary Border', group: 'Primary Palette', type: 'color', default: '#7abfee' },
  { key: 'theme_brand_secondary', cssVar: '--brand-secondary', label: 'Brand Secondary', group: 'Primary Palette', type: 'color', default: '#fdce2e' },
  { key: 'theme_brand_secondary_hover', cssVar: '--brand-secondary-hover', label: 'Brand Secondary Hover', group: 'Primary Palette', type: 'color', default: '#f6b800' },
  { key: 'theme_color_primary', cssVar: '--color-primary', label: 'Primary Alias', group: 'Primary Palette', type: 'css', default: 'var(--brand-primary)' },
  { key: 'theme_color_primary_hover', cssVar: '--color-primary-hover', label: 'Primary Hover Alias', group: 'Primary Palette', type: 'css', default: 'var(--brand-primary-hover)' },
  { key: 'theme_color_primary_light', cssVar: '--color-primary-light', label: 'Primary Light Alias', group: 'Primary Palette', type: 'css', default: 'var(--brand-primary-light)' },
  { key: 'theme_color_secondary', cssVar: '--color-secondary', label: 'Secondary Alias', group: 'Primary Palette', type: 'css', default: 'var(--brand-secondary)' },
  { key: 'theme_color_secondary_hover', cssVar: '--color-secondary-hover', label: 'Secondary Hover Alias', group: 'Primary Palette', type: 'css', default: 'var(--brand-secondary-hover)' },
  { key: 'theme_bs_primary', cssVar: '--bs-primary', label: 'Bootstrap Primary', group: 'Primary Palette', type: 'css', default: 'var(--color-primary)' },
  { key: 'theme_bs_secondary', cssVar: '--bs-secondary', label: 'Bootstrap Secondary', group: 'Primary Palette', type: 'css', default: 'var(--color-secondary)' },
  { key: 'theme_bs_link_color', cssVar: '--bs-link-color', label: 'Bootstrap Link', group: 'Primary Palette', type: 'css', default: 'var(--color-primary)' },
  { key: 'theme_bs_link_hover_color', cssVar: '--bs-link-hover-color', label: 'Bootstrap Link Hover', group: 'Primary Palette', type: 'css', default: 'var(--color-primary-hover)' },
  { key: 'theme_color_accent', cssVar: '--color-accent', label: 'Accent', group: 'Primary Palette', type: 'color', default: '#00b894' },
  { key: 'theme_color_accent_hover', cssVar: '--color-accent-hover', label: 'Accent Hover', group: 'Primary Palette', type: 'color', default: '#00a382' },

  { key: 'theme_color_text_primary', cssVar: '--color-text-primary', label: 'Text Primary', group: 'Text', type: 'color', default: '#0a0f1e' },
  { key: 'theme_color_text_secondary', cssVar: '--color-text-secondary', label: 'Text Secondary', group: 'Text', type: 'color', default: '#4a5568' },
  { key: 'theme_color_text_muted', cssVar: '--color-text-muted', label: 'Text Muted', group: 'Text', type: 'color', default: '#8a94a6' },

  { key: 'theme_color_bg', cssVar: '--color-bg', label: 'Background', group: 'Backgrounds', type: 'color', default: '#ffffff' },
  { key: 'theme_color_bg_soft', cssVar: '--color-bg-soft', label: 'Soft Background', group: 'Backgrounds', type: 'color', default: '#f8faff' },
  { key: 'theme_color_bg_card', cssVar: '--color-bg-card', label: 'Card Background', group: 'Backgrounds', type: 'color', default: '#ffffff' },
  { key: 'theme_color_bg_overlay', cssVar: '--color-bg-overlay', label: 'Overlay Background', group: 'Backgrounds', type: 'css', default: 'rgba(10, 15, 30, 0.7)' },

  { key: 'theme_color_border', cssVar: '--color-border', label: 'Border', group: 'Borders', type: 'color', default: '#e2e8f0' },
  { key: 'theme_color_border_focus', cssVar: '--color-border-focus', label: 'Focus Border', group: 'Borders', type: 'css', default: 'var(--color-primary)' },

  { key: 'theme_shadow_xs', cssVar: '--shadow-xs', label: 'Shadow XS', group: 'Shadows', type: 'css', default: '0 1px 3px rgba(0, 0, 0, 0.06)' },
  { key: 'theme_shadow_sm', cssVar: '--shadow-sm', label: 'Shadow SM', group: 'Shadows', type: 'css', default: '0 2px 8px rgba(0, 0, 0, 0.08)' },
  { key: 'theme_shadow_md', cssVar: '--shadow-md', label: 'Shadow MD', group: 'Shadows', type: 'css', default: '0 4px 20px rgba(0, 0, 0, 0.1)' },
  { key: 'theme_shadow_lg', cssVar: '--shadow-lg', label: 'Shadow LG', group: 'Shadows', type: 'css', default: '0 8px 40px rgba(0, 0, 0, 0.12)' },
  { key: 'theme_shadow_xl', cssVar: '--shadow-xl', label: 'Shadow XL', group: 'Shadows', type: 'css', default: '0 16px 60px rgba(0, 0, 0, 0.15)' },
  { key: 'theme_shadow_card_hover', cssVar: '--shadow-card-hover', label: 'Card Hover Shadow', group: 'Shadows', type: 'css', default: '0 12px 40px color-mix(in srgb, var(--color-primary) 18%, transparent)' },

  { key: 'theme_radius_sm', cssVar: '--radius-sm', label: 'Radius SM', group: 'Border Radius', type: 'css', default: '8px' },
  { key: 'theme_radius_md', cssVar: '--radius-md', label: 'Radius MD', group: 'Border Radius', type: 'css', default: '12px' },
  { key: 'theme_radius_lg', cssVar: '--radius-lg', label: 'Radius LG', group: 'Border Radius', type: 'css', default: '16px' },
  { key: 'theme_radius_xl', cssVar: '--radius-xl', label: 'Radius XL', group: 'Border Radius', type: 'css', default: '20px' },
  { key: 'theme_radius_2xl', cssVar: '--radius-2xl', label: 'Radius 2XL', group: 'Border Radius', type: 'css', default: '28px' },
  { key: 'theme_radius_full', cssVar: '--radius-full', label: 'Radius Full', group: 'Border Radius', type: 'css', default: '9999px' },

  { key: 'theme_transition_fast', cssVar: '--transition-fast', label: 'Transition Fast', group: 'Transitions', type: 'css', default: '150ms ease' },
  { key: 'theme_transition_base', cssVar: '--transition-base', label: 'Transition Base', group: 'Transitions', type: 'css', default: '250ms cubic-bezier(0.4, 0, 0.2, 1)' },
  { key: 'theme_transition_slow', cssVar: '--transition-slow', label: 'Transition Slow', group: 'Transitions', type: 'css', default: '400ms cubic-bezier(0.4, 0, 0.2, 1)' },

  { key: 'theme_space_1', cssVar: '--space-1', label: 'Space 1', group: 'Spacing Scale', type: 'css', default: '4px' },
  { key: 'theme_space_2', cssVar: '--space-2', label: 'Space 2', group: 'Spacing Scale', type: 'css', default: '8px' },
  { key: 'theme_space_3', cssVar: '--space-3', label: 'Space 3', group: 'Spacing Scale', type: 'css', default: '12px' },
  { key: 'theme_space_4', cssVar: '--space-4', label: 'Space 4', group: 'Spacing Scale', type: 'css', default: '16px' },
  { key: 'theme_space_5', cssVar: '--space-5', label: 'Space 5', group: 'Spacing Scale', type: 'css', default: '20px' },
  { key: 'theme_space_6', cssVar: '--space-6', label: 'Space 6', group: 'Spacing Scale', type: 'css', default: '24px' },
  { key: 'theme_space_8', cssVar: '--space-8', label: 'Space 8', group: 'Spacing Scale', type: 'css', default: '32px' },
  { key: 'theme_space_10', cssVar: '--space-10', label: 'Space 10', group: 'Spacing Scale', type: 'css', default: '40px' },
  { key: 'theme_space_12', cssVar: '--space-12', label: 'Space 12', group: 'Spacing Scale', type: 'css', default: '48px' },
  { key: 'theme_space_16', cssVar: '--space-16', label: 'Space 16', group: 'Spacing Scale', type: 'css', default: '64px' },
  { key: 'theme_space_20', cssVar: '--space-20', label: 'Space 20', group: 'Spacing Scale', type: 'css', default: '80px' },
  { key: 'theme_space_24', cssVar: '--space-24', label: 'Space 24', group: 'Spacing Scale', type: 'css', default: '96px' },

  { key: 'theme_z_base', cssVar: '--z-base', label: 'Z Base', group: 'Z-index Layers', type: 'css', default: '0' },
  { key: 'theme_z_dropdown', cssVar: '--z-dropdown', label: 'Z Dropdown', group: 'Z-index Layers', type: 'css', default: '100' },
  { key: 'theme_z_sticky', cssVar: '--z-sticky', label: 'Z Sticky', group: 'Z-index Layers', type: 'css', default: '200' },
  { key: 'theme_z_modal', cssVar: '--z-modal', label: 'Z Modal', group: 'Z-index Layers', type: 'css', default: '300' },
  { key: 'theme_z_toast', cssVar: '--z-toast', label: 'Z Toast', group: 'Z-index Layers', type: 'css', default: '400' },

  { key: 'theme_gradient_primary', cssVar: '--gradient-primary', label: 'Primary Gradient', group: 'Gradients', type: 'css', default: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)' },
  { key: 'theme_gradient_hero', cssVar: '--gradient-hero', label: 'Hero Gradient', group: 'Gradients', type: 'css', default: 'linear-gradient(180deg, rgba(10, 15, 30, 0) 0%, rgba(10, 15, 30, 0.85) 100%)' },
  { key: 'theme_gradient_card', cssVar: '--gradient-card', label: 'Card Gradient', group: 'Gradients', type: 'css', default: 'linear-gradient(180deg, transparent 30%, rgba(10, 15, 30, 0.85) 100%)' },
  { key: 'theme_gradient_warm', cssVar: '--gradient-warm', label: 'Warm Gradient', group: 'Gradients', type: 'css', default: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-hover) 100%)' },
  { key: 'theme_gradient_green', cssVar: '--gradient-green', label: 'Green Gradient', group: 'Gradients', type: 'css', default: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)' }
];

const COMPATIBILITY_THEME_VARIABLES = {
  '--primary': 'var(--color-primary)',
  '--primary-hover': 'var(--color-primary-hover)',
  '--primary-light': 'var(--color-primary-light)',
  '--secondary': 'var(--color-secondary)',
  '--secondary-hover': 'var(--color-secondary-hover)',
  '--accent': 'var(--color-accent)',
  '--accent-hover': 'var(--color-accent-hover)',
  '--bg-light': 'var(--color-bg-soft)',
  '--text-main': 'var(--color-text-primary)',
  '--text-muted': 'var(--color-text-muted)'
};

const DEFAULT_THEME_COLOURS = THEME_COLOUR_DEFINITIONS.reduce((acc, item) => {
  acc[item.key] = item.default;
  return acc;
}, {});

function normalizeThemeColor(value, fallback = DEFAULT_THEME_COLOURS.theme_brand_primary) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
}

function normalizeThemeCssValue(value, fallback) {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (raw.length > 240) return fallback;
  if (/[;{}<>"'`\\]/.test(raw)) return fallback;
  return raw;
}

function normalizeThemeValue(value, item) {
  if (item.type === 'color') {
    return normalizeThemeColor(value, item.default);
  }
  return normalizeThemeCssValue(value, item.default);
}

function normalizeThemeColours(values = {}) {
  return THEME_COLOUR_DEFINITIONS.reduce((acc, item) => {
    acc[item.key] = normalizeThemeValue(values[item.key], item);
    return acc;
  }, {});
}

function buildThemePreset(name, slug, overrides = {}, isActive = false) {
  return {
    name,
    slug,
    is_active: isActive,
    values: normalizeThemeColours({
      ...DEFAULT_THEME_COLOURS,
      ...overrides
    })
  };
}

const DEFAULT_THEME_PRESETS = [
  buildThemePreset('Default Theme', 'default-theme', {}, true),
  buildThemePreset('Travel Holiday', 'travel-holiday', {
    theme_brand_primary: '#0087a8',
    theme_brand_primary_hover: '#006d87',
    theme_brand_primary_light: '#d7f4f8',
    theme_brand_primary_border: '#8ed9e6',
    theme_brand_secondary: '#ffb703',
    theme_brand_secondary_hover: '#fb8500',
    theme_color_accent: '#16a34a',
    theme_color_accent_hover: '#15803d',
    theme_color_text_primary: '#102a43',
    theme_color_text_secondary: '#52616b',
    theme_color_text_muted: '#7b8794',
    theme_color_bg: '#ffffff',
    theme_color_bg_soft: '#f2fbff',
    theme_color_bg_card: '#ffffff',
    theme_color_border: '#d9edf5',
    theme_gradient_green: 'linear-gradient(135deg, #16a34a 0%, #14b8a6 100%)'
  }),
  buildThemePreset('Travel Forex', 'travel-forex', {
    theme_brand_primary: '#123c69',
    theme_brand_primary_hover: '#0b2d50',
    theme_brand_primary_light: '#dbeafe',
    theme_brand_primary_border: '#93c5fd',
    theme_brand_secondary: '#fbbf24',
    theme_brand_secondary_hover: '#d97706',
    theme_color_accent: '#059669',
    theme_color_accent_hover: '#047857',
    theme_color_text_primary: '#0f172a',
    theme_color_text_secondary: '#475569',
    theme_color_text_muted: '#94a3b8',
    theme_color_bg: '#ffffff',
    theme_color_bg_soft: '#f8fafc',
    theme_color_bg_card: '#ffffff',
    theme_color_border: '#d6e4f0',
    theme_shadow_card_hover: '0 12px 40px rgba(18, 60, 105, 0.18)',
    theme_gradient_green: 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)'
  })
];

function parseThemeValues(values = {}) {
  if (!values) return {};
  if (typeof values === 'string') {
    try {
      return JSON.parse(values);
    } catch (_) {
      return {};
    }
  }
  return typeof values === 'object' ? values : {};
}

async function loadThemeColours(appSettingRepo, themeRepo = null) {
  if (themeRepo) {
    const activeTheme = await themeRepo.findActive();
    if (activeTheme) {
      return normalizeThemeColours(parseThemeValues(activeTheme.values));
    }
  }

  const values = {};
  await Promise.all(THEME_COLOUR_DEFINITIONS.map(async item => {
    values[item.key] = await appSettingRepo.get(item.key);
  }));

  if (!values.theme_brand_primary) {
    values.theme_brand_primary = await appSettingRepo.get('theme_primary_color');
  }

  return normalizeThemeColours(values);
}

function toRgbTriplet(color) {
  const safeColor = normalizeThemeColor(color);
  return [
    parseInt(safeColor.slice(1, 3), 16),
    parseInt(safeColor.slice(3, 5), 16),
    parseInt(safeColor.slice(5, 7), 16)
  ].join(', ');
}

function buildThemeCssVariables(themeColours = {}) {
  const normalized = normalizeThemeColours(themeColours);
  const variables = THEME_COLOUR_DEFINITIONS.reduce((acc, item) => {
    acc[item.cssVar] = normalized[item.key];
    return acc;
  }, {});

  variables['--bs-primary-rgb'] = toRgbTriplet(normalized.theme_brand_primary);
  variables['--bs-secondary-rgb'] = toRgbTriplet(normalized.theme_brand_secondary);

  Object.entries(COMPATIBILITY_THEME_VARIABLES).forEach(([key, value]) => {
    variables[key] = value;
  });

  return variables;
}

function buildThemeRootCss(themeColours = {}) {
  const variables = buildThemeCssVariables(themeColours);
  return `:root {\n${Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')}\n}`;
}

module.exports = {
  THEME_COLOUR_DEFINITIONS,
  DEFAULT_THEME_COLOURS,
  DEFAULT_THEME_PRESETS,
  normalizeThemeColor,
  normalizeThemeCssValue,
  normalizeThemeValue,
  normalizeThemeColours,
  parseThemeValues,
  loadThemeColours,
  toRgbTriplet,
  buildThemeCssVariables,
  buildThemeRootCss
};
