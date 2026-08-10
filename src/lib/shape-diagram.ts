import { rational, type Rational } from './rational'

/** Equal-part shapes used to make fraction meaning visible. */
export type ShapeDiagram = {
  kind: 'bar' | 'circle' | 'grid'
  parts: number
  shadedParts: number
}

/** Refuse data that would draw a mathematically false figure. */
export function assertShapeDiagram(diagram: ShapeDiagram): void {
  if (diagram.kind !== 'bar' && diagram.kind !== 'circle' && diagram.kind !== 'grid') {
    throw new Error('diagram: kind must be bar, circle, or grid')
  }
  if (!Number.isInteger(diagram.parts) || diagram.parts < 1) {
    throw new Error('diagram: parts must be a positive whole number')
  }
  if (
    !Number.isInteger(diagram.shadedParts) ||
    diagram.shadedParts < 0 ||
    diagram.shadedParts > diagram.parts
  ) {
    throw new Error('diagram: shadedParts must be a whole number from 0 to parts')
  }
}

/** The one name shared by learner-facing text and the rendered image. */
export function shapeDiagramLabel(diagram: ShapeDiagram): string {
  assertShapeDiagram(diagram)
  return `${diagram.kind} in ${diagram.parts} ${diagram.parts === 1 ? 'part' : 'parts'}, ${diagram.shadedParts} shaded`
}

/** The value visible in the figure, independently of the generator's answer. */
export function shapeDiagramFraction(diagram: ShapeDiagram): Rational {
  assertShapeDiagram(diagram)
  return rational(diagram.shadedParts, diagram.parts)
}

/** Closest factor pair, so a grid is rectangular without storing redundant dimensions. */
export function gridDimensions(diagram: ShapeDiagram): { rows: number; columns: number } {
  assertShapeDiagram(diagram)
  if (diagram.kind !== 'grid') throw new Error('diagram: only a grid has rows and columns')

  let rows = Math.floor(Math.sqrt(diagram.parts))
  while (diagram.parts % rows !== 0) rows -= 1

  return { rows, columns: diagram.parts / rows }
}
