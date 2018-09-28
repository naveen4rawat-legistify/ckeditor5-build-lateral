/**
 * @module videoupload/videoediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import VideoUploadCommand from './videouploadcommand';
import {parseYtubeEmbed, ensureSafeUrl} from './utils';
import { downcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';

/**
 * The embed engine feature.
 * @extends module:core/plugin~Plugin
 */
export default class VideoUploadEditing extends Plugin {

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository, Notification ];
	}

	init() {
		const editor = this.editor;
		const doc = editor.model.document;
		const fileRepository = editor.plugins.get( FileRepository );

		editor.model.schema.register( 'videoUpload', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowIn: '$block',
			allowAttributes: [ 'width', 'height', 'src', 'frameborder', 'allow', 'allowfullscreen', 'uploadId', 'uploadStatus' ]
		} );

		editor.conversion.elementToElement( {
			model: 'videoUpload',
			view: ( modelElement, viewWriter ) => {
				return viewWriter ? viewWriter.createEmptyElement( 'iframe', modelElement.getAttributes()):'';
			}
		} ) ;

		editor.conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'width' ) )
			.add( modelToViewAttributeConverter( 'height' ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: 'iframe',
			    model: ( viewElement, modelWriter ) => {
			        return modelWriter.createElement( 'videoUpload', {
			        	src: viewElement.getAttribute( 'src' ) ? viewElement.getAttribute( 'src' ) : '',
			        	width: viewElement.getAttribute( 'width' ) ? viewElement.getAttribute( 'width' ) : 640,
			        	height: viewElement.getAttribute( 'height' ) ? viewElement.getAttribute( 'height' ) : 480,
			        	frameborder: viewElement.getAttribute( 'frameborder' ) ? viewElement.getAttribute( 'frameborder' ) : 0,
			        	allowfullscreen: viewElement.getAttribute( 'allowfullscreen' ) ? viewElement.getAttribute( 'allowfullscreen' ) : true,
			        	allow: viewElement.getAttribute( 'allow' ) ? viewElement.getAttribute( 'allow' ) : 'autoplay; encrypted-media'
			        } );
			    }
			} ) );

		// Create video upload commands.
		editor.commands.add( 'videoUpload', new VideoUploadCommand( editor ) );

		doc.on( 'change', () => {
			const changes = doc.differ.getChanges( { includeChangesInGraveyard: true } );

			for ( const entry of changes ) {
				if ( entry.type == 'insert' && entry.name == 'videoUpload' ) {
					const item = entry.position.nodeAfter;
					const isInGraveyard = entry.position.root.rootName == '$graveyard';

					// Check if the video element still has upload id.
					const uploadId = item.getAttribute( 'uploadId' );
					if ( !uploadId ) {
						continue;
					}

					// Check if the video is loaded on this client.
					const loader = fileRepository.loaders.get( uploadId );

					if ( !loader ) {
						continue;
					}

					if ( isInGraveyard ) {
						// If the video was inserted to the graveyard - abort the loading process.
						loader.abort();
					} else if ( loader.status == 'idle' ) {
						// If the video was inserted into content and has not been loaded, start loading it.
						this._load( loader, item );
					}
				}
			}
		} );
	}

	/**
	 * Performs video loading. The video is read from the disk and temporary data is displayed. When the upload process
	 * is complete the temporary data is replaced with the target video from the server.
	 *
	 * @private
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:engine/model/element~Element} videoElement
	 * @returns {Promise}
	 */
	_load( loader, videoElement ) {
		const editor = this.editor;
		const model = editor.model;
		const t = editor.locale.t;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		model.enqueueChange( 'transparent', writer => {
			writer.setAttribute( 'uploadStatus', 'reading', videoElement );
		} );

		return loader.read()
			.then( data => {
				const viewFigure = editor.editing.mapper.toViewElement( videoElement );
				const promise = loader.upload();

				/*editor.editing.view.change( writer => {
					writer.setAttribute( 'src', data, videoElement );
				} );*/

				model.enqueueChange( 'transparent', writer => {
					writer.setAttribute( 'uploadStatus', 'uploading', videoElement );
				} );

				return promise;
			} )
			.then( data => {
				model.enqueueChange( 'transparent', writer => {
					writer.setAttributes( { uploadStatus: 'complete'/*, src: data */ }, videoElement );

					const link = 'https://www.youtube.com/watch?v=G1q2YQSH7rU';
					let attributes = parseYtubeEmbed(link);
					attributes.src = ensureSafeUrl( attributes.src );
					writer.setAttributes ( attributes , videoElement );

				} );

				clean();
			} )
			.catch( error => {
				// If status is not 'error' nor 'aborted' - throw error because it means that something else went wrong,
				// it might be generic error and it would be real pain to find what is going on.
				if ( loader.status !== 'error' && loader.status !== 'aborted' ) {
					throw error;
				}

				// Might be 'aborted'.
				if ( loader.status == 'error' ) {
					notification.showWarning( error, {
						title: t( 'Upload failed' ),
						namespace: 'upload'
					} );
				}

				clean();

				// Permanently remove video from insertion batch.
				model.enqueueChange( 'transparent', writer => {
					writer.remove( videoElement );
				} );
			} );

		function clean() {
			model.enqueueChange( 'transparent', writer => {
				writer.removeAttribute( 'uploadId', videoElement );
				writer.removeAttribute( 'uploadStatus', videoElement );
			} );

			fileRepository.destroyLoader( loader );
		}
	}

}

export function modelToViewAttributeConverter( attributeKey ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ attributeKey }:videoUpload`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const videoUploadElement = conversionApi.mapper.toViewElement( data.item );
		//const img = figure.getChild( 0 );

		if ( data.attributeNewValue !== null ) {
			viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, videoUploadElement );
		} else {
			viewWriter.removeAttribute( data.attributeKey, videoUploadElement );
		}
	}
}