/**
 * @module videoupload/videouploadcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import {parseYtubeEmbed, ensureSafeUrl} from './utils';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

/**
 * The embed command.
 *
 * @extends module:core/command~Command
 */
export default class VideoUploadCommand extends Command {

	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {String} link to embed
	 */
	/*execute( link ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		let embedAttributes = parseYtubeEmbed(link);
		embedAttributes.src = ensureSafeUrl( embedAttributes.src );

		model.change( writer => {

			let	position = selection.getLastPosition();

			if ( link !== '' && position) {
				const videoUpload = writer.createElement( 'videoUpload', embedAttributes );
				writer.insert( videoUpload, position );
			}

		} );
	}*/

	execute( options ) {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		let	position = selection.getLastPosition();

		if (options.link) {
			const link = options.link;
			let embedAttributes = parseYtubeEmbed(link);
			embedAttributes.src = ensureSafeUrl( embedAttributes.src );

			model.change( writer => {

				if ( link !== '' && position) {
					const videoUpload = writer.createElement( 'videoUpload', embedAttributes );
					writer.insert( videoUpload, position );
				}

			} );
		} else {
			const file = options.file;
			const fileRepository = editor.plugins.get( FileRepository );

			model.change( writer => {
				const loader = fileRepository.createLoader( file );
	
				// Do not throw when upload adapter is not set. FileRepository will log an error anyway.
				if ( !loader ) {
					return;
				}				
				
				const videoUpload = writer.createElement( 'videoUpload', 
				{ 
					uploadId : loader.id, 
					width : 0, 
					height : 0, 
					frameborder : 0, 
					allow : "autoplay; encrypted-media",
					allowfullscreen : true
				} );
				writer.insert( videoUpload, position ); 

				/*if ( videoUpload.parent ) {
					writer.setSelection( videoUpload, 'on' );
				}*/
	
			} );
		}
	}
}
