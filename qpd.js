// Script Properties
const scriptProperties = () => PropertiesService.getScriptProperties();

const defaultSettings = {
  font: "Source Sans Pro",
  color: "#777777",
  concatenate: "false",
};

class Settings {
  constructor() {
    const scriptSettings = scriptProperties().getProperties();
    Object.assign(this, defaultSettings, scriptSettings);
    return new Proxy(this, {
      get(target, key) {
        return scriptProperties().getProperty(key) ?? defaultSettings[key];
      },
    });
  }
}

const scriptOptions = new Settings();
const getSettings = () => scriptOptions;
const setSettings = (o) => (scriptProperties().setProperties(o), o);

// The Quizbowl Pronouncing Dictionary is licensed under the
// Open Database License (ODbL).
function retrieveDb() {
  const cache = CacheService.getScriptCache();
  const ids = "abcdefghij".split("");
  const cached = cache.getAll(ids);
  if (ids.every((e) => Object.keys(cached).includes(e))) {
    let values = new Array();
    for (const k in cached) {
      values.push(JSON.parse(cached[k]));
    }
    return values.flat();
  }

  const projectId = "319846857584";
  // ignore duplicate column for now
  const query = `SELECT word, pg
    FROM \`qblint.pgdb.pgs_2023-09-26\`
    WHERE (exemplar IS NULL OR exemplar <> 2)
    AND (utility IS NULL OR utility > 0)`;
  const request = {
    query: query,
    useLegacySql: false,
  };

  let result = BigQuery.Jobs.query(request, projectId);
  let sleepTimeMs = 500;
  while (!result.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    result = BigQuery.Jobs.getQueryResults(
      projectId,
      result.jobReference.jobId,
    );
  }
  // row is an Object with key f containing a list of Objects with key v. Index matches schema.
  const values = result.rows.map((row) =>
    row.f.reduce((r, vs) => {
      r.push(vs.v);
      return r;
    }, []),
  );

  const n = ids.length;
  const is = Array.from(new Array(n), (_, i) => i);
  let obj = new Object();
  for (let i of is) {
    let startIdx = Math.ceil((i * values.length) / n);
    let endIdx = Math.ceil(((i + 1) * values.length) / n) + 1;
    obj[ids[i]] = JSON.stringify(values.slice(startIdx, endIdx));
  }
  cache.putAll(obj, 21600);
  return values;
}

function getPGs() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const text = normalize(body.getText());
  const values = retrieveDb();
  const pgs = values.reduce((r, [w, pg]) => {
    if (w === null) return r;
    const wn = normalize(w);
    if (wn.includes("|")) {
      const wns = new Set(wn.split("|"));
      for (const e of wns) {
        r.has(e)
          ? r.get(e).add(pg)
          : r.set(e.replace(/^.*:/, ""), new Set([pg]));
      }
      return r;
    }
    r.has(wn) ? r.get(wn).add(pg) : r.set(wn, new Set([pg]));
    return r;
  }, new Map());
  const processor = new KeywordProcessor(true);
  processor.addKeywordsFromArray(Array.from(pgs.keys()));
  const keywordsFound = processor.extractKeywords(text);
  const keywords = [...new Set(keywordsFound)];
  const sb = escapeRegExp("<>\n\r\f.!?");
  function PGObject(keyword, pg, sentence) {
    this.keyword = keyword;
    this.pg = pg;
    this.sentence = sentence;
  }
  return keywords.flatMap((k) => {
    // need to figure out how to match whitespace after punctuation
    // and quotation marks after punctuation
    const match = text.match(
      new RegExp(
        `[^${sb}]*(?<=\\W|^)(${escapeRegExp(
          k,
        )})(?=\\W)[^${sb}]*(?:[${sb}]['"]?|$)`,
        "gm",
      ),
    );
    const pg =
      scriptOptions.concatenate === "true"
        ? Array.from(pgs.get(k)).join("|")
        : Array.from(pgs.get(k))[0];
    return match
      ? match.reduce((r, m) => {
          let placed = m.match(
            new RegExp(`${escapeRegExp(k)} \\("${escapeRegExp(pg)}"\\)`, "g"),
          );
          if (placed) return r;
          r.push(new PGObject(k, pg, m));
          return r;
        }, [])
      : [];
  });
}

function insertPGs(s, pg) {
  const ss = s.toString();
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const text = body.editAsText();
  const pgformed = `\u00a0(“${pg}”)`;
  const ntext = normalize(body.getText());
  const re = new RegExp(`${escapeRegExp(ss)}`);
  const match = ntext.match(re);
  const idx = match.index + ss.length;
  const endIdx = idx + pgformed.length - 1;
  text.insertText(idx, pgformed);
  function Style() {
    this[DocumentApp.Attribute.FONT_FAMILY] = scriptOptions.font;
    this[DocumentApp.Attribute.FOREGROUND_COLOR] = scriptOptions.color;
    this[DocumentApp.Attribute.BOLD] = false;
    this[DocumentApp.Attribute.ITALIC] = false;
    this[DocumentApp.Attribute.UNDERLINE] = false;
  }
  text.setAttributes(idx + 1, endIdx, new Style());
  moveCursor(pgformed, pgformed);
}

// normalization for string equivalence. must not alter length.
function normalize(s) {
  return (
    s
      .normalize("NFD")
      // https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
      //\p{Diacritics} includes \u00b7 interpunct.
      .replaceAll(/[\u0300-\u036f]/g, "")
      .replaceAll(/[\u201c-\u201f\u2033]/g, '"')
      .replaceAll(/[\u02bb\u2018-\u201b\u2032]/g, "'")
      //\p{Dash}\p{Hyphen} doesn't work.
      .replaceAll(/[\p{Pd}]/gu, "-")
      .replaceAll(/[\u01C3]/g, "!")
      .replaceAll(/[\u00d7\u2715\u2716]/g, "x")
      .replaceAll(/[\p{Zs}]/gu, " ")
  );
}
