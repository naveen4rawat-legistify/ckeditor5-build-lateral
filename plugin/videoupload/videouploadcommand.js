/**
 * @module videoupload/videouploadcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import {parseYtubeEmbed, ensureSafeUrl} from './utils';

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
	execute( link ) {
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
	}
}
