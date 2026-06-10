#!/usr/bin/env node
/**
 * Phase-1 AST-shape harness.
 *
 *   node scripts/inspect-ast.js <file.tsrx> [--tail node-type]
 *
 * Parses a TSRX file with @tsrx/core@0.1.25 and prints the resulting ESTree
 * AST as indented JSON, dropping noisy fields (start/end/loc/range/parent)
 * so the structural shape is what stands out.
 *
 * With `--tail Identifier`, prints only the LAST node of that type — useful
 * when you want to compare the shape of, say, the deepest @for in a fixture.
 */
import { readFileSync } from 'node:fs';
import { parseModule } from '@tsrx/core';

const [, , filename, ...flags] = process.argv;
if (!filename) {
	console.error('usage: node scripts/inspect-ast.js <file.tsrx> [--tail <NodeType>]');
	process.exit(1);
}
const tailIdx = flags.indexOf('--tail');
const tailType = tailIdx >= 0 ? flags[tailIdx + 1] : null;

const source = readFileSync(filename, 'utf8');
let ast;
try {
	ast = parseModule(source, filename);
} catch (err) {
	console.error('PARSE ERROR:', err.message);
	process.exit(1);
}

const NOISE = new Set(['start', 'end', 'loc', 'range', 'parent', 'sourceType', 'comments']);

function strip(node, seen = new WeakSet()) {
	if (node == null || typeof node !== 'object') return node;
	if (seen.has(node)) return '[CIRCULAR]';
	seen.add(node);
	if (Array.isArray(node)) return node.map((n) => strip(n, seen));
	const out = {};
	for (const k of Object.keys(node)) {
		if (NOISE.has(k)) continue;
		out[k] = strip(node[k], seen);
	}
	return out;
}

if (tailType) {
	let last = null;
	const visit = (n) => {
		if (n == null || typeof n !== 'object') return;
		if (Array.isArray(n)) return n.forEach(visit);
		if (n.type === tailType) last = n;
		for (const k of Object.keys(n)) {
			if (NOISE.has(k) || k === 'parent') continue;
			visit(n[k]);
		}
	};
	visit(ast);
	if (last) console.log(JSON.stringify(strip(last), null, 2));
	else console.log(`// no '${tailType}' node found`);
} else {
	console.log(JSON.stringify(strip(ast), null, 2));
}
