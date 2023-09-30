open DocumentApp
open Docs
open Schema

// let getPlainText = contents => {
//     let plainText = content => {
//         let textRuns = element => {
//             switch element.textRun {
//             | Some({content}) => Some(content)
//             | _ => None }
//         }
//         switch content.paragraph {
//         | Some({elements}) => Some(elements->Array.filterMap(textRuns))
//         | _ => None }
//     }
//     contents->Array.filterMap(plainText)->Array.flat->Array.joinWith("")
// }

let parseToCharCount = text => {
    let partition = e => {
        let isAnswer = s => s->String.startsWith("ANSWER:")
        switch e {
        | "" => None
        | e if !(e->String.includes("ANSWER:")) => None
        | _ =>
            let arr = e->String.trim->String.split("\n")
            let idx = arr->Array.findLastIndex(s => s->isAnswer)
            arr
            ->Array.slice(~start=0, ~end=idx+1)
            ->Belt.Array.partition(s => s->isAnswer)
            ->Some }
    }
    let count = e => {
        let questionRes = s => {
            s
            ->String.replaceRegExp(%re("/^[0-9]{1,2}\.\s?((Note to|Description acceptable).*?\.\s?)?/g"), "")
            ->String.replaceRegExp(%re("/\s?\(.+?\)/g"), "")
            ->String.replaceRegExp(%re("/\[[0-9]{1,2}.*?\]\s?/g"), "")
            ->String.replaceRegExp(%re("/\s{2,}/g"), " ")
            ->String.trim
        }
        let answerRes = s => {
            switch s->String.match(%re("/^ANSWER:\s*?(.*?)(\[|\(|$)/")) {
            | None => "unknown answer"
            | Some(result) => result->RegExp.Result.matches->Array.getUnsafe(0) }
            ->String.trim
        }
        let (ans, qs) = e
        let q = qs->Array.joinWith("")->questionRes->String.length->Int.toString
        let a = ans->Array.map(answerRes)->Array.joinWith(" / ")
        (q, a)
    }
    text->String.split("\n\n")->Array.filterMap(partition)->Array.map(count)
}

let getCharCount = () => {
    // let doc = getActiveDocument()->getDocumentId->getDocumentFromId
    // doc.body.content->getPlainText->parseToCharCount
    getActiveDocument()->getBody->getText->parseToCharCount
}

let makeUpdateRequest = contents => {
    let makeRequests = content => {
        let makeRequest = element => {
            let setStyle =
                switch element.textRun {
                | Some({content}) =>
                    switch content {
                    | "\n" => false
                    | _ => true }
                | _ => false }
            {
                updateParagraphStyle: {
                    fields: "keepWithNext,keepLinesTogether",
                    paragraphStyle: {
                        keepLinesTogether: setStyle,
                        keepWithNext: setStyle
                    },
                    range: {
                        endIndex: content.endIndex,
                        startIndex: Option.getUnsafe(content.startIndex)
                    }
                }
            }
        }
        switch content.paragraph {
        | Some({elements}) => Some(elements->Array.getUnsafe(0)->makeRequest)
        | _ => None }
    }
    contents->Array.filterMap(makeRequests)
}

let setKeepTogether = () => {
    let docId = getActiveDocument()->getDocumentId
    let doc = docId->getDocumentFromId

    batchUpdate({
        requests: doc.body.content->makeUpdateRequest
    }, docId)
}