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

        function isPrecededByTokens(node, testTokens) {
            const tokenBefore = sourceCode.getTokenBefore(node);

            return testTokens.some(token => tokenBefore.value === token);
        }

        function isFirstNode(node) {
            const parentType = node.parent.type;

            if (node.parent.body) {
                return Array.isArray(node.parent.body)
                  ? node.parent.body[0] === node
                  : node.parent.body === node;
            }

            if (parentType === "IfStatement") {
                return isPrecededByTokens(node, ["else", ")"]);
            } else if (parentType === "DoWhileStatement") {
                return isPrecededByTokens(node, ["do"]);
            } else if (parentType === "SwitchCase") {
                return isPrecededByTokens(node, [":"]);
            } else if (parentType === "ObjectExpression") {
                return isPrecededByTokens(node.parent, [","]);
            }
            return isPrecededByTokens(node, [")"]);
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
            while (tokenBefore.loc.end.line === node.loc.start.line) {
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

        // function canFix(node) {
        //     const leadingComments = sourceCode.getComments(node).leading;
        //     const lastLeadingComment = leadingComments[leadingComments.length - 1];
        //     const tokenBefore = sourceCode.getTokenBefore(node);

        //     if (leadingComments.length === 0) {
        //         return true;
        //     }

        //     // if the last leading comment ends in the same line as the previous token and
        //     // does not share a line with the `return` node, we can consider it safe to fix.
        //     // Example:
        //     // function a() {
        //     //     var b; //comment
        //     //     return;
        //     // }
        //     if (lastLeadingComment.loc.end.line === tokenBefore.loc.end.line &&
        //         lastLeadingComment.loc.end.line !== node.loc.start.line) {
        //         return true;
        //     }

        //     return false;
        // }

        return {
            FunctionDeclaration(node) {
                if (!isFirstNode(node) && !hasNewlineBefore(node) && hasId(node)) {
                    context.report({
                        node,
                        message: "Expected newline before line containing 'function' statement."
                        // fix(fixer) {
                        //     if (canFix(node)) {
                        //         const tokenBefore = sourceCode.getTokenBefore(node);
                        //         const newlines = node.loc.start.line === tokenBefore.loc.end.line ? "\n\n" : "\n";

                        //         return fixer.insertTextBefore(node, newlines);
                        //     }
                        //     return null;
                        // }
                    });
                }
            },
            FunctionExpression(node) {
                if (!isFirstNode(node) && !hasNewlineBefore(node) && hasId(node)) {
                    context.report({
                        node,
                        message: "Expected newline before line containing 'function' statement."
                    });
                }
            }
        };
    }
};
