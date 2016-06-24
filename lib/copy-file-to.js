'use babel';

import CopyFileToView from './copy-file-to-view';
import { CompositeDisposable } from 'atom';

export default {

  copyFileToView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.copyFileToView = new CopyFileToView(state.copyFileToViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.copyFileToView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'copy-file-to:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.copyFileToView.destroy();
  },

  serialize() {
    return {
      copyFileToViewState: this.copyFileToView.serialize()
    };
  },

  toggle() {
    console.log('CopyFileTo was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
