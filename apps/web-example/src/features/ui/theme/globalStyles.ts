import { reset } from 'stitches-reset';

import { stitches } from './stitches.config';

/**
 * Global CSS, added to main application entrypoint.
 */
const globalStyles = stitches.globalCss({
  ...reset,
  '*': {
    boxSizing: 'border-box',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },

  'html, body': {
    height: '100%',
  },

  html: {
    '--scroll-behavior': 'smooth',
    scrollBehavior: 'smooth',
  },

  body: {
    position: 'relative',

    color: '$body',
    background: '$background',

    fontFamily: '$MaisonNeue',
    fontWeight: 500,
    textRendering: 'optimizeSpeed',
    overscrollBehaviorY: 'none',

    '&.overflow-hidden': {
      overflow: 'hidden',
    },
  },

  // Next Root element
  '#__next': {
    height: '100%',
    isolation: 'isolate',
  },

  // Storybook Root element
  '#root': {
    height: '100%',
    isolation: 'isolate',
  },
});

export { globalStyles };
