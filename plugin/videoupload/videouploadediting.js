/**
 * @module videoupload/videoediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { downcastElementToElement, downcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement, upcastAttributeToAttribute } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import VideoUploadCommand from './videouploadcommand';

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
			allowAttributes: [ 'width', 'height', 'src', 'controls', 'controlsList', 'uploadId', 'uploadStatus' ]
		} );

		editor.conversion.elementToElement( {
			model: 'videoUpload',
			view: ( modelElement, viewWriter ) => {
				return viewWriter ? createVideoViewElement( viewWriter ):'';
			}
		} ) ;

		editor.conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'width' ) )
			.add( modelToViewAttributeConverter( 'height' ) )
			.add( modelToViewAttributeConverter( 'controls' ) )
			.add( modelToViewAttributeConverter( 'controlsList' ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: 'video',
			    model: ( viewElement, modelWriter ) => {
			        return modelWriter.createElement( 'videoUpload', {
						src: viewElement.getAttribute( 'src' ) ? viewElement.getAttribute( 'src' ) : '',
						width: viewElement.getAttribute( 'width' ) ? viewElement.getAttribute( 'width' ) : 640,
			        	height: viewElement.getAttribute( 'height' ) ? viewElement.getAttribute( 'height' ) : 480, 
						controls: '',
						controlsList: 'nodownload'
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
					let _ckeditorTopDivWidth = null;
					let _ckeditorTopDiv = document.getElementsByClassName('ck-editor__top');

					if(_ckeditorTopDiv && _ckeditorTopDiv[0] && _ckeditorTopDiv[0].clientWidth){
						var clientWidth = parseInt(_ckeditorTopDiv[0].clientWidth);
						_ckeditorTopDivWidth = clientWidth > 100 ? clientWidth - 30 : clientWidth;
					}
					var _width = _ckeditorTopDivWidth ? _ckeditorTopDivWidth : 640;
					var _height = parseInt(_width) * 0.5620;

					writer.setAttributes( { 
						uploadStatus: 'complete', 
						src: data.default, 
						width: _width, 
						height: _height,  
					}, videoElement );
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
		const iframe = videoUploadElement.getChild( 0 );

		if ( data.attributeNewValue !== null ) {
			viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, iframe );
		} else {
			viewWriter.removeAttribute( data.attributeKey, iframe );
		}
	}
}

// Creates a view element representing the video.
//
//		<div class="video-container"><video></video></div>
//
//
// @private
// @param {module:engine/view/writer~Writer} writer
// @returns {module:engine/view/containerelement~ContainerElement}
export function createVideoViewElement( writer ) {
	const emptyElement = writer.createEmptyElement( 'video' );
	const divContainer = writer.createContainerElement( 'div', { class: 'video-container' } );

	writer.insert( ViewPosition.createAt( divContainer ), emptyElement );

	return divContainer;
}