import React from 'react';
import {Container} from 'react-bootstrap'

export default class Document extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lineCount: 0,
            colCount: 0,
            startPosition: {col: 0, row: 0},
            multiSelect: false,
            endPosition: {col: 0, row: 0},
        };
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.onInputChanged = this.onInputChanged.bind(this);
        this.onScrollChanged = this.onScrollChanged.bind(this);
    }

    onKeyUp(e) {
        if (e.keyCode >= 33 && e.keyCode <= 40)
            this.onSelectionChanged(e);
    }

    onSelectionChanged(e) {
        let obj = e.target;
        this.addValueToDiv(obj);
        let substr = obj.value.substring(0, obj.selectionStart).split('\n');
        let row = substr.length;
        let col = substr[substr.length - 1].length;
        if (obj.selectionStart !== obj.selectionEnd) {
            // Selecting more than one item
            let oldCol = col;
            let oldRow = row;
            substr = obj.value.substring(obj.selectionStart, obj.selectionEnd).split('\n');
            row += substr.length - 1;
            col = substr[substr.length - 1].length;
            this.setState({
                startPosition: {col: oldCol, row: oldRow},
                multiSelect: true,
                endPosition: {col: col, row: row}
            });
        } else
            this.setState({startPosition: {col: col, row: row}, multiSelect: false});
    }

    onInputChanged(e) {
        let obj = e.target;
        this.addValueToDiv(obj);
        let lineCounter = document.getElementById("lineCounter");
        if (obj.value === "")
            this.setState({lineCount: 1, rowCount: 0});
        else
            this.setState({lineCount: obj.value.split("\n").length, colCount: obj.value.split("\n").sort((a, b) => {return a.length > b.length ? a : b;})[0].length});
        if (this.state.lineCount === 0)
            this.setState({lineCount: 1});
        let oldLineCount = parseInt(lineCounter.value.split('\n')[lineCounter.value.split('\n').length - 1]);
        if (this.state.lineCount !== oldLineCount) {
            this.onScrollChanged(e);
        }
        this.onSelectionChanged(e);
    }

    onScrollChanged(e) {
        let obj = e.target;
        let lineCounter = document.getElementById("lineCounter");
        lineCounter.scrollTop = obj.scrollTop;
    }

    onBlur(e) {
        console.log(e.target.value)
       if (e.target.innerHTML.trim().length)
           e.target.innerHTML = ""
    }

    addValueToDiv(obj){
        obj.value = obj.innerHTML.replace(/<div>/gi,'<br>').replace(/<\/div>/gi,'').replace(/<br>/gi, "\n").replace(/<br\/>/gi, "\n");
    }

    render() {
        let lineCounter = "";
        for (let i = 1; i <= this.state.lineCount; i++)
            lineCounter += i + '\n'
        if (lineCounter === "")
            lineCounter = "1"
        return (
            <Container fluid style={{height: '100%', width: '100%', display: 'flex'}}>
                <textarea style={{
                    height: '100%',
                    overflowY: "hidden",
                    backgroundColor: "rgb(49,51,54)",
                    color: "white",
                    textAlign: "left",
                    verticalAlign: "top",
                }} cols={2} rows={this.state.lineCount > 55 ? this.state.lineCount : 55} value={lineCounter} readOnly id="lineCounter"/>
                <div contentEditable={true} style={{
                    overflowX: "hidden",
                    overflowY: "hidden",
                    backgroundColor: "#2b2b2c",
                    color: "#FFF",
                    zIndex: 0,
                    height: "100%",
                    width: "100%",
                    display: "inline",
                    whiteSpace: "pre-wrap"
                }} autoCorrect="off" autoCapitalize="off"
                          spellCheck="false" onClick={this.onSelectionChanged} onKeyUp={this.onKeyUp}
                          onInput={this.onInputChanged} onScroll={this.onScrollChanged} onBlur={this.onBlur}/>
            </Container>
        )
    }
}