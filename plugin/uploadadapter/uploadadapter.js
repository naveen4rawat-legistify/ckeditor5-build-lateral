import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

export default class OpogoUploadAdapter extends Plugin {
    /**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository ];
    }
    
    /**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'OpogoUploadAdapter';
	}

    /**
	 * @inheritDoc
	 */
	init() {
        const url = this.editor.config.get( 'opogo.uploadUrl' );

		if ( !url ) {
			return;
		}

		// Register OpogoUploadAdapter 
		this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => new UploadAdapter( loader, url, this.editor.t );
	}
}

/**
 * Upload adapter
 *
 * @private
 * @implements module:upload/filerepository~UploadAdapter
 */
class UploadAdapter {
	/**
	 * Creates a new adapter instance.
	 *
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {String} url
	 * @param {module:utils/locale~Locale#t} t
	 */
	constructor( loader, url, t ) {
		/**
		 * FileLoader instance to use during the upload.
		 *
		 * @member {module:upload/filerepository~FileLoader} #loader
		 */
		this.loader = loader;

		/**
		 * Upload URL.
		 *
		 * @member {String} #url
		 */
		this.url = url;

		/**
		 * Locale translation method.
		 *
		 * @member {module:utils/locale~Locale#t} #t
		 */
		this.t = t;
	}

	/**
	 * Starts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#upload
	 * @returns {Promise}
	 */
	upload() {
		return new Promise( ( resolve, reject ) => {
			this._initRequest();
			this._initListeners( resolve, reject );
			this._sendRequest();
		} );
	}

	/**
	 * Aborts the upload process.
	 *
	 * @see module:upload/filerepository~UploadAdapter#abort
	 * @returns {Promise}
	 */
	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}

	/**
	 * Initializes the XMLHttpRequest object.
	 *
	 * @private
	 */
	_initRequest() {
		const xhr = this.xhr = new XMLHttpRequest();

        xhr.open( 'POST', this.url, true );
		xhr.setRequestHeader('Authorization', `bearer aCd2MquhujpoUjgvP6xuu_GxnirPJ0riiHCuwZUnxHU9Nmpz-Y1CcDwYuJAc3qyyKS-XNVn22JN6yIs_RWZ9xUuRcPP5evj2Ab6YE9T-P_UpSP2sroCUQqCL5tqceOfw6dw-4LCIjx2ERIpvaMSnRK5qwPPqlQLCMv7Le_TnuL3-eKI6L5wFG4AojZAYNalIhqCzlGQo9GkqJxLtwxCHzWD5xYnMBQNSTcix3wXHdOpEIY5SBt599E1_abv8lECBUtbW7woUfdq4RQb2Sq7dc39wMT8KBSE1d48-rYwqxeyowsntYE8tsVc6BUIVe2dFaUTr1NV3GQpuWQIyz63MEEeIFXLAHiiuZ7PI06EF5cBO4v9XhNInIe1ogTO3LCR1FMeVdYL1Dy2xOBZvPJDcEkoj7b59-RHMvTJIywYFwK-VmOHDNzw86sPNZU4ifOaLCA_AATRw_wegCGq6V-vJZJaz3XJgFlVP6ZHEGO_3jfI`);
		//xhr.setRequestHeader('Authorization', `bearer ${localStorage.getItem('token')}`);
		xhr.responseType = 'json';
	}

	/**
	 * Initializes XMLHttpRequest listeners.
	 *
	 * @private
	 * @param {Function} resolve Callback function to be called when the request is successful.
	 * @param {Function} reject Callback function to be called when the request cannot be completed.
	 */
	_initListeners( resolve, reject ) {
		const xhr = this.xhr;
		const loader = this.loader;
		const t = this.t;
		const genericError = t( 'Cannot upload file:' ) + ` ${ loader.file.name }.`;

		xhr.addEventListener( 'error', () => reject( genericError ) );
		xhr.addEventListener( 'abort', () => reject() );
		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			/*if ( !response || !response.uploaded ) {
				return reject( response && response.error && response.error.message ? response.error.message : genericError );
			}*/

			resolve( {
				default: response //response.url
			} );
		} );

		// Upload progress when it's supported.
		/* istanbul ignore else */
		if ( xhr.upload ) {
			xhr.upload.addEventListener( 'progress', evt => {
				if ( evt.lengthComputable ) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			} );
		}
	}

	/**
	 * Prepares the data and sends the request.
	 *
	 * @private
	 */
	_sendRequest() {
		// Prepare form data.
		const data = new FormData();
		data.append( 'file', this.loader.file );

		// Send request.
		this.xhr.send( data );
	}
}