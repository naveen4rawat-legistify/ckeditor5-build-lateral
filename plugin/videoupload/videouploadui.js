
/**
 * @module videoupload/videouploadui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import mediaIcon from './theme/icons/media.svg';

/**
 * The video upload UI plugin. It introduces the video upload button and the <kbd>Ctrl+Shift+K</kbd> keystroke.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUploadUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Setup `videoUpload` button.
		editor.ui.componentFactory.add( 'videoUpload', locale => {
			const view = new FileDialogButtonView( locale );
			const command = editor.commands.get( 'videoUpload' );

			view.set( {
				acceptedType: 'video/*',
				allowMultipleFiles: false
			} );

			view.buttonView.set( {
				label: t( 'Video upload' ),
				icon: mediaIcon,
				tooltip: true
			} );

			view.buttonView.bind( 'isEnabled' ).to( command );

			view.on( 'done', ( evt, files ) => {
				const file = files[0];
				editor.execute( 'videoUpload', { file: file } );
			} );

			view.buttonView.delegate('execute').to( this );

			return view;
		} );
	}
}
