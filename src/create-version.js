import {spawn} from 'child_process';

import Version from './models/version';

const createVersionSuccessOpenWith = (data) => {
  let version = data.version.toJSON();
  console.log('before open', data.targetSoftware, [ version.master ]);

  if (data.targetSoftware && version.master)
    spawn(data.targetSoftware, [ version.master ]);
};

export default function createVersionAndOpenWith(photo, type, targetSoftware) {
  new Version({
    type: type,
    version: '1',
    photo_id: photo.id
  }).save().then((version) => {
    createVersionSuccessOpenWith({ version, targetSoftware });

  }).catch(function(err) {
    console.log('err', err);
  });
}
