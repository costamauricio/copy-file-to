'use babel';

var path = require("path");
var fs = require("fs");

import packageConfig from "./config.json";
import { CompositeDisposable, TextEditor } from 'atom';

export default {
  config : packageConfig,
  subscriptions: null,

  activate(state) {

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'copy-file-to:copy-file': () => this.copyFile()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  copyFile() {

    let textEditor = atom.workspace.getActiveTextEditor(),
        fromPath = path.normalize( atom.config.get("copy-file-to.from") ),
        toPath = atom.config.get("copy-file-to.to").map(function(item) {
          return path.normalize(item)
        });

    if ( !(textEditor instanceof TextEditor) ) {
      atom.notifications.addError("Invalid file.");
      return false;
    }

    textEditor.save();

    if (!toPath.length || fromPath == '') {
      atom.notifications.addError("Invalid path configuration.");
      return false;
    }

    let re = new RegExp("^" + fromPath);

    if (!textEditor.getPath().match(re)) {
      atom.notifications.addError("File path not match with configured path.");
      return false;
    }

    for (let dir of toPath) {

      let finalPath = textEditor.getPath().replace(fromPath, dir)

      try {
        let stat = fs.statSync(path.dirname(finalPath));
      } catch (err)  {

        atom.notifications.addError("Path " + path.dirname(finalPath) + " don't exists.");
        continue;
      }

      try {

        let rs = fs.createReadStream(textEditor.getPath()),
            ws = fs.createWriteStream(finalPath);

        ws.on("close", () => atom.notifications.addSuccess("File successfully copied to " + dir))
        rs.pipe(ws)

      } catch (error) {
        atom.notifications.addFatalError("Error on copying file to " + finalPath);
      }
    }
  }
};
