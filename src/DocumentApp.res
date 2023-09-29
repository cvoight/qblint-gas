type t

@send external getDocumentId: t => string = "getId"

@scope("DocumentApp") external create: string => t = "create"
@scope("DocumentApp") external getActiveDocument: unit => t = "getActiveDocument"
@scope("DocumentApp") external openById: string => t = "openById"
@scope("DocumentApp") external openByUrl: string => t = "openByUrl"