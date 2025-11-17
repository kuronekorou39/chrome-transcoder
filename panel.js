// ======================
// Tab Navigation
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");

      // Remove active class from all tabs and panels
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      // Add active class to clicked tab and corresponding panel
      tab.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  initUnicode();
  initURL();
  initBase64();
  initHTML();
  initJSON();
  initHex();
  initOutputControls();
});

// ======================
// Output Controls (Copy & Reflect)
// ======================
function initOutputControls() {
  // Copy button functionality
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const outputId = btn.getAttribute("data-copy");
      const outputElement = document.getElementById(outputId);
      const text = outputElement.textContent;

      if (!text || text === "結果がここに表示されます") {
        return;
      }

      try {
        await navigator.clipboard.writeText(text);

        // Visual feedback
        const originalText = btn.textContent;
        btn.textContent = "✓";
        btn.classList.add("copied");

        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove("copied");
        }, 1000);
      } catch (e) {
        console.error("Copy failed:", e);
        btn.textContent = "✗";
        setTimeout(() => {
          btn.textContent = "📋";
        }, 1000);
      }
    });
  });

  // Reflect button functionality
  document.querySelectorAll("[data-reflect]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-reflect");
      const outputElement = document.getElementById(`${tabName}-output`);
      const inputElement = document.getElementById(`${tabName}-input`);
      const text = outputElement.textContent;

      if (!text || text === "結果がここに表示されます") {
        return;
      }

      inputElement.value = text;

      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = "✓";

      setTimeout(() => {
        btn.textContent = originalText;
      }, 800);
    });
  });
}

// ======================
// Unicode Functions
// ======================
function initUnicode() {
  const input = document.getElementById("unicode-input");
  const output = document.getElementById("unicode-output");
  const target = document.getElementById("unicode-target");
  const encodeBtn = document.getElementById("unicode-encode");
  const decodeBtn = document.getElementById("unicode-decode");

  encodeBtn.addEventListener("click", () => {
    try {
      output.textContent = encodeUnicode(input.value, target.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeUnicode(input.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });
}

function encodeUnicode(str, target = "non-ascii") {
  if (!str) return "";

  // 文字をエンコードするかどうか判定する関数
  function shouldEncode(char) {
    const code = char.codePointAt(0);

    switch (target) {
      case "all":
        return true;
      case "non-ascii":
        // ASCII範囲外 (U+0080以上)
        return code >= 0x80;
      case "japanese":
        // ひらがな (U+3040-U+309F), カタカナ (U+30A0-U+30FF), 漢字 (U+4E00-U+9FFF)
        return (code >= 0x3040 && code <= 0x309F) ||
               (code >= 0x30A0 && code <= 0x30FF) ||
               (code >= 0x4E00 && code <= 0x9FFF);
      case "multibyte":
        // U+0080以上
        return code >= 0x80;
      case "non-alnum":
        // 英数字以外
        return !/[a-zA-Z0-9]/.test(char);
      default:
        return false;
    }
  }

  // unicode-escape: 文字単位でエンコードするか判定
  let out = "";
  for (const cp of str) {
    const code = cp.codePointAt(0);

    if (shouldEncode(cp)) {
      if (code <= 0xffff) {
        out += "\\u" + code.toString(16).padStart(4, "0");
      } else {
        out += "\\u{" + code.toString(16) + "}";
      }
    } else {
      out += cp;
    }
  }
  return out;
}

function decodeUnicode(text) {
  if (!text) return "";

  // \u{XXXXX} 形式をデコード
  let replaced = text.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return `\\u{${hex}}`;
    }
  });

  // \uXXXX 形式をデコード
  replaced = replaced.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return replaced;
}

// ======================
// URL Functions
// ======================
function initURL() {
  const input = document.getElementById("url-input");
  const output = document.getElementById("url-output");
  const charset = document.getElementById("url-charset");
  const caseOption = document.getElementById("url-case");
  const encodeBtn = document.getElementById("url-encode");
  const decodeBtn = document.getElementById("url-decode");

  encodeBtn.addEventListener("click", () => {
    try {
      output.textContent = encodeURL(input.value, charset.value, caseOption.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeURL(input.value, charset.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });
}

function encodeURL(str, charset = "utf-8", letterCase = "upper") {
  if (!str) return "";

  let bytes;

  if (charset === "utf-8") {
    // UTF-8: 標準のTextEncoderを使用
    const encoder = new TextEncoder();
    bytes = encoder.encode(str);
  } else if (typeof Encoding !== 'undefined') {
    // Shift-JIS, EUC-JP: encoding-javascriptライブラリを使用
    const unicodeArray = [];
    for (let i = 0; i < str.length; i++) {
      unicodeArray.push(str.charCodeAt(i));
    }

    const encodingType = charset.toUpperCase().replace('-', '');
    bytes = Encoding.convert(unicodeArray, {
      to: encodingType,
      from: 'UNICODE'
    });
  } else {
    // ライブラリが読み込まれていない場合はUTF-8にフォールバック
    console.warn(`Encoding library not loaded. Falling back to UTF-8.`);
    const encoder = new TextEncoder();
    bytes = encoder.encode(str);
  }

  // バイト配列をパーセントエンコーディングに変換
  let encoded = "";
  for (let i = 0; i < bytes.length; i++) {
    const hex = bytes[i].toString(16).padStart(2, '0');
    encoded += "%" + (letterCase === "upper" ? hex.toUpperCase() : hex);
  }

  return encoded;
}

function decodeURL(str, charset = "utf-8") {
  if (!str) return "";

  try {
    if (charset === "utf-8") {
      // UTF-8: 標準のdecodeURIComponentを使用
      return decodeURIComponent(str);
    } else if (typeof Encoding !== 'undefined') {
      // Shift-JIS, EUC-JP: パーセントエンコーディングをバイト配列に変換
      const bytes = [];
      const matches = str.match(/%[0-9a-fA-F]{2}|./g) || [];

      for (const match of matches) {
        if (match.startsWith('%')) {
          bytes.push(parseInt(match.slice(1), 16));
        } else {
          // パーセントエンコードされていない文字はそのまま
          bytes.push(match.charCodeAt(0));
        }
      }

      // バイト配列を指定された文字コードからUnicodeに変換
      const encodingType = charset.toUpperCase().replace('-', '');
      const unicodeArray = Encoding.convert(bytes, {
        to: 'UNICODE',
        from: encodingType
      });

      // Unicode配列を文字列に変換
      return Encoding.codeToString(unicodeArray);
    } else {
      // ライブラリが読み込まれていない場合はUTF-8にフォールバック
      console.warn(`Encoding library not loaded. Falling back to UTF-8.`);
      return decodeURIComponent(str);
    }
  } catch (e) {
    throw new Error("Invalid URL encoding: " + e.message);
  }
}

// ======================
// Base64 Functions
// ======================
function initBase64() {
  const input = document.getElementById("base64-input");
  const output = document.getElementById("base64-output");
  const encodeBtn = document.getElementById("base64-encode");
  const decodeBtn = document.getElementById("base64-decode");

  encodeBtn.addEventListener("click", () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input.value)));
      output.textContent = encoded;
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input.value)));
      output.textContent = decoded;
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });
}

// ======================
// HTML Entities Functions
// ======================
function initHTML() {
  const input = document.getElementById("html-input");
  const output = document.getElementById("html-output");
  const encodeBtn = document.getElementById("html-encode");
  const decodeBtn = document.getElementById("html-decode");

  encodeBtn.addEventListener("click", () => {
    try {
      output.textContent = encodeHTML(input.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeHTML(input.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });
}

function encodeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function decodeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.innerHTML = str;
  return div.textContent;
}

// ======================
// JSON Functions
// ======================
function initJSON() {
  const input = document.getElementById("json-input");
  const output = document.getElementById("json-output");
  const formatBtn = document.getElementById("json-format");
  const minifyBtn = document.getElementById("json-minify");
  const escapeBtn = document.getElementById("json-escape");

  formatBtn.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(input.value);
      output.textContent = JSON.stringify(parsed, null, 2);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  minifyBtn.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(input.value);
      output.textContent = JSON.stringify(parsed);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  escapeBtn.addEventListener("click", () => {
    try {
      output.textContent = JSON.stringify(input.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });
}

// ======================
// Hex Functions
// ======================
function initHex() {
  const input = document.getElementById("hex-input");
  const output = document.getElementById("hex-output");
  const delimiter = document.getElementById("hex-delimiter");
  const encodeBtn = document.getElementById("hex-encode");
  const decodeBtn = document.getElementById("hex-decode");

  encodeBtn.addEventListener("click", () => {
    try {
      output.textContent = encodeHex(input.value, delimiter.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeHex(input.value);
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
    }
  });
}

function encodeHex(str, delim = "") {
  if (!str) return "";
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const hexArray = Array.from(bytes).map(b => b.toString(16).padStart(2, "0"));
  return hexArray.join(delim);
}

function decodeHex(str) {
  if (!str) return "";
  // Remove common delimiters
  const cleaned = str.replace(/[\s:-]/g, "");

  if (cleaned.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }

  const bytes = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(parseInt(cleaned.substr(i, 2), 16));
  }

  const decoder = new TextDecoder("utf-8");
  return decoder.decode(new Uint8Array(bytes));
}