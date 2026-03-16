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
  initJWT();
  initHash();
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
        const originalTitle = btn.title;
        btn.textContent = "✓";
        btn.title = "コピー完了！";
        btn.classList.add("success");

        setTimeout(() => {
          btn.textContent = originalText;
          btn.title = originalTitle;
          btn.classList.remove("success");
        }, 1200);
      } catch (e) {
        console.error("Copy failed:", e);
        const originalText = btn.textContent;
        btn.textContent = "✗";
        btn.classList.add("error");
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove("error");
        }, 1200);
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
      const originalTitle = btn.title;
      btn.textContent = "✓";
      btn.title = "反映完了！";
      btn.classList.add("success");

      setTimeout(() => {
        btn.textContent = originalText;
        btn.title = originalTitle;
        btn.classList.remove("success");
      }, 1000);
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
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeUnicode(input.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
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
  const target = document.getElementById("url-target");
  const charset = document.getElementById("url-charset");
  const caseOption = document.getElementById("url-case");
  const encodeBtn = document.getElementById("url-encode");
  const decodeBtn = document.getElementById("url-decode");

  encodeBtn.addEventListener("click", () => {
    try {
      output.textContent = encodeURL(input.value, target.value, charset.value, caseOption.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeURL(input.value, charset.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });
}

function encodeURL(str, target = "all", charset = "utf-8", letterCase = "upper") {
  if (!str) return "";

  function shouldEncode(char) {
    const code = char.codePointAt(0);
    switch (target) {
      case "all":
        return true;
      case "non-ascii":
        return code >= 0x80;
      case "japanese":
        return (code >= 0x3040 && code <= 0x309F) ||
               (code >= 0x30A0 && code <= 0x30FF) ||
               (code >= 0x4E00 && code <= 0x9FFF);
      case "non-alnum":
        return !/[a-zA-Z0-9]/.test(char);
      default:
        return true;
    }
  }

  function percentEncode(bytes, letterCase) {
    let encoded = "";
    for (let i = 0; i < bytes.length; i++) {
      const hex = bytes[i].toString(16).padStart(2, '0');
      encoded += "%" + (letterCase === "upper" ? hex.toUpperCase() : hex);
    }
    return encoded;
  }

  function encodeChar(char, charset, letterCase) {
    if (charset === "utf-8") {
      const encoder = new TextEncoder();
      return percentEncode(encoder.encode(char), letterCase);
    } else if (typeof Encoding !== 'undefined') {
      const unicodeArray = [];
      for (let i = 0; i < char.length; i++) {
        unicodeArray.push(char.charCodeAt(i));
      }
      const encodingType = charset.toUpperCase().replace('-', '');
      const bytes = Encoding.convert(unicodeArray, {
        to: encodingType,
        from: 'UNICODE'
      });
      return percentEncode(bytes, letterCase);
    } else {
      const encoder = new TextEncoder();
      return percentEncode(encoder.encode(char), letterCase);
    }
  }

  let result = "";
  for (const char of str) {
    if (shouldEncode(char)) {
      result += encodeChar(char, charset, letterCase);
    } else {
      result += char;
    }
  }
  return result;
}

function decodeURL(str, charset = "utf-8") {
  if (!str) return "";

  try {
    if (charset === "utf-8") {
      return decodeURIComponent(str);
    } else if (typeof Encoding !== 'undefined') {
      const bytes = [];
      const matches = str.match(/%[0-9a-fA-F]{2}|./g) || [];

      for (const match of matches) {
        if (match.startsWith('%')) {
          bytes.push(parseInt(match.slice(1), 16));
        } else {
          bytes.push(match.charCodeAt(0));
        }
      }

      const encodingType = charset.toUpperCase().replace('-', '');
      const unicodeArray = Encoding.convert(bytes, {
        to: 'UNICODE',
        from: encodingType
      });

      return Encoding.codeToString(unicodeArray);
    } else {
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
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input.value)));
      output.textContent = decoded;
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
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
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeHTML(input.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
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
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });

  minifyBtn.addEventListener("click", () => {
    try {
      const parsed = JSON.parse(input.value);
      output.textContent = JSON.stringify(parsed);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });

  escapeBtn.addEventListener("click", () => {
    try {
      output.textContent = JSON.stringify(input.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });
}

// ======================
// JWT Functions
// ======================
function initJWT() {
  const input = document.getElementById("jwt-input");
  const output = document.getElementById("jwt-output");
  const decodeBtn = document.getElementById("jwt-decode");

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeJWT(input.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });
}

function decodeJWT(token) {
  if (!token) return "";

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format. Expected 3 parts separated by dots.");
  }

  try {
    // Base64 URL decode
    const base64UrlDecode = (str) => {
      // Convert base64url to base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding
      while (base64.length % 4) {
        base64 += '=';
      }
      return atob(base64);
    };

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    const result = {
      header: header,
      payload: payload,
      signature: parts[2]
    };

    return JSON.stringify(result, null, 2);
  } catch (e) {
    throw new Error("Failed to decode JWT: " + e.message);
  }
}

// ======================
// Hash Functions
// ======================
function initHash() {
  const input = document.getElementById("hash-input");
  const output = document.getElementById("hash-output");
  const algorithm = document.getElementById("hash-algorithm");
  const generateBtn = document.getElementById("hash-generate");

  generateBtn.addEventListener("click", async () => {
    try {
      output.textContent = await generateHash(input.value, algorithm.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });
}

async function generateHash(text, algorithm) {
  if (!text) return "";

  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  let hashAlgorithm;
  switch (algorithm) {
    case "sha256":
      hashAlgorithm = "SHA-256";
      break;
    case "sha1":
      hashAlgorithm = "SHA-1";
      break;
    case "md5":
      // MD5 is not natively supported by Web Crypto API
      // We'll use a simple implementation
      return md5(text);
    default:
      throw new Error("Unsupported algorithm");
  }

  const hashBuffer = await crypto.subtle.digest(hashAlgorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// MD5 implementation
function md5(string) {
  function rotateLeft(value, shift) {
    return (value << shift) | (value >>> (32 - shift));
  }

  function addUnsigned(x, y) {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = addUnsigned(a, x[0]);
    x[1] = addUnsigned(b, x[1]);
    x[2] = addUnsigned(c, x[2]);
    x[3] = addUnsigned(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = addUnsigned(addUnsigned(a, q), addUnsigned(x, t));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function md51(s) {
    const n = s.length;
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++) {
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    }
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function rhex(n) {
    let s = '';
    for (let j = 0; j < 4; j++) {
      s += ((n >> (j * 8 + 4)) & 0x0F).toString(16) +
        ((n >> (j * 8)) & 0x0F).toString(16);
    }
    return s;
  }

  function hex(x) {
    for (let i = 0; i < x.length; i++) {
      x[i] = rhex(x[i]);
    }
    return x.join('');
  }

  // UTF-8 encoding
  const utf8String = unescape(encodeURIComponent(string));
  return hex(md51(utf8String));
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
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
    }
  });

  decodeBtn.addEventListener("click", () => {
    try {
      output.textContent = decodeHex(input.value);
      output.classList.remove("error");
    } catch (e) {
      output.textContent = `Error: ${e.message}`;
      output.classList.add("error");
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