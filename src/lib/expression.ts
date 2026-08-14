/**
 * Parsing and canonical-form comparison for single-variable integer expressions.
 *
 * Grammar: integer coefficients, one declared variable letter, infix +/-, unary
 * -, parentheses, and implicit multiplication by juxtaposition (`2x`). No
 * exponents, second variable, or division — any unrecognized character or a
 * degree above 1 (e.g. `x*x`, reachable only through explicit juxtaposition
 * since there is no exponent key) makes the whole entry unparseable rather
 * than partially interpreted.
 */

type Token =
  | { kind: 'num'; value: number }
  | { kind: 'var' }
  | { kind: 'op'; value: '+' | '-' }
  | { kind: 'lparen' }
  | { kind: 'rparen' }

function tokenize(text: string, variable: string): Token[] | null {
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
      tokens.push({ kind: 'var' })
      i++
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
    return t !== undefined && (t.kind === 'num' || t.kind === 'var' || t.kind === 'lparen')
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
export function parseExpression(raw: string, variable: string): ExpressionNode | null {
  const text = raw.trim().replace(/\s+/g, '')
  if (text === '') return null
  const tokens = tokenize(text, variable)
  if (!tokens || tokens.length === 0) return null
  const parser = new Parser(tokens)
  const node = parser.parseExpr()
  if (!node || parser.hasMore()) return null
  return node
}

/** `coeff * variable + constant` — the only shape a degree-1 expression can take. */
type Linear = { constant: number; coeff: number }

/** Null means the expression is degree 2 or higher — out of grammar. */
function evalLinear(node: ExpressionNode): Linear | null {
  switch (node.kind) {
    case 'num':
      return { constant: node.value, coeff: 0 }
    case 'var':
      return { constant: 0, coeff: 1 }
    case 'neg': {
      const inner = evalLinear(node.expr)
      if (!inner) return null
      return { constant: -inner.constant, coeff: -inner.coeff }
    }
    case 'add': {
      let acc: Linear = { constant: 0, coeff: 0 }
      for (const term of node.terms) {
        const t = evalLinear(term)
        if (!t) return null
        acc = { constant: acc.constant + t.constant, coeff: acc.coeff + t.coeff }
      }
      return acc
    }
    case 'mul': {
      let acc: Linear = { constant: 1, coeff: 0 }
      for (const factor of node.factors) {
        const f = evalLinear(factor)
        if (!f) return null
        // Both sides already carry a variable term: multiplying them produces
        // a degree-2 result, which this grammar does not represent.
        if (acc.coeff !== 0 && f.coeff !== 0) return null
        acc = {
          constant: acc.constant * f.constant,
          coeff: acc.constant * f.coeff + acc.coeff * f.constant,
        }
      }
      return acc
    }
  }
}

function serializeLinear(linear: Linear, variable: string): string {
  const { constant, coeff } = linear
  if (coeff === 0) return String(constant)
  const coeffPart = coeff === 1 ? variable : coeff === -1 ? `-${variable}` : `${coeff}${variable}`
  if (constant === 0) return coeffPart
  return constant > 0 ? `${coeffPart}+${constant}` : `${coeffPart}${constant}`
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
export function canonicalForm(raw: string, variable: string, form: ExpressionForm): string | null {
  const node = parseExpression(raw, variable)
  if (!node) return null
  // The degree gate applies to every form: an out-of-grammar expression is
  // invalid however it would be compared.
  const linear = evalLinear(node)
  if (!linear) return null
  return form === 'expanded' ? serializeLinear(linear, variable) : serializeExact(node, variable)
}
