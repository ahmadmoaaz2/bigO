const EditCaretPositioning = {}

export default EditCaretPositioning;


if (window.getSelection && document.createRange) {
    //saves caret position(s)
    EditCaretPositioning.saveSelection = function(el) {
        let start, end;
        const range = document.getSelection().getRangeAt(0),
            preSelectionRange = range.cloneRange(),
            postSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(el);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        postSelectionRange.selectNodeContents(el);
        postSelectionRange.setEnd(range.endContainer, range.endOffset);
        start = preSelectionRange.toString().length;
        end = start + range.toString().length;
        if (start > 0) {
            let node, i = el.children.length;
            while (i--) {
                node = el.children[i];
                if (node.nodeType === 1 && node.nodeName === 'BR') {
                    start += preSelectionRange.intersectsNode(el.children[i]) ? 1 : 0;
                    end += postSelectionRange.intersectsNode(el.children[i]) ? 1 : 0;
                }
            }
        }
        return {start, end};
    };
    //restores caret position(s)
    EditCaretPositioning.restoreSelection = function(el, {start, end}) {
        let node, i, nextCharIndex, sel,
            charIndex = 0,
            nodeStack = [el],
            foundStart = false,
            stop = false,
            range = document.createRange();
        range.setStart(el, 0);
        range.collapse(true);
        while (!stop && (node = nodeStack.pop())) {
            // BR's aren't counted, so we need to increase the index when one
            // is encountered
            if (node.nodeType === 1 && node.nodeName === 'BR') {
                charIndex++;
            } else if (node.nodeType === 3) {
                nextCharIndex = charIndex + node.length;
                if (!foundStart && start >= charIndex && start <= nextCharIndex) {
                    range.setStart(node, start - charIndex);
                    foundStart = true;
                }
                if (foundStart && end >= charIndex && end <= nextCharIndex) {
                    range.setEnd(node, end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }
        sel = document.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }



} else if (document.selection && document.body.createTextRange) {
    //saves caret position(s)
    EditCaretPositioning.saveSelection = function(containerEl) {
        let selectedTextRange = document.selection.createRange();
        let preSelectionTextRange = document.body.createTextRange();
        preSelectionTextRange.moveToElementText(containerEl);
        preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
        let start = preSelectionTextRange.text.length;

        return {
            start: start,
            end: start + selectedTextRange.text.length
        }
    };
    //restores caret position(s)
    EditCaretPositioning.restoreSelection = function(containerEl, savedSel) {
        let textRange = document.body.createTextRange();
        textRange.moveToElementText(containerEl);
        textRange.collapse(true);
        textRange.moveEnd("character", savedSel.end);
        textRange.moveStart("character", savedSel.start);
        textRange.select();
    };

}