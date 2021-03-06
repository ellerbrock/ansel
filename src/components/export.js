import {remote} from 'electron';
import fs from 'fs';
import Promise from 'bluebird';
import notifier from 'node-notifier';
import libraw from 'libraw';
import sharp from 'sharp';
import React from 'react';

import config from './../config';

const readFile = Promise.promisify(fs.readFile);

class Export extends React.Component {
  static propTypes = {
    closeExportDialog: React.PropTypes.func.isRequired,
    photo: React.PropTypes.object.isRequired,
    title: React.PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { folder: null, quality: 90, format: config.exportFormats[0] };

    this.keyboardListener = this.keyboardListener.bind(this);
    this.processImg = this.processImg.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keyboardListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyboardListener);
  }

  keyboardListener(e) {
    e.preventDefault();

    if (e.keyCode == 27) // escape
      this.props.closeExportDialog();
  }

  onFolderSelection(filenames) {
    console.log('filenames', filenames);
    let state = this.state;
    state.folder = filenames[0];
    this.setState(state);
  }

  openFolderDialog() {
    remote.dialog.showOpenDialog(
      { properties: [ 'openDirectory' ]},
      this.onFolderSelection.bind(this)
    );
  }

  processImg(img) {
    let photo = this.props.photo;

    return sharp(img)
      .rotate()
      .withMetadata()
      .quality(this.state.quality)
      .toFile(`${this.state.folder}/${photo.title}.${this.state.format}`)
      .then(this.afterExport.bind(this));
  }

  afterExport() {
    notifier.notify({
      'title': 'Ansel',
      'message': `Finish exporting ${this.props.photo.title}`
    });

    this.props.closeExportDialog();
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log('save', this.state, this.props.photo);

    let photo = this.props.photo;
    let extension = photo.extension.toLowerCase();

    if (!this.state.folder)
      return false;

    else if (photo.versions.length > 0)
      return this.processImg(photo.thumb);

    else if (config.acceptedRawFormats.indexOf(extension) != -1)
      return libraw.extract(photo.master, `${config.tmp}/${photo.title}`)
        .then((imgPath) => readFile(imgPath))
        .then(this.processImg);

    else
      return this.processImg(photo.thumb);
  }

  updateQuality() {
    let state = this.state;
    state.quality = this.refs.quality.value;
    this.setState(state);
  }

  updateFormat() {
    let state = this.state;
    state.format = this.refs.format.value;
    this.setState(state);
  }

  render() {
    let formats = config.exportFormats.map((exportFormat) => {
      return <option value={exportFormat}>{exportFormat}</option>;
    });

    return (
      <div className="outer-modal">
        <div className="modal shadow--2dp">
          <form onSubmit={this.handleSubmit.bind(this)}>
            <div>
              <label htmlFor="format">Format:</label>

              <select 
                id="format" 
                ref="format" 
                value={this.state.format}
                onChange={this.updateFormat.bind(this)}>{formats}</select>
            </div>

            <div>
              <label htmlFor="quality">Quality</label>

              <input
                type="range" 
                id="quality" 
                ref="quality"
                min="10" 
                max="100" 
                value={this.state.quality}
                onChange={this.updateQuality.bind(this)}
                step="1" />

              {this.state.quality}
            </div>

            <div>
              <label htmlFor="folder">Folder:</label>

              <button id="folder" onClick={this.openFolderDialog.bind(this)}>
                export to: {this.state.folder}
              </button>
            </div>

            <button>Save</button>
          </form>
        </div>
      </div>
    );
  }
}

export default Export;
