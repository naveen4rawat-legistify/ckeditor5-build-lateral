/**
 * @module videourl/videourlediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import VideoUrlCommand from './videourlcommand';


/**
 * The video url engine feature.
 * @extends module:core/plugin~Plugin
 */
export default class VideoUrlEditing extends Plugin {

	init() {
		const editor = this.editor;

		editor.model.schema.register( 'videoUrl', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowIn: '$block',
			allowAttributes: [ 'width', 'height', 'src', 'frameborder', 'allow', 'allowfullscreen' ]
		} );

		editor.conversion.elementToElement( {
			model: 'videoUrl',
			view: ( modelElement, viewWriter ) => {
				//return viewWriter ? viewWriter.createEmptyElement( 'iframe', modelElement.getAttributes()):'';
				return viewWriter ? createVideoViewElement( viewWriter ):'';
			}
		} ) ;

		editor.conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'width' ) )
			.add( modelToViewAttributeConverter( 'height' ) )
			.add( modelToViewAttributeConverter( 'frameborder' ) )
			.add( modelToViewAttributeConverter( 'allow' ) )
			.add( modelToViewAttributeConverter( 'allowfullscreen' ) );

		editor.conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: 'iframe',
			    model: ( viewElement, modelWriter ) => {
			        return modelWriter.createElement( 'videoUrl', {
			        	src: viewElement.getAttribute( 'src' ) ? viewElement.getAttribute( 'src' ) : '',
			        	width: viewElement.getAttribute( 'width' ) ? viewElement.getAttribute( 'width' ) : 640,
			        	height: viewElement.getAttribute( 'height' ) ? viewElement.getAttribute( 'height' ) : 480,
			        	frameborder: viewElement.getAttribute( 'frameborder' ) ? viewElement.getAttribute( 'frameborder' ) : 0,
			        	allowfullscreen: viewElement.getAttribute( 'allowfullscreen' ) ? viewElement.getAttribute( 'allowfullscreen' ) : true,
			        	allow: viewElement.getAttribute( 'allow' ) ? viewElement.getAttribute( 'allow' ) : 'autoplay; encrypted-media'
			        } );
			    }
			} ) );

		// Create video url commands.
		editor.commands.add( 'videoUrl', new VideoUrlCommand( editor ) );
	}
}

// Creates a view element representing the video.
//
//		<div class="video-container"><iframe></iframe></div>
//
//
// @private
// @param {module:engine/view/writer~Writer} writer
// @returns {module:engine/view/containerelement~ContainerElement}
export function createVideoViewElement( writer ) {
	const emptyElement = writer.createEmptyElement( 'iframe' );
	const divContainer = writer.createContainerElement( 'div', { class: 'video-container' } );

	writer.insert( ViewPosition.createAt( divContainer ), emptyElement );

	return divContainer;
}

export function modelToViewAttributeConverter( attributeKey ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ attributeKey }:videoUrl`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const videoUrlElement = conversionApi.mapper.toViewElement( data.item );
		const iframe = videoUrlElement.getChild( 0 );

		if ( data.attributeNewValue !== null ) {
			viewWriter.setAttribute( data.attributeKey, data.attributeNewValue, iframe );
		} else {
			viewWriter.removeAttribute( data.attributeKey, iframe );
		}
	}
}