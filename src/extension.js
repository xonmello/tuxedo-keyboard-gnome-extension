/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

	// Made by Me := Fanelia
	// This extension put a menu item on the Status Menu that change the backlight keyboard light using clevo-xsm-wmi by tuxedo
	
	// Import St because is the library that allow you to create UI elements 
	const St = imports.gi.St;
	// Import Clutter because is the library that allow you to layout UI elements */
	const Clutter = imports.gi.Clutter;

	// Import Main because is the instance of the class that have all the UI elements
	// and we have to add to the Main instance our UI elements
	
	const Main = imports.ui.main;

	// Import tweener to do the animations of the UI elements 
	//const Tweener = imports.ui.tweener;

	
	//Import PanelMenu and PopupMenu 
	const PanelMenu = imports.ui.panelMenu;
	const PopupMenu = imports.ui.popupMenu;

 
	const Gio = imports.gi.Gio;
	const Gtk = imports.gi.Gtk;
	const GLib = imports.gi.GLib;
	const GObject = imports.gi.GObject;
	
    const Colors=["000000","000000","000000","000000","FF0000","00FF00","0000FF","FFFF00","FF00FF","00FFFF","FFFFFF","000000","FF0000","00FF00","0000FF","FFFF00","FF00FF","00FFFF","FFFFFF"]
	const ExtensionUtils = imports.misc.extensionUtils;
	const Me = ExtensionUtils.getCurrentExtension();
	
	// import own scripts
	const Convenience = Me.imports.convenience;                       

	// For compatibility checks, as described above
	const Config = imports.misc.config;
	const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

	const Slider = imports.ui.slider;

	//Import Lang because we will write code in a Object Oriented Manner

	const Lang = imports.lang;

	// GLobal vairables
	// UI Obj
	let slider1, slider2, slider3,sliderBright,sliderMain,popupMenuExpander;
	let colorButtonMain;
	// Variables
	let menuOpened,saveState,ls,rs,cs,ms,bs;
	let settings;
	let ms_permission=false;
	let directory;
	
	// We're going to declare `indicator` in the scope of the whole script so it can
	// be accessed in both `enable()` and `disable()`
	var indicator = null;
	
   
   
	// We'll extend the Button class from Panel Menu so we can do some setup in
	// the init() function.
	var TuxedoKeyboard = class TuxedoKeyboard extends PanelMenu.Button {
   
		_init() {
			super._init(0.0, `${Me.metadata.name} Indicator`, false);
   
			// Pick an icon
			let icon = new St.Icon({gicon: new Gio.ThemedIcon({name: 'input-keyboard-symbolic'}),style_class: 'system-status-icon'});

			this.add_child(icon);

			// Created menu icon
   
			// Menu expander
			popupMenuExpander = new PopupMenu.PopupSubMenuMenuItem('Backlight Keyboard');

			// Submenu item
			let rightmenuitem = new PopupMenu.PopupImageMenuItem('R', 'format-justify-left-symbolic');		
			let centermenuitem = new PopupMenu.PopupImageMenuItem('G', 'format-justify-fill-symbolic');	
			let leftmenuitem = new PopupMenu.PopupImageMenuItem('B', 'format-justify-right-symbolic');	

			slider1 = new Slider.Slider(rs/15);
			rightmenuitem.add(slider1, {expand: false});
			slider2 = new Slider.Slider(cs/15);
			centermenuitem.add(slider2, {expand: true});
			slider3 = new Slider.Slider(ls/15);
			leftmenuitem.add(slider3, {expand: true});

			popupMenuExpander.menu.addMenuItem(rightmenuitem);
			popupMenuExpander.menu.addMenuItem(centermenuitem);
			popupMenuExpander.menu.addMenuItem(leftmenuitem);

			// Assemble all menu items
			this.menu.addMenuItem(popupMenuExpander);

			popupMenuExpander.setSubmenuShown(menuOpened);

			// This is a menu separator
			this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

			let label1 = new St.Label({text:'Main Color  ',y_expand: true,y_align: Clutter.ActorAlign.START });
			let label2 = new St.Label({text:'Brightness  ',y_expand: true,y_align: Clutter.ActorAlign.START });

			// Slider color general
			let colorMain = new PopupMenu.PopupMenuItem('');
			sliderMain = new Slider.Slider(ms/15);
			
			/*for(var a in imports.ui){
				log(a);
			}*/
			//colorButtonMain = new St.Button();
			//colorMain.add(colorButtonMain, {expand: true});

			colorMain.add(label1);
			colorMain.add(sliderMain, {expand: true});
			colorMain.style_class = 'ItemStyle';
			this.menu.addMenuItem(colorMain);

			// Slider brightness
			let brightness = new PopupMenu.PopupMenuItem('');
			sliderBright = new Slider.Slider(bs/255);
			
			brightness.add(label2);
			brightness.add(sliderBright, {expand: true});///
			brightness.style_class = 'ItemStyle';
			this.menu.addMenuItem(brightness);

			// This is a menu separator
			this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

			// Restore or not after reboot
			//let switchRestore = new PopupMenu.PopupSwitchMenuItem('Restore After Reboot');
			//this.menu.addMenuItem(switchRestore);
			
 			//switchRestore.setToggleState(saveState);
			
			// Relations between main menu and submenus
			this.menu.connect('open-state-changed', Lang.bind(this, function(){
				popupMenuExpander.setSubmenuShown(menuOpened);
			}));
			
			// Switch function
/* 			switchRestore.connect('toggled', Lang.bind(this, function(object, value){
				// We will just change the text content of the label
				if(value) {
					saveState=true;
					_SaveCurrentState();
				} else {
					saveState=false;
				}
				settings.set_boolean('restore-on-restart',saveState);
			}));
 */			
			// Sliders
			slider1.connect('notify::value', _onSlider1Changed);
			slider2.connect('notify::value', _onSlider2Changed);
			slider3.connect('notify::value', _onSlider3Changed);
			sliderBright.connect('notify::value', _onSliderBrightnessChanged);
			sliderMain.connect('notify::value', _onSliderMainChanged); 
		}	
	}

	// Update brightness value if slider has changed
	function _onSliderBrightnessChanged() {
		// Change luminosity value
		let old=bs;
		bs=Math.round(sliderBright.value*255);
		if(old!=bs){
			// Write on file 
			_ApplyBrightness();
			
			if(saveState) {
				// Save settings
			    	settings.set_int('brightness', bs);
			}
		}
	}
	
	// Update main slider value if slider has changed
	function _onSliderMainChanged() {
		// Change all 3 sliders
		ms_permission=false;
		rs=ms;
		cs=ms;
		ls=ms;
		
		// Hide Submenu
		_closeSubmenu();
		let old=ms;
		ms=Math.round(sliderMain.value*15); 
		
		slider1.value=sliderMain.value;
		slider2.value=sliderMain.value;
		slider3.value=sliderMain.value;
		
		if(old!=ms){
			rs=ms;
			cs=ms;
			ls=ms;

			// Write on file 
			ms_permission=true;
			_ApplyColors();
			if(saveState) {
				// Save settings
					settings.set_int('main-slider', ms);
					settings.set_int('right-slider', rs);
					settings.set_int('center-slider', cs);
					settings.set_int('left-slider', ls);
			}
		}
		ms_permission=true;
	}
	
	// Update Right slider value if slider has changed
	function _onSlider1Changed() {
		// Change color Right
		let old=rs;
		rs=Math.round(slider1.value*15);
		if (ms_permission){
			_openSubmenu();
			if(old!=rs){
				// Write on file 
				_ApplyColors();
				if(saveState) {
					// Save settings
						settings.set_int('right-slider', rs);
				}
			}
		}
	}
	// update Center slider value if slider has changed
	function _onSlider2Changed() {
		// Change color Center
		let old=cs;
		cs=Math.round(slider2.value*15);
		if (ms_permission){
			_openSubmenu();
			if(old!=cs){
				// Write on file 
				_ApplyColors();
				if(saveState) {
					// Save settings
						settings.set_int('center-slider', cs);
				}
			}
		}
	}
	// Update Left slider value if slider has changed
	function _onSlider3Changed() {
		// Change color Left
		let old=ls;
		ls=Math.round(slider3.value*15);
		if (ms_permission){
			_openSubmenu();
			if(old!=ls){
				// Write on file 
				_ApplyColors();
				if(saveState) {
					// Save settings
						settings.set_int('left-slider', ls);
				}
			}
		}
	}
	
	function _openSubmenu(){
		if(!menuOpened){
			menuOpened=true;
			settings.set_boolean('menu-opened',true);
		}
	}
	function _closeSubmenu(){
		if(menuOpened){
			menuOpened=false;
			popupMenuExpander.setSubmenuShown(menuOpened);
			settings.set_boolean('menu-opened',false);
		}
	}
	
	function _SaveCurrentState(){
		settings.set_int('right-slider',rs);
		settings.set_int('center-slider',cs);
		settings.set_int('left-slider',ls);
		settings.set_int('main-slider',ms);
		settings.set_int('brightness',bs);
	}
	
	// Write on file
	function _ApplyBrightness(){
		let brightness = ''+bs;
		log(brightness);
		let directoryPath='/sys/devices/platform/clevo_keyboard/';
		directory = Gio.File.new_for_path(directoryPath);

  		if (!directory.query_exists(null)) {
			log('Error: directory not found');
		}else{
			let filePath = GLib.build_filenamev([directoryPath, "brightness"]);
			let args = ["sh", "-c","echo "+ "\"" +brightness +"\"" + " > "+"\"" +filePath+"\"" +" "];
			log(args.join(" "));
			GLib.spawn_sync(null, args, null, GLib.SpawnFlags.SEARCH_PATH, null);
		}
	}
	
	function convertToHex(num) {
		switch (num) {
			case 15:
				return "F";
			case 14:
				return "E";
			case 13:
				return "D";
			case 12:
				return "C";
			case 11:
				return "B";
			case 10:
				return "A";
			default:
				return num.toString();
		}
	}
	
	// Write on files
	function _ApplyColors(){
		if(ms_permission){
			let directoryPath='/sys/devices/platform/clevo_keyboard/';
			
			directory = Gio.File.new_for_path(directoryPath);

  			if (!directory.query_exists(null)) {
    				log('Errore la directory non esiste');
			}else{
				let filePath = GLib.build_filenamev([directoryPath, "color_left"]);
				let colorTransferR = convertToHex(rs) + convertToHex(rs);
				let colorTransferG = convertToHex(cs) + convertToHex(cs);
				let colorTransferB = convertToHex(ls) + convertToHex(ls);
				let colorTransfer = colorTransferR + colorTransferG + colorTransferB;
				let args = ["sh", "-c","echo "+ "\"0x" + colorTransfer +"\"" + " > "+"\"" +filePath+"\"" +" "];
				log(ls);
				log(args.join(" "));
				GLib.spawn_sync(null, args, null, GLib.SpawnFlags.SEARCH_PATH, null);

				filePath = GLib.build_filenamev([directoryPath, "color_center"]);
				args = ["sh", "-c","echo "+ "\"0x" + Colors[0] +"\"" + " > "+"\"" +filePath+"\"" +" "];
				log(cs);
				log(args.join(" "));
				GLib.spawn_sync(null, args, null, GLib.SpawnFlags.SEARCH_PATH, null);

				filePath = GLib.build_filenamev([directoryPath, "color_right"]);
				args = ["sh", "-c","echo "+ "\"0x" + Colors[0] +"\"" + " > "+"\"" +filePath+"\"" +" "];
				log(rs);
				log(args.join(" "));
				GLib.spawn_sync(null, args, null, GLib.SpawnFlags.SEARCH_PATH, null);

			}
		}
	}

	// Compatibility with gnome-shell >= 3.32
	if (SHELL_MINOR > 30) {
		TuxedoKeyboard = GObject.registerClass(
			{GTypeName: 'TuxedoKeyboard'},
			TuxedoKeyboard
		);
	}
  
   
	function init() {
		settings = Convenience.getSettings();
		menuOpened=settings.get_boolean('menu-opened');
		saveState=settings.get_boolean('restore-on-restart');
		rs=settings.get_int('right-slider');
		cs=settings.get_int('center-slider');
		ls=settings.get_int('left-slider');
		ms=settings.get_int('main-slider');
		bs=settings.get_int('brightness');
		_ApplyBrightness();
		ms_permission=true;
		_ApplyColors();  
		ms_permission=false;
		log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
	}
   
   
	function enable() {
		log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
   
		indicator = new TuxedoKeyboard();
		_ApplyBrightness();
		ms_permission=true;
		_ApplyColors();  
		ms_permission=false;
		
		Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator,0,'right');
	}
   
   
	function disable() {
		log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
   
		// REMINDER: It's required for extensions to clean up after themselves when
		// they are disabled. This is required for approval during review!
		if (indicator !== null) {
			indicator.destroy();
			indicator = null;
		}
	}

