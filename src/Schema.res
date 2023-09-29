type weightedFontFamily = {
    fontFamily: string,
    weight: float
}
type rgbColor = {
    blue?: float,
    green?: float,
    red?: float
}
type color = {
    rgbColor: rgbColor
}
type optionalColor = {
    color: color
}
type link = {
    bookmarkId?: string,
    headingId?: string,
    url?: string
}
type dimension = {
    magnitude: float,
    unit: string
}
type textStyle = {
    backgroundColor?: optionalColor,
    baselineOffset?: string,
    bold?: bool,
    fontSize?: dimension,
    foregroundColor?: optionalColor,
    italic?: bool,
    link?: link,
    smallCaps?: bool,
    strikethrough?: bool,
    underline?: bool,
    weightedFontFamily?: weightedFontFamily
}
type size = {
    height: dimension,
    width: dimension
}
type tabStop = {
    alignment?: string,
    offset: dimension
}
type paragraphStyle = {
    alignment?: string,
    avoidWidowAndOrphan?: bool,
    headingId?: string,
    indentEnd?: dimension,
    indentFirstLine?: dimension,
    indentStart?: dimension,
    keepLinesTogether?: bool,
    keepWithNext?: bool,
    lineSpacing?: float,
    spaceAbove?: dimension,
    spaceBelow?: dimension,
    spacingMode?: string,
    tabStops?: array<tabStop>
}
type documentStyle = {
    marginBottom: dimension,
    marginLeft: dimension,
    marginRight: dimension,
    marginTop: dimension,
    pageSize: size
}
type range = {
    endIndex: float,
    segmentId?: string,
    startIndex?: float
}
type textRun = {
    content: string,
    textStyle: textStyle
}
type pageBreak = {
    textStyle: textStyle
}
type horizontalRule = {
    textStyle: textStyle
}
type paragraphElement = {
    endIndex: float,
    horizontalRule?: horizontalRule,
    pageBreak?: pageBreak,
    startIndex: float, //safe in body but not footers or headers
    textRun?: textRun
}
type paragraph = {
    elements: array<paragraphElement>,
    paragraphStyle: paragraphStyle
}
type structuralElement = {
    endIndex: float,
    paragraph?: paragraph,
    startIndex?: float
}
type body = {
    content: array<structuralElement>
}
type document = {
    body: body,
    documentId: string,
    documentStyle: documentStyle,
    revisionId: string,
    title: string
}