/**
 * Parsing and canonical-form comparison for single-variable integer expressions.
 *
 * Grammar: integer coefficients, one declared variable letter, infix +/-, unary
 * -, parentheses, and implicit multiplication by juxtaposition (`2x`). A
 * degree-two declaration additionally accepts the variable's Unicode square.
 * No general exponents, second variable, or division — any unrecognized
 * character or degree above the declared bound makes the whole entry
 * unparseable rather than partially interpreted.
 */

type Token =
  | { kind: 'num'; value: number }
  | { kind: 'var' }
  | { kind: 'square' }
  | { kind: 'op'; value: '+' | '-' }
  | { kind: 'lparen' }
  | { kind: 'rparen' }

export type ExpressionMaxDegree = 1 | 2

function tokenize(text: string, variable: string, maxDegree: ExpressionMaxDegree): Token[] | null {
  const tokens: Token[] = []
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (c >= '0' && c <= '9') {
      let j = i
      while (j < text.length && text[j] >= '0' && text[j] <= '9') j++
      tokens.push({ kind: 'num', value: Number(text.slice(i, j)) })
      i = j
      continue
    }
    if (c === variable) {
      // `xx` is not conventional exponent notation. Keep it outside the
      // grammar even when degree two makes its algebraic value representable.
      if (text[i + 1] === variable) return null
      if (text[i + 1] === '²') {
        if (maxDegree !== 2) return null
        tokens.push({ kind: 'square' })
        i += 2
      } else {
        tokens.push({ kind: 'var' })
        i++
      }
      continue
    }
    if (c === '+' || c === '-') {
      tokens.push({ kind: 'op', value: c })
      i++
      continue
    }
    if (c === '(') {
      tokens.push({ kind: 'lparen' })
      i++
      continue
    }
    if (c === ')') {
      tokens.push({ kind: 'rparen' })
      i++
      continue
    }
    // Any other character — a different letter, a decimal point, an exponent
    // caret — is outside the grammar.
    return null
  }
  return tokens
}

export type ExpressionNode =
  | { kind: 'num'; value: number }
  | { kind: 'var' }
  | { kind: 'square' }
  | { kind: 'neg'; expr: ExpressionNode }
  | { kind: 'add'; terms: ExpressionNode[] }
  | { kind: 'mul'; factors: ExpressionNode[] }

/**
 * expr := term (('+' | '-') term)*
 * term := factor factor*        -- juxtaposition is multiplication
 * factor := '-' factor | num | var | '(' expr ')'
 */
class Parser {
  private pos = 0
  private tokens: Token[]

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  private next(): Token | undefined {
    return this.tokens[this.pos++]
  }

  hasMore(): boolean {
    return this.pos < this.tokens.length
  }

  parseExpr(): ExpressionNode | null {
    const first = this.parseTerm()
    if (!first) return null
    const terms = [first]
    for (let t = this.peek(); t?.kind === 'op'; t = this.peek()) {
      this.next()
      const rhs = this.parseTerm()
      if (!rhs) return null
      terms.push(t.value === '-' ? { kind: 'neg', expr: rhs } : rhs)
    }
    return terms.length === 1 ? terms[0] : { kind: 'add', terms }
  }

  private parseTerm(): ExpressionNode | null {
    const first = this.parseFactor()
    if (!first) return null
    const factors = [first]
    while (this.startsFactor()) {
      const f = this.parseFactor()
      if (!f) return null
      factors.push(f)
    }
    return factors.length === 1 ? factors[0] : { kind: 'mul', factors }
  }

  private startsFactor(): boolean {
    const t = this.peek()
    return t !== undefined && (
      t.kind === 'num' || t.kind === 'var' || t.kind === 'square' || t.kind === 'lparen'
    )
  }

  private parseFactor(): ExpressionNode | null {
    const t = this.peek()
    if (!t) return null
    if (t.kind === 'op' && t.value === '-') {
      this.next()
      const inner = this.parseFactor()
      if (!inner) return null
      return { kind: 'neg', expr: inner }
    }
    if (t.kind === 'op') return null // a leading '+' is not a valid factor
    if (t.kind === 'num') {
      this.next()
      return { kind: 'num', value: t.value }
    }
    if (t.kind === 'var') {
      this.next()
      return { kind: 'var' }
    }
    if (t.kind === 'square') {
      this.next()
      return { kind: 'square' }
    }
    if (t.kind === 'lparen') {
      this.next()
      const inner = this.parseExpr()
      if (!inner) return null
      const close = this.next()
      if (close?.kind !== 'rparen') return null
      return inner
    }
    return null
  }
}

/** Parse a raw entry against one declared variable letter, or null if it does not fit the grammar. */
export function parseExpression(
  raw: string,
  variable: string,
  maxDegree: ExpressionMaxDegree = 1,
): ExpressionNode | null {
  const text = raw.trim().replace(/\s+/g, '')
  if (text === '') return null
  const tokens = tokenize(text, variable, maxDegree)
  if (!tokens || tokens.length === 0) return null
  const parser = new Parser(tokens)
  const node = parser.parseExpr()
  if (!node || parser.hasMore()) return null
  return node
}

/** Coefficients at degrees zero, one, and two. */
type Polynomial = [number, number, number]

/** Null means an intermediate result exceeds the problem's declared bound. */
function evalPolynomial(node: ExpressionNode, maxDegree: ExpressionMaxDegree): Polynomial | null {
  switch (node.kind) {
    case 'num':
      return [node.value, 0, 0]
    case 'var':
      return [0, 1, 0]
    case 'square':
      return maxDegree === 2 ? [0, 0, 1] : null
    case 'neg': {
      const inner = evalPolynomial(node.expr, maxDegree)
      if (!inner) return null
      return [-inner[0], -inner[1], -inner[2]]
    }
    case 'add': {
      const acc: Polynomial = [0, 0, 0]
      for (const term of node.terms) {
        const value = evalPolynomial(term, maxDegree)
        if (!value) return null
        for (let degree = 0; degree <= maxDegree; degree += 1) {
          acc[degree] += value[degree]
        }
      }
      return acc
    }
    case 'mul': {
      let acc: Polynomial = [1, 0, 0]
      for (const factor of node.factors) {
        const value = evalPolynomial(factor, maxDegree)
        if (!value) return null
        const next: Polynomial = [0, 0, 0]
        for (let leftDegree = 0; leftDegree <= maxDegree; leftDegree += 1) {
          for (let rightDegree = 0; rightDegree <= maxDegree; rightDegree += 1) {
            const product = acc[leftDegree] * value[rightDegree]
            if (product === 0) continue
            const degree = leftDegree + rightDegree
            // Reject the unsupported work now. A later term cannot cancel an
            // intermediate the problem never allowed the learner to write.
            if (degree > maxDegree) return null
            next[degree] += product
          }
        }
        acc = next
      }
      return acc
    }
  }
}

function serializeExpanded(polynomial: Polynomial, variable: string, maxDegree: ExpressionMaxDegree): string {
  const terms: string[] = []
  for (let degree: number = maxDegree; degree >= 0; degree -= 1) {
    const coefficient = polynomial[degree]
    if (coefficient === 0) continue
    const magnitude = Math.abs(coefficient)
    const variablePart = degree === 2 ? `${variable}²` : degree === 1 ? variable : ''
    const body = degree === 0
      ? String(magnitude)
      : magnitude === 1
        ? variablePart
        : `${magnitude}${variablePart}`
    if (terms.length === 0) terms.push(coefficient < 0 ? `-${body}` : body)
    else terms.push(`${coefficient < 0 ? '-' : '+'}${body}`)
  }
  return terms.join('') || '0'
}

/**
 * Structural canonical form: commutative reordering only, no distribution — so
 * `2(x + 1)` and `2x + 2` serialize differently while `2 + 2x` and `2x + 2`
 * serialize the same.
 */
function serializeExact(node: ExpressionNode, variable: string): string {
  switch (node.kind) {
    case 'num':
      return String(node.value)
    case 'var':
      return variable
    case 'square':
      return `${variable}²`
    case 'neg':
      return `-(${serializeExact(node.expr, variable)})`
    case 'add':
      return node.terms
        .map((t) => serializeChild(t, variable))
        .sort()
        .join('+')
    case 'mul':
      return node.factors
        .map((f) => serializeChild(f, variable))
        .sort()
        .join('*')
  }
}

/**
 * A compound child is parenthesized, so grouping survives into the string.
 *
 * Without this, `3(x + 4)` and `3(4) + x` both flatten to `3*4+x` — the same
 * three symbols joined the same way — and `exact` cannot tell a factored form
 * from a sum that happens to contain a product. Sorting then runs over the
 * wrapped strings, which is why a wrapped factor leads: `(` sorts before a
 * digit. Only the order of a sum's terms or a product's factors is normalized;
 * nesting is not.
 */
function serializeChild(node: ExpressionNode, variable: string): string {
  const text = serializeExact(node, variable)
  return node.kind === 'add' || node.kind === 'mul' ? `(${text})` : text
}

export type ExpressionForm = 'expanded' | 'exact'

/**
 * Parse and canonicalize in one step. Null means the entry is unparseable or
 * describes a degree above what this grammar supports — both are reported as
 * `unparseable` by the caller, never as a silent misparse.
 */
export function canonicalForm(
  raw: string,
  variable: string,
  form: ExpressionForm,
  maxDegree: ExpressionMaxDegree = 1,
): string | null {
  const node = parseExpression(raw, variable, maxDegree)
  if (!node) return null
  // The degree gate applies to every form: an out-of-grammar expression is
  // invalid however it would be compared.
  const polynomial = evalPolynomial(node, maxDegree)
  if (!polynomial) return null
  return form === 'expanded'
    ? serializeExpanded(polynomial, variable, maxDegree)
    : serializeExact(node, variable)
}
