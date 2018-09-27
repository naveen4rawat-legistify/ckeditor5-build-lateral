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
        //const url = this.editor.config.get( 'ckfinder.uploadUrl' );
        const url = 'https://api-dev.opogo.com/api/contents/PartnerUploadMedia'

		if ( !url ) {
			return;
		}

		// Register OpogoUploadAdapter 
		this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => new UploadAdapter( loader, url, this.editor.t );
	}
}

/**
 * Upload adapter for CKFinder.
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
        xhr.setRequestHeader('Authorization', `bearer CR1UsI86QFo-X7E2eYV2McVuL7sQXErGjy_jloyTFOemd4aAxobdbGmBru-hYAmL7422fh5dn4seWx6Xl1XiaU0jtJdcVlmN85A2ywMyh4HVXSE_E_DEYILqGew_YNap4kzFR0AGmqhUlM3k2ZxIMB0tlbaCIsfgOgw7C6dfEKSfXEyV0rafLRsv_M2V2OEK-d1KfCm53Ug_wI3OzVjPurSWKjGa0Bk01Pdo70rlFIYlh_9nocVdpXVjDohqxEBkfK9h7TqcfaNhLyRzJIYQ-sA8KjcrZoHBih-Y9OoWov7KY64_Q2yhploYuFGXHdWvGgxp5M9Hr22do8KGAyJhr_AV4ae5ml7gZiMC4J8BLegn1SvP9-VidCEEsI8_EM0tt_ap3E17hWOAKTqXNJUwtRlsrP_SbTCTbIjgAdryqdOMPoqb4Ed39HuL5TmpnLpSXJ3EZ3JNf89h0ZOl90WXikuUuemTa4UOg0ih1VReStg0oPglDG60-M1y01M-OnwZ`);
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
		data.append( 'upload', this.loader.file );
		//data.append( 'ckCsrfToken', getCsrfToken() );

		// Send request.
		this.xhr.send( data );
	}
}

/**
 * The configuration of the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}.
 *
 * Read more in {@link module:adapter-ckfinder/uploadadapter~CKFinderAdapterConfig}.
 *
 * @member {module:adapter-ckfinder/uploadadapter~CKFinderAdapterConfig} module:core/editor/editorconfig~EditorConfig#ckfinder
 */

/**
 * The configuration of the {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter CKFinder upload adapter}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				ckfinder: {
 *					uploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface CKFinderAdapterConfig
 */

/**
 * The URL to which files should be uploaded.
 *
 * @member {String} module:adapter-ckfinder/uploadadapter~CKFinderAdapterConfig#uploadUrl
 */