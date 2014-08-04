/* global SettingsListener */
define(function(require) {
  'use strict';

  var SettingsService = require('modules/settings_service');

  var ScreenLock = function ctor_screenlock() {
    return {
      _panel: null,

      _settings: {
        passwordEnabled: false,
        passcodeEnabled: false,
        lockscreenEnabled: false
      },

      _getAllElements: function sl_getAllElements() {
        this.screenlockPanel = this._panel;
        this.lockscreenEnable = this._panel.querySelector('.lockscreen-enable');
        this.passcodeEnable = this._panel.querySelector('.passcode-enable');
        this.passwordEnable = this._panel.querySelector('.password-enable');
        this.passcodeEditButton = this._panel.querySelector('.passcode-edit');
        this.passwordEditButton = this._panel.querySelector('.password-edit');
      },

      init: function sl_init() {
        this._getAllElements();
        this.passcodeEnable.addEventListener('click', this);
        this.passwordEnable.addEventListener('click', this);
        this.lockscreenEnable.addEventListener('click', this);
        this.passcodeEditButton.addEventListener('click', this);
        this.passwordEditButton.addEventListener('click', this);
        this._fetchSettings();
      },

      onInit: function sl_onInit(panel) {
        this._panel = panel;
        this.init();
      },

      _fetchSettings: function sl_fetchSettings() {
        SettingsListener.observe('lockscreen.enabled', false,
          function(enabled) {
            this._toggleLockscreen(enabled);
        }.bind(this));

        SettingsListener.observe('lockscreen.passcode-lock.enabled', false,
          function(enabled) {
            this._togglePasscode(enabled);
        }.bind(this));
        
        SettingsListener.observe('lockscreen.password-lock.enabled', false,
          function(enabled) {
            this._togglePassword(enabled);
        }.bind(this));
      },

      _togglePasscode: function sl_togglePasscode(enabled) {
        this._settings.passcodeEnabled = enabled;
        this.screenlockPanel.dataset.passcodeEnabled = enabled;
        this.passcodeEnable.checked = enabled;
      },
      
      _togglePassword: function sl_togglePassword(enabled) {
        this._settings.passwordEnabled = enabled;
        this.screenlockPanel.dataset.passwordEnabled = enabled;
        this.passwordEnable.checked = enabled;
      },

      _toggleLockscreen: function sl_toggleLockscreen(enabled) {
        this._settings.lockscreenEnabled = enabled;
        this.screenlockPanel.dataset.lockscreenEnabled = enabled;
        this.lockscreenEnable.checked = enabled;
      },

      _showDialog: function sl_showDialog(mode, passtype) {
        SettingsService.navigate('screenLock-' + passtype, mode);

        // We're appending new elements to DOM so to make sure headers are
        // properly resized and centered, we emmit a lazyload event.
        // This will be removed when the gaia-header web component lands.
        window.dispatchEvent(new CustomEvent('lazyload', {
          detail: document.getElementById('screenLock-' + passtype)
        }));
      },

      handleEvent: function sl_handleEvent(evt) {
        switch (evt.target) {
          case this.passcodeEnable:
            evt.preventDefault();
            if(this._settings.passwordEnabled) {
              console.log("disable password first");
              break;
            }
            if (this._settings.passcodeEnabled) {
              this._showDialog('confirm', 'passcode');
            } else {
              this._showDialog('create', 'passcode');
            }
            break;
          case this.passwordEnable:
            evt.preventDefault();
            if(this._settings.passcodeEnabled) {
              console.log("disable passcode first");
              break;
            }
            if (this._settings.passwordEnabled) {
              this._showDialog('confirm', 'password');
            } else {
              this._showDialog('create', 'password');
            }
            break;
          case this.lockscreenEnable:
            if (this._settings.lockscreenEnabled === true &&
              this._settings.passcodeEnabled === true) {
              evt.preventDefault();
              this._showDialog('confirmLock', 'passcode');
            }
            if (this._settings.lockscreenEnabled === true &&
              this._settings.passwordEnabled === true) {
              evt.preventDefault();
              this._showDialog('confirmLock', 'password');
            }
            break;
          case this.passcodeEditButton:
            this._showDialog('edit', 'passcode');
            break;
          case this.passwordEditButton:
            this._showDialog('edit', 'password');
            break;
        }
      }
    };
  };

  return ScreenLock;
});
