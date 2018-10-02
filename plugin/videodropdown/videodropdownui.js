import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import VideoUrl from './../videourl/videourl';
import VideoUpload from './../videoupload/videoupload';

import mediaIcon from './theme/icons/media.svg';

/**
 * The video dropdown UI plugin. It introduces the video dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoDropdownUI extends Plugin {

    /**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoUrl, VideoUpload ];
    }
    
     /**
	 * @inheritDoc
	 */
    init() {
        const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;

        // Register UI component
        componentFactory.add('videoDropdown', locale => {

            const dropdownView = createDropdown( locale );

            dropdownView.buttonView.set( {
                icon: mediaIcon
            });
            
            dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-video-dropdown'
					]
				}
			});            
        
            const buttons = [];
            buttons.push(componentFactory.create('videoUrl'));
            const videoUpload = componentFactory.create('videoUpload')
            buttons.push(videoUpload);

            addToolbarToDropdown(dropdownView, buttons);

            this.listenTo( videoUpload.buttonView, 'execute', evt => {
				dropdownView.isOpen = false;
			} );

            return dropdownView;
        });
    }
}