import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "ErrorCodeConverter.convertBackendErrorCode",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        const lines = selectedText.split(",");
        const frontendErrorObj = lines
          .map((line) => {
            const match = line.match(/^\s*([^:]+):/);
            return match ? match[1].trim() : "";
          })
          .filter((str) => str !== "")
          .reduce((acc, key) => {
            const oldStr = key;
            const arrStr = oldStr.split("_");
            let newStr;
            if (oldStr.endsWith("NOT_ACTIVE")) {
              newStr = arrStr
                .slice(0, arrStr.length - 2)
                .reduce((wholeStr, currStr, index) => {
                  if (index === 0) {
                    return (
                      currStr[0].toUpperCase() + currStr.slice(1).toLowerCase()
                    );
                  }
                  return wholeStr + " " + currStr.toLowerCase();
                }, "");
              newStr = newStr + " is inactive";
            } else if (arrStr[0] === "INVALID") {
              newStr = arrStr.slice(1).reduce((wholeStr, currStr, index) => {
                if (index === 0) {
                  return (
                    currStr[0].toUpperCase() + currStr.slice(1).toLowerCase()
                  );
                }
                return wholeStr + " " + currStr.toLowerCase();
              }, "");
              newStr = newStr + " is invalid";
            } else {
              newStr = arrStr.reduce((wholeStr, currStr, index) => {
                if (index === 0) {
                  return (
                    currStr[0].toUpperCase() + currStr.slice(1).toLowerCase()
                  );
                }
                return wholeStr + " " + currStr.toLowerCase();
              }, "");
            }
            if (key.endsWith("ALREADY_EXISTS")) {
              newStr = newStr + " in the system";
            }
            return { ...acc, [key]: newStr + "." };
          }, {}); // Filter out empty strings

        // const capitalizedText = text.toUpperCase();
        editor.edit((editBuilder) => {
          editBuilder.replace(
            selection,
            Object.entries(frontendErrorObj)
              .map(([key, value]) => `"${key}": "${value}"`)
              .join(",\n")
          );
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
