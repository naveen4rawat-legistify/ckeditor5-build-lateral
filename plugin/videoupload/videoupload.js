/**
 * @module videoupload/videoupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoUploadEditing from './videouploadediting';
import VideoUploadUI from './videouploadui';

/**
 * The video upload plugin. It introduces the video upload buttons and the <kbd>Ctrl+Shift+K</kbd> keystroke.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUpload extends Plugin {

	static get requires() {
		return [ VideoUploadEditing, VideoUploadUI ];
	}


	static get pluginName() {
		return 'VideoUpload';
	}
}
