export const ASSISTANT_VISUAL_STATES = Object.freeze([
  'idle', 'thinking', 'working', 'success', 'error', 'confirmation'
]);

export class AssistantVisualController {
  constructor(root, manifest) {
    this.root = root;
    this.manifest = manifest;
    this.mascot = root.querySelector('[data-kurenai-mascot]');
    this.overlay = root.querySelector('[data-kurenai-overlay]');
    this.status = root.querySelector('[data-kurenai-status]');
    this.timer = null;
    this.mascot.src = new URL(manifest.character.portrait.default, document.baseURI);
    this.setState('idle', { label: 'Ready' });
  }

  setState(state, { label = state, detail = '', returnToIdle = true } = {}) {
    if (!ASSISTANT_VISUAL_STATES.includes(state)) {
      throw new TypeError(`Unknown assistant visual state: ${state}`);
    }

    clearTimeout(this.timer);
    const config = this.manifest.states[state];
    this.root.className = `kurenai-visual ${config.className}`;
    this.root.dataset.state = state;

    if (config.overlay) {
      this.overlay.hidden = false;
      this.overlay.src = new URL(config.overlay, document.baseURI);
    } else {
      this.overlay.hidden = true;
      this.overlay.removeAttribute('src');
    }

    if (this.status) {
      this.status.textContent = detail ? `${label} — ${detail}` : label;
    }

    if (returnToIdle && config.autoReturnMs) {
      this.timer = setTimeout(() => this.setState('idle', { label: 'Ready' }), config.autoReturnMs);
    }
  }

  destroy() {
    clearTimeout(this.timer);
  }
}
