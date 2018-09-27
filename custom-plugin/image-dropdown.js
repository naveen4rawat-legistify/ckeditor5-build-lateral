import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class ImageDropdown extends Plugin {
    
    static get pluginName() {
        return 'ImageDropdown';
	}

    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add('imageDropdown', locale => {

            const dropdownView = createDropdown( locale );

            dropdownView.set({
                label: 'Image',
                tooltip: true
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