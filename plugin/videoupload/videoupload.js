/**
 * @module videoupload/videoupload
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoUploadEditing from './videouploadediting';
import VideoUploadUI from './videouploadui';
import VideoUploadProgress from './videouploadprogress';

import './theme/videoupload.css';

/**
 * The video upload plugin. 
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUpload extends Plugin {

	static get requires() {
		return [ VideoUploadEditing, VideoUploadUI, VideoUploadProgress ];
	}

	static get pluginName() {
		return 'VideoUpload';
	}
}
