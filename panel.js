document.addEventListener("DOMContentLoaded", () => {
  const input  = document.getElementById("input");
  const output = document.getElementById("output");
  const charset = document.getElementById("charset"); // 使えるのは UTF-8 / UTF-16 等（ブラウザ依存）
  const encodeMode = document.getElementById("encodeMode"); // 追加想定の選択肢
  const encodeBtn = document.getElementById("encodeBtn");
  const decodeBtn = document.getElementById("decodeBtn");

  encodeBtn.addEventListener("click", () => {
    const text = input.value;
    const enc  = charset.value;
    const mode = encodeMode.value; // "unicode-escape" or "utf8-bytes"
    output.value = encodeUnicode(text, mode, enc);
  });

  decodeBtn.addEventListener("click", () => {
    const text = input.value;
    const enc  = charset.value;
    output.value = decodeAnyEscape(text, enc);
  });
});

/**
 * mode:
 *  - "unicode-escape" : 文字ごとに \uXXXX (BMP) / \u{HHHHH} (非BMP) を出す
 *  - "utf8-bytes"      : TextEncoder(enc) でバイト化して \xHH を出す
 */
function encodeUnicode(str, mode = "unicode-escape", enc = "utf-8") {
  if (mode === "utf8-bytes") {
    try {
      // TextEncoder はブラウザでサポートされているエンコーディングのみ
      const encoder = new TextEncoder(); // 引数指定はブラウザ依存のため省略することが安全
      const bytes = encoder.encode(str);
      return Array.from(bytes).map(b => "\\x" + b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      return `Error(encode bytes): ${e.message}`;
    }
  }

  // unicode-escape: 各コードポイントを \uXXXX（または \u{XXXXX}）で表現
  let out = "";
  for (const cp of Array.from(str)) {
    const code = cp.codePointAt(0);
    if (code <= 0xffff) {
      out += "\\u" + code.toString(16).padStart(4, "0");
    } else {
      // BMP外は \u{...} 形式で表現
      out += "\\u{" + code.toString(16) + "}";
    }
  }
  return out;
}

/**
 * 入力に含まれる可能性のある形式を判定してデコードする。
 * - \uXXXX
 * - \u{XXXXXX}
 * - \xHH (bytes) -> TextDecoder(enc) でデコード（UTF-8 等）
 *
 * enc はバイト->文字列の際の文字コード。TextDecoder はブラウザでサポートされるもののみ。
 */
function decodeAnyEscape(text, enc = "utf-8") {
  if (!text) return "";

  // 1) \u{...} を先に置換（CodePoint）
  let replaced = text.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return `\\u{${hex}}`;
    }
  });

  // 2) \uXXXX（4桁）を置換（サロゲート対は元々 \uXXXX\uXXXX になっている想定）
  replaced = replaced.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // 3) \xHH の連続をバイト列にしてデコードする（例: \xE3\x81\x82 ...）
  //    テキスト中の単独 \xHH をすべてバイト配列に変換し、連続した部分ごとに TextDecoder で復元する。
  try {
    // 分割して、\xHHの連続塊のみ復元する
    replaced = replaced.replace(/(?:\\x[0-9a-fA-F]{2})+/g, (m) => {
      // m は \xHH\xHH... の塊
      const bytes = [];
      const hexes = m.match(/\\x([0-9a-fA-F]{2})/g) || [];
      for (const h of hexes) {
        bytes.push(parseInt(h.slice(2), 16));
      }
      try {
        // TextDecoder は enc に依存（shift-jis など未対応の場合あり）
        const decoder = new TextDecoder(enc);
        return decoder.decode(new Uint8Array(bytes));
      } catch (e) {
        // TextDecoder に失敗したら、16進 -> そのまま文字に変換（代替）
        return bytes.map(b => String.fromCharCode(b)).join("");
      }
    });
  } catch (e) {
    // 何か起きても失敗しないように
    console.error("byte-decode error:", e);
  }

  return replaced;
}