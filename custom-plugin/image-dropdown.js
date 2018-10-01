import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

/**
 * The Image UI feature. It introduces the `Add image` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageDropdown extends Plugin {
    
    static get pluginName() {
        return 'ImageDropdown';
    }
    
    /**
	 * @inheritDoc
	 */
    init() {
        const editor = this.editor;

        // Register UI component
        editor.ui.componentFactory.add('imageDropdown', locale => {

            const dropdownView = createDropdown( locale );

            dropdownView.buttonView.set( {
                icon: imageIcon
            });
            
            dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-image-dropdown'
					]
				}
			});

            // The collection of the list items.
            const items = new Collection();

            items.add( {
                type: 'button',
                model: new Model( {
                    label: 'Uppload image',
                    icon: imageIcon
                })
            });

            items.add( {
                type: 'button',
                model: new Model( {
                    label: 'Image URL',
                    icon: imageIcon
                })
            });

            // Create a dropdown with a list inside the panel.
            addListToDropdown( dropdownView, items );

            return dropdownView;
        });
    }
}