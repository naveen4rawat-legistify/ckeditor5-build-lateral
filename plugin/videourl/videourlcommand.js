/**
 * @module videourl/videourlcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import {parseYtubeEmbed, ensureSafeUrl} from './utils';

/**
 * The video url command.
 *
 * @extends module:core/command~Command
 */
export default class VideoUrlCommand extends Command {

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
				const videoUrl = writer.createElement( 'videoUrl', embedAttributes );
				writer.insert( videoUrl, position );
			}

		} );
	}
}
