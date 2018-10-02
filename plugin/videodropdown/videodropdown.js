import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import VideoDropdownUI from './videodropdownui';

/**
 * The video UI feature. It introduces the `Video` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoDropdown extends Plugin {
    
    static get pluginName() {
        return 'VideoDropdown';
    }

    /**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoDropdownUI ];
	}
    
}