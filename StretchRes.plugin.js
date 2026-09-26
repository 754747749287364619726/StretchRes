/**
 * @name StretchRes
 * @author Kami
 * @description Force stretch 4:3 and 1:1 streams to 16:9
 * @version 1.0.0
 */

module.exports = class StretchRes {
  start() {
    this.tag = "fuckass-resolution";
    const raw = `
      div[class*="videoSizer"] {
        aspect-ratio: 16 / 9 !important;
      }
      div[class*="media-engine-video"] video,
      video[class*="media-engine-video"],
      div[class*="videoContainer"] video {
        object-fit: fill !important;
        width: 100% !important;
        height: 100% !important;
      }
    `;

    if (window.BdApi?.DOM?.addStyle) {
      BdApi.DOM.addStyle(this.tag, raw);
    } else {
      let s = document.getElementById(this.tag);
      if (!s) {
        s = document.createElement("style");
        s.id = this.tag;
        document.head.appendChild(s);
      }
      s.textContent = raw;
    }

    this.applyStretch = (el) => {
      if (el.style.width && !el.style.getPropertyPriority("width")) {
        const w = parseFloat(el.style.width);
        if (w > 0) {
          el.style.setProperty("width", `${Math.round(w * (16 / 9))}px`, "important");
          el.dataset.stretched = "1";
        }
      }
    };

    this.obs = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const t = mutations[i].target;
        if (t.classList && (t.classList.contains("videoWrapper__6981d") || t.className.includes("videoWrapper"))) {
          this.applyStretch(t);
        }
      }
    });

    this.obs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style"] });

    document.querySelectorAll('div[class*="videoWrapper__6981d"], div[class*="videoWrapper"]').forEach(this.applyStretch);
  }

  stop() {
    if (window.BdApi?.DOM?.removeStyle) {
      BdApi.DOM.removeStyle(this.tag);
    } else {
      document.getElementById(this.tag)?.remove();
    }

    this.obs?.disconnect();
    this.obs = null;

    document.querySelectorAll('[data-stretched]').forEach(el => {
      el.style.removeProperty("width");
      delete el.dataset.stretched;
    });
  }
};
