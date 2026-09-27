'use strict';
// Runs the decision logic that actually ships inside agent-autonomy.html.
// The <script> is extracted from the single-file page so the test can never
// drift from what is deployed. Rationale for the thresholds lives in
// docs/agent-autonomy-DESIGN_CONTEXT.md — change logic and tests together.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const PAGE = path.join(__dirname, '..', 'site', 'agent-autonomy.html');
function pageScript() {
  const html = fs.readFileSync(PAGE, 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error('No inline <script> found in agent-autonomy.html');
  return match[1];
}

function launch() {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) {
      elements.set(id, {
        id, value: '0', checked: false, textContent: '', style: {},
        classList: { toggle() {} },
        setAttribute() {}, addEventListener() {},
        append(node) {
          const match = (node.innerHTML || '').match(/<input type="range" id="([^"]+)"[^>]*value="(\d+)"/);
          if (match) element(match[1]).value = match[2];
        },
        replaceChildren() {},
      });
    }
    return elements.get(id);
  };
  const doc = {
    getElementById: element,
    createElement(tag) { return { tag, innerHTML: '', textContent: '', style: {} }; },
  };
  element('oversightMode').value = 'auto';
  const ctx = vm.createContext({
    document: doc, navigator: { clipboard: { writeText: async () => {} } },
    window: { print() {} }, console,
  });
  vm.runInContext(pageScript(), ctx);
  const results = () => JSON.parse(JSON.stringify(vm.runInContext('last', ctx)));
  return { element, ctx, results, refresh: () => vm.runInContext('update()', ctx) };
}

test('default assessment renders and returns a workflow recommendation', () => {
  const a = launch();
  assert.match(a.results().recommendation, /Workflow/);
  assert.ok(a.element('oversight').textContent);
});
test('ambiguous inputs without agency suggest AI-assisted workflow', () => {
  const a=launch();
  a.element('input').value='4'; a.element('judgment').value='4'; a.refresh();
  assert.match(a.results().recommendation,/AI-assisted workflow/);
});
test('high need and value with evidenced controls is a higher-autonomy candidate', () => {
  const a=launch();
  for (const id of ['path','choices','changes','multi','benefit','delay','identity','monitor','recover']) a.element(id).value='4';
  for (const id of ['impact','scope']) a.element(id).value='0';
  a.element('reverse').value='4';
  a.refresh();
  assert.match(a.results().recommendation,/Higher-autonomy agent/);
});
test('mandatory approval prevents higher-autonomy recommendation and flags supervision-only', () => {
  const a=launch();
  for (const id of ['path','choices','changes','multi','benefit','delay','identity','monitor','recover']) a.element(id).value='4';
  a.element('impact').value='0';a.element('scope').value='0';a.element('reverse').value='4';
  a.element('approval').checked=true;a.element('oversightMode').value='hotl';a.refresh();
  assert.doesNotMatch(a.results().recommendation,/Higher-autonomy agent/);
  assert.ok(a.results().controls.some(w=>w.includes('supervision')));
});
test('HOOTL conflicts are shown both on screen and in export', () => {
  const a=launch();
  a.element('oversightMode').value='hootl';
  a.element('approval').checked=true;
  a.refresh();
  assert.match(a.element('oversight').textContent,/conflicts/);
  assert.match(a.results().humanOversight,/conflicts/);
  assert.ok(a.results().controls.some(w=>w.includes('Oversight conflict')));
});
test('missing foundational controls limits permissible autonomy to at most one', () => {
  const a=launch();
  a.element('unverified').checked=true;a.refresh();
  assert.ok(+a.results().permissibleAutonomy<=1);
});
