import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import { createDropdown, addListToDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import Embed from 'ckeditor5-embed/src/embed';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

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
	static get requires() {
		return [ Embed ];
	}
    
    /**
	 * @inheritDoc
	 */
    init() {
        const editor = this.editor;
		const componentFactory = editor.ui.componentFactory;

        // Register UI component
        componentFactory.add('imageDropdown', locale => {

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

            items.add( {
                type: 'button',
                model: new Model( {
                    label: 'Upload video',
                    icon: imageIcon
                })
            });


            
        this.fileInputView = new FileDialogButtonView( locale );
        
        this.fileInputView.set( {
            acceptedType: 'video/*',
            allowMultipleFiles: false
        } );

        this.fileInputView.buttonView.set( {
            label:  'Upload video' ,
            icon: imageIcon
        } );

        const buttons = [];
        buttons.push(this.fileInputView);
        buttons.push(componentFactory.create('embed'));

        this.fileInputView.delegate( 'done' ).to( dropdownView );

        //this.fileInputView.on( 'execute', evt => { dropdownView.isOpen = false; });



        addToolbarToDropdown(dropdownView, buttons);
            

        dropdownView.on( 'done', ( evt, files ) => {
			const file = files[0];
			//editor.execute( 'videoUpload', { link: 'https://www.youtube.com/watch?v=G1q2YQSH7rU' } );
            //editor.execute( 'videoUpload', { file: file } );
            console.log('Files', file);
            dropdownView.isOpen = false;
		} );

            // Create a dropdown with a list inside the panel.
            //addListToDropdown( dropdownView, items );

            return dropdownView;
        });
    }

}