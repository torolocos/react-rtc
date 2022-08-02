/**
 * Map of existing breakpoints.
 */
enum EBreakpoint {
  xSmall = 'xSmall',
  small = 'small',
  small2 = 'small2',
  medium = 'medium',
  medium2 = 'medium2',
  large = 'large',
  large2 = 'large2',
  xlarge = 'xlarge',
  xlarge2 = 'xlarge2',
  max = 'max',
}

/**
 * List of breakpoint ids.
 */
const breakpointKeys = Object.values(EBreakpoint) as EBreakpoint[]

type TBreakpointNames = Record<EBreakpoint, string>

/**
 * Breakpoint names, used on admin input fields.
 */
const breakpointNames: TBreakpointNames = {
  xSmall: 'Extra small',
  small: 'Small',
  small2: 'Small +',
  medium: 'Medium',
  medium2: 'Medium +',
  large: 'Large',
  large2: 'Large +',
  xlarge: 'Extra large',
  xlarge2: 'Extra large +',
  max: 'Maximum',
}

type TBreakpoints = Record<EBreakpoint, number>

/**
 * Breakpoint width values map.
 */
const breakpoints: TBreakpoints = {
  xSmall: 320,
  small: 375,
  small2: 480,
  medium: 768,
  medium2: 1024,
  large: 1280,
  large2: 1440,
  xlarge: 1680,
  xlarge2: 1920,
  max: 2560,
}

export type { TBreakpointNames, TBreakpoints }

export { EBreakpoint, breakpoints, breakpointKeys, breakpointNames }
