It is a Gnome Shell extension to work with notebook computer which is compatible with https://github.com/tuxedocomputers/tuxedo-keyboard kernel driver. 

It can change and save/restore the backlight settings of the keyboard.

Tuxedo, Monster, Clevo notebook models might work.


# History

It is based on the code at https://gitlab.com/Fanelia82/clevo-xsm-wmi-backlight-keyboard/ .
Upgraded to work with the new tuxedo-keyboard kernel module.
Upraded to work with Ubuntu 20.04. And it is only tested with it and only one Monster computer. Please give me feedbacks :)  

# Install 

First, install the Kernel module for keyboard backlighting of Tuxedo / Clevo / Monster notebooks.

https://github.com/tuxedocomputers/tuxedo-keyboard


You need gnome shell extensions.

Then, clone repository and do "make install". 

Then, you need to give 666 permissions to brightness,color_* device files at /sys/devices/platform/tuxedo_keyboard, you can copy 30-tuxedo-keyboard.rules file to /etc/udev/rules.d directory. 

Note: It is at your own risk! With this operation everbody can write to your tuxedo-keyboard settings.

Alt+F2 and r and Enter.

# Modifications

Switched the controls from Right, Center, Left sliders to RGB values. Can no longer control them individually but my keyboard and I am sure many others don't support that anyways. Each slider has 15 levels of color.

RGB controls are low key cooler anyway ;)
