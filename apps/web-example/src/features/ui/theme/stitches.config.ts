import { createStitches } from '@stitches/react';

const stitches = createStitches({
  theme: {
    fonts: {
      MaisonNeue:
        '"Maison Neue", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      Rift: 'Rift, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      monospace: '"Maison Neue Mono", "Consolas", "SF Mono", monospace',
    },
    colors: {
      primary: '#286dfe',
      secondary: '#202329',
      tertiary: '#2a9ef4',
      text: '#8d8e94',
      title: '#e6e8ea',
      body: '#131517',
      danger: '#cf4342',
      success: '#57a77d',
      background: '#1d1e23',
    },
    // fontSizes: {
    //   1: '13px',
    //   2: '15px',
    //   3: '17px',
    // },
  },
});

export { stitches };
