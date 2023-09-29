function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem("QBLint Results", "showSidebarLint")
    .addItem("Place PGs", "showSidebarPgs")
    .addItem("Character Count", "showSidebarCharCount")
    .addItem("Keep Questions Together", "setKeepTogether")
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

const include = (fn) => HtmlService.createHtmlOutputFromFile(fn).getContent();
const showSidebarLint = () => render("sidebar-lint", "QBLint Results");
const showSidebarPgs = () => render("sidebar-pgs", "Place PGs");
const showSidebarCharCount = () => render("sidebar-charcount", "Character Counts");
const render = (fn, title) => {
  const html = HtmlService.createTemplateFromFile(fn)
    .evaluate()
    .setTitle(title);
  DocumentApp.getUi().showSidebar(html);
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findSingleQuotes = (s) => s.replace(/'/g, "['‘’]");
const findDoubleQuotes = (s) => s.replace(/"/g, '["“”]');
const findString = (s) => findDoubleQuotes(findSingleQuotes(escapeRegExp(s)));

function moveCursor(string, sentence) {
  const doc = DocumentApp.getActiveDocument();
  const found = doc.getBody().findText(findString(sentence));
  const start = found.getStartOffset();
  const offset = sentence.indexOf(string);
  const range = doc
    .newRange()
    .addElement(
      found.getElement(),
      start + offset,
      start + offset + string.length - 1,
    );
  doc.setSelection(range);
}

function getLint() {
  const doc = DocumentApp.getActiveDocument();
  const docId = doc.getId();
  const jsonFiles = DriveApp.getFilesByName(docId + ".json");
  let json = "";
  while (jsonFiles.hasNext()) {
    json += jsonFiles.next().getBlob().getDataAsString();
  }

  const data = JSON.parse(json);
  return Object.entries(data.matches).map(([k, v]) => {
    const text = data.matches[k].context.text;
    const i = parseInt(data.matches[k].context.offset);
    const j = parseInt(data.matches[k].context.length);
    const formattedText = `${text.substring(0, i)}<mark>${text.substring(
      i,
      i + j,
    )}</mark>${text.substring(i + j)}`;
    const s = data.matches[k].sentence;
    const sentence = s.includes("\n") ? s.split("\n")[1] : s;
    return {
      context: formattedText,
      message: data.matches[k].message,
      sentence: sentence,
    };
  });
}