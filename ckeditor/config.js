CKEDITOR.editorConfig = function( config ) {
	config.language = 'es';
	config.uiColor = '#000000';
	config.height = 100;
	config.toolbarCanCollapse = true;
	config.toolbarGroups = [
		{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'links', groups: [ 'links' ] },
		{ name: 'insert', groups: [ 'insert' ] },
		{ name: 'styles', groups: [ 'styles' ] },
		{ name: 'colors', groups: [ 'colors' ] },
		{ name: 'tools', groups: [ 'tools' ] },
	];

	config.removeButtons = 'Strike,Subscript,Superscript,BulletedList,Indent,Unlink,Anchor,Link,Outdent,NumberedList,About';

	config.extraPlugins = 'doNothing';
	config.enterMode = CKEDITOR.ENTER_BR;
	config.keystrokes = [
		[ 13 /*Enter*/, 'doNothing'],
		[CKEDITOR.SHIFT + 13 , 'doNothing' ]
	];
    
    config.fillEmptyBlocks = false;
    config.tabSpaces = 0;
};