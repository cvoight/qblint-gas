open Schema

type writeControl = {
    requiredRevisionId?: string,
    targetRevisionId?: string
}
type batchUpdateDocumentResponse = {
    documentId?: string,
    writeControl?: writeControl
}
type updateTextStyleRequest = {
    fields?: string,
    range?: range,
    textStyle?: textStyle
}
type updateParagraphStyleRequest = {
    fields?: string,
    paragraphStyle?: paragraphStyle,
    range?: range
}
type request = {
    updateParagraphStyle?: updateParagraphStyleRequest,
    updateTextStyle?: updateTextStyleRequest
}
type batchUpdateDocumentRequest = {
    requests?: array<request>,
    writeControl?: writeControl
}

@val @scope(("Docs", "Documents"))
external getDocumentFromId: string => document = "get"
@val @scope(("Docs", "Documents"))
external batchUpdate: (batchUpdateDocumentRequest, string) => batchUpdateDocumentResponse = "batchUpdate"
@val @scope(("Docs", "Documents"))
external create: string => document = "create"