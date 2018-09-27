/**
 * @module videoupload/videoediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import VideoUploadCommand from './videouploadcommand';

/**
 * The embed engine feature.
 * @extends module:core/plugin~Plugin
 */
export default class VideoUploadEditing extends Plugin {

	init() {
		const editor = this.editor;

		editor.model.schema.register( 'videoUpload', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowIn: '$block',
			allowAttributes: [ 'width', 'height', 'src', 'frameborder', 'allow', 'allowfullscreen' ]
		} );

		editor.conversion.elementToElement( {
			model: 'videoUpload',
			view: ( modelElement, viewWriter ) => {
				return viewWriter ? viewWriter.createEmptyElement( 'iframe', modelElement.getAttributes()):'';
			}
		} ) ;

		editor.conversion.for( 'upcast' ).add( upcastElementToElement( {
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

	}

}
