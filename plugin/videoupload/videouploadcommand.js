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
		const file = options.file;
		const fileRepository = editor.plugins.get( FileRepository );

		editor.model.change( writer => {
			const loader = fileRepository.createLoader( file );

			// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
			if ( !loader ) {
				return;
			}

			let _ckeditorTopDivWidth = null;
			let _ckeditorTopDiv = document.getElementsByClassName('ck-editor__top');

			if(_ckeditorTopDiv && _ckeditorTopDiv[0] && _ckeditorTopDiv[0].clientWidth){
				var clientWidth = parseInt(_ckeditorTopDiv[0].clientWidth);
				_ckeditorTopDivWidth = clientWidth > 100 ? clientWidth - 30 : clientWidth;
			}
			var _width = _ckeditorTopDivWidth ? _ckeditorTopDivWidth : 640;
			var _height = parseInt(_width) * 0.5620;

			const videoElement = writer.createElement( 'videoUpload', {
				uploadId: loader.id, 
				width: _width, 
				height: _height, 
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
