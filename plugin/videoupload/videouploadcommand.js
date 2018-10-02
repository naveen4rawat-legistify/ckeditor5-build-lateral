/**
 * @module videoupload/videouploadcommand
 */

import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * The embed command.
 *
 * @extends module:core/command~Command
 */
export default class VideoUploadCommand extends Command {
	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {File} options.file The video file to upload.
	 * @param {module:engine/model/position~Position} [options.insertAt] The position at which the video should be inserted.
	 * If the position is not specified, the video will be inserted into the current selection.
	 * Note: You can use the {@link module:upload/utils~findOptimalInsertionPosition} function to calculate
	 * (e.g. based on the current selection) a position which is more optimal from the UX perspective.
	 */
	execute( options ) {

		const editor = this.editor;
		const doc = editor.model.document;

		if (options.link) {
			const link = options.link;

			editor.model.change( writer => {

				const videoElement = writer.createElement( 'videoUpload', {
					src: link, 
					controls : '', 
					controlsList : 'nodownload' 
				} );

				let insertAtSelection;

				if ( options.insertAt ) {
					insertAtSelection = new ModelSelection( [ new ModelRange( options.insertAt ) ] );
				} else {
					insertAtSelection = doc.selection;
				}

				editor.model.insertContent( videoElement, insertAtSelection );

				// Inserting an video might've failed due to schema regulations.
				if ( videoElement.parent ) {
					writer.setSelection( videoElement, 'on' );
				}

			} );

		} else {

			const file = options.file;
			const fileRepository = editor.plugins.get( FileRepository );

			editor.model.change( writer => {
				const loader = fileRepository.createLoader( file );

				// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
				if ( !loader ) {
					return;
				}

				const videoElement = writer.createElement( 'videoUpload', {
					uploadId: loader.id, 
					width: 0, 
					height: 0, 
					controls : '', 
					controlsList : 'nodownload' 
				} );

				let insertAtSelection;

				if ( options.insertAt ) {
					insertAtSelection = new ModelSelection( [ new ModelRange( options.insertAt ) ] );
				} else {
					insertAtSelection = doc.selection;
				}

				editor.model.insertContent( videoElement, insertAtSelection );

				// Inserting an video might've failed due to schema regulations.
				if ( videoElement.parent ) {
					writer.setSelection( videoElement, 'on' );
				}
			} );
		}
		
	}
}
