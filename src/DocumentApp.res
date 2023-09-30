type t
type body

@send external getDocumentId: t => string = "getId"
@send external getBody: t => body = "getBody"
@send external getText: body => string = "getText"

@scope("DocumentApp") external create: string => t = "create"
@scope("DocumentApp") external getActiveDocument: unit => t = "getActiveDocument"
@scope("DocumentApp") external openById: string => t = "openById"
@scope("DocumentApp") external openByUrl: string => t = "openByUrl"