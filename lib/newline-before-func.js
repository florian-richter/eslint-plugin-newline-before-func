/**
 * @fileoverview Rule to require newlines before line containing `function` statement
 * @author Florian Richter
 */
"use strict";

module.exports = {
    meta: {
        docs: {
            description: "Require an empty line before line containing `function` statement",
            category: "Stylistic Issues",
            recommended: false
        },
        fixable: "whitespace",
        schema: []
    },

    create(context) {
        const sourceCode = context.getSourceCode();

        function isFirstInScope(node) {
            let prev = node;
            let current = node.parent;

            while (current && current.type !== "BlockStatement") {
                prev = current;
                current = current.parent || false;
            }

            return Array.isArray(current.body)
                ? current.body[0] === prev
                : current.body === prev;
        }

        function isFirstNode(node) {
            return isFirstInScope(node);
        }

        function isFirstFunctionInObject(node) {
            const objectExpression = node.parent.parent;
            if (objectExpression.type === "ObjectExpression") {
                let nodeIndex = objectExpression.properties.indexOf(node.parent);
                let firstFunctionIndex = objectExpression.properties.findIndex(prop => prop.value.type === "FunctionExpression");

                return nodeIndex === firstFunctionIndex;
            }

            return false;
        }

        function calcCommentLines(node, lineNumTokenBefore) {
            const comments = sourceCode.getComments(node).leading;
            let numLinesComments = 0;

            if (!comments.length) {
                return numLinesComments;
            }

            comments.forEach(comment => {
                numLinesComments++;

                if (comment.type === "Block") {
                    numLinesComments += comment.loc.end.line - comment.loc.start.line;
                }

                // avoid counting lines with inline comments twice
                if (comment.loc.start.line === lineNumTokenBefore) {
                    numLinesComments--;
                }

                if (comment.loc.end.line === node.loc.start.line) {
                    numLinesComments--;
                }
            });

            return numLinesComments;
        }

        function getLineNumberOfTokenBefore(node) {
            let tokenBefore = sourceCode.getTokenBefore(node);
            while (tokenBefore && tokenBefore.loc.end.line === node.loc.start.line) {
                tokenBefore = sourceCode.getTokenBefore(tokenBefore);
            }

            let lineNumTokenBefore;

            if (tokenBefore) {
                lineNumTokenBefore = tokenBefore.loc.end.line;
            } else {
                lineNumTokenBefore = 0; // global return at beginning of script
            }

            return lineNumTokenBefore;
        }

        function hasNewlineBefore(node) {
            const lineNumNode = node.loc.start.line;
            const lineNumTokenBefore = getLineNumberOfTokenBefore(node);
            const commentLines = calcCommentLines(node, lineNumTokenBefore);

            return lineNumNode - lineNumTokenBefore - commentLines > 1;
        }

        function hasId(node) {
            return node.id || node.parent.type === "Property";
        }

        function canFix(node) {
            const leadingComments = sourceCode.getComments(node).leading;

            if (leadingComments.length === 0) {
                return true;
            }

            return false;
        }

        function report(node) {
            if (!isFirstNode(node) &&
                !hasNewlineBefore(node) &&
                hasId(node) &&
                !isFirstFunctionInObject(node)) {
                context.report({
                    node,
                    message: "Expected newline before line containing 'function' statement.",
                    fix: function fix(fixer) {
                        if (canFix(node)) {
                            let range = node.range;
                            range.column = 0;

                            let tokenBefore = sourceCode.getTokenBefore(node);
                            while (tokenBefore && tokenBefore.loc.end.line === node.loc.start.line) {
                                tokenBefore = sourceCode.getTokenBefore(tokenBefore);
                            }

                            return fixer.insertTextAfter(tokenBefore, "\n");
                        }
                        return null;
                    }
                });
            }
        }

        return {
            FunctionDeclaration: report,
            FunctionExpression: report
        };
    }
};
