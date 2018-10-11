import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';


export default class Fullscreen extends Plugin {

    static get pluginName() {
        return 'fullscreen';
    }

    init() {
        const editor = this.editor;
        
        editor.ui.componentFactory.add( 'fullscreen', locale => {
            const view = new ButtonView( locale );
            let isFullscreen = false;
            
            view.set( {
                label: 'Fullscreen',
                class: 'fullscreen-toggle',
                tooltip: true
            } );
            
            view.on( 'execute', () => {
                let ckEditor = editor.ui.view.element;
                if (isFullscreen) {
                    ckEditor.classList.remove('fullscreen');
                    isFullscreen = false;
                    ckEditor.getElementsByClassName('ck-sticky-panel__content')[0].style.width = ckEditor.offsetWidth + 'px';
                }
                else {
                    ckEditor.classList.add('fullscreen');
                    isFullscreen = true;
                    ckEditor.getElementsByClassName('ck-sticky-panel__content')[0].style.width = ckEditor.offsetWidth + 'px';
                }
            });

            return view;
        } );
    }
}