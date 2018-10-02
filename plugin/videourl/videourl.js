/**
 * @module videourl/videourl
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoUrlEditing from './videourlediting';
import VideoUrlUI from './videourlui';

import './theme/videourl.css';

/**
 * The video url plugin. It introduces the video url button and the <kbd>Ctrl+Shift+K</kbd> keystroke.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUrl extends Plugin {

	static get requires() {
		return [ VideoUrlEditing, VideoUrlUI ];
	}

	static get pluginName() {
		return 'VideoUrl';
	}
}
