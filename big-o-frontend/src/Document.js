import React from 'react';
import ReactDOMServer from 'react-dom/server'
import Container from 'react-bootstrap/Container'
import TextFormatter from "./TextFormatter";
import Button from "react-bootstrap/Button";
import ContentEditable from 'react-contenteditable'
import EditCaretPositioning from "./EditCaretPositioning";

export default class Document extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            cursorPosition: 0,
            lineCount: 0,
            colCount: 0,
        };
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onInputChanged = this.onInputChanged.bind(this);
        this.addColorToDiv = this.addColorToDiv.bind(this);
        this.pasteAsPlainText = this.pasteAsPlainText.bind(this);
        this.textFormatter = new TextFormatter();
    }

    pasteAsPlainText(e){
        // TODO: Fix paste limit
        e.preventDefault();
        let text = e.clipboardData.getData('text/plain');
        console.log(text)
        document.execCommand("insertHTML", false, text);
    }

    onKeyUp(e) {
        // TODO: Fix caret positioning mini reset
        let obj = document.getElementById("editable");
        let saved = EditCaretPositioning.saveSelection(obj);
        if(e.keyCode === 9) {
            obj.innerText = obj.innerText.slice(0, saved.start) + "\t" + obj.innerText.slice(saved.start);
            e.preventDefault()
        } else if (e.keyCode === 13) {
            let obj = document.getElementById("editable");
            obj.innerText = obj.innerText.slice(0, saved.start) + (obj.innerText.charAt(saved.start - 1).match(/[^\s]/gi) ? "\n\n" : "\n") + obj.innerText.slice(saved.start);
            e.preventDefault();
        }
        EditCaretPositioning.restoreSelection(obj, saved)
    }

    onInputChanged(e) {
        // TODO: Add delay to coloration
        this.setState({cursorPosition: EditCaretPositioning.saveSelection(document.getElementById("editable"))});
        let obj = document.getElementById("editable");
        if (obj.innerHTML === "")
            this.setState({lineCount: 1, colCount: 0});
        else
            this.setState({lineCount: obj.innerHTML.split("<br>").length - 1, colCount: obj.innerHTML.split("<br>").sort((a, b) => {return a.length > b.length ? a : b;})[0].length});
        if (this.state.lineCount === 0)
            this.setState({lineCount: 1});
        this.addColorToDiv(e);
    }

    addColorToDiv(e) {
        let formattedHTML = "";
        e.target.value = this.stripHTML(e.target.value).replace(/amp;/gi, "").replace(/gt;/gi, "");
        for (let line of e.target.value.split("\n"))
            formattedHTML += ReactDOMServer.renderToStaticMarkup(
                this.textFormatter.applyFormattingRules(line).map((fragment, index) =>
                    <span key={index} className={`text-fragment text-fragment-${fragment.type}`}
                          style={{maxWidth: `${fragment.width}ch`, minWidth: `${fragment.width}ch`}}>
                    {fragment.text}
                </span>)
            ) + "<br>";
        formattedHTML = formattedHTML.substring(0, formattedHTML.length-1)
        formattedHTML = formattedHTML.replace("\n", "<br>");
        this.setState({content: formattedHTML});
    }

    stripHTML(html){
        let string = html.replace(/<br>/gi, "\n");
        return string.replace(/<[^>]+>/g, '');
    }

    render() {
        let lineCounter = "";
        for (let i = 1; i <= this.state.lineCount; i++)
            lineCounter += i + '\n';
        if (lineCounter === "")
            lineCounter = "1";
        let content = this.state.content;
        return (
            <Container fluid style={{height: '100%', width: '100%', display: 'flex', whiteSpace: "pre"}}>
                <textarea style={{
                    height: '100%',
                    overflowY: "hidden",
                    backgroundColor: "rgb(49,51,54)",
                    color: "white",
                    textAlign: "left",
                    verticalAlign: "top",
                    font: "400 16px Bookman Old Style",
                }} cols={2} rows={this.state.lineCount > 55 ? this.state.lineCount : 55} value={lineCounter} readOnly id="lineCounter"/>
                <ContentEditable autoCorrect="false" spellCheck="false" autoCapitalize="false" id={"editable"} style={{
                    overflowX: "hidden",
                    overflowY: "hidden",
                    backgroundColor: "#2b2b2c",
                    color: "#FFF",
                    height: "100%",
                    width: "100%",
                    display: "inline-block",
                    font: "400 16px Bookman Old Style",
                    padding: 2,
                }} onKeyDown={this.onKeyUp} onChange={this.onInputChanged} html={content || ""} onPaste={this.pasteAsPlainText}/>
                <Button onClick={() => {
                    console.log("document.getElementById(editable).innerText");
                    console.log(document.getElementById("editable").innerText);
                    console.log("document.getElementById(editable).innerHTML");
                    console.log(document.getElementById("editable").innerHTML);
                }} /><Button onClick={() => {
                    console.log(EditCaretPositioning.saveSelection(document.getElementById("editable")).start);
                }} />
            </Container>
        )
    }
}