/* global SettingsListener */
define(function(require) {
  'use strict';

  var SettingsService = require('modules/settings_service');

  var ScreenLockPassword = function ctor_screenlock_password() {
    return {
      _panel: null,

      /**
       * create  : when the user turns on passcode settings
       * edit    : when the user presses edit passcode button
       * confirm : when the user turns off passcode settings
       * new     : when the user is editing passcode
       *                and has entered old passcode successfully
       */
      _MODE: 'create',

      _settings: {
        password: 'hello'
      },

      _checkingLength: {
        'create': 256,
        'new': 256,
        'edit': 128,
        'confirm': 128,
        'confirmLock': 128
      },
      
      _checkingConfirmLength: {
        'create': 128,
        'new': 128,
        'edit': 0,
        'confirm': 0,
        'confirmLock': 0
      },

      _passwordBuffer: '',
      _passwordConfirmBuffer: '',

      _getAllElements: function sld_getAllElements() {
        this.passwordPanel = this._panel;
        this.passwordInput = this._panel.querySelector('.password-input');
        this.passwordConfirmInput = this._panel.querySelector('.password-confirm-input');
        //this.passcodeDigits = this._panel.querySelectorAll('.passcode-digit');
        //this.passcodeContainer =
        //  this._panel.querySelector('.passcode-container');
        this.createPasswordButton =
          this._panel.querySelector('.password-create');
        this.changePasswordButton =
          this._panel.querySelector('.password-change');
        this.checkPasswordButton = 
          this._panel.querySelector('.password-check');
      },

      init: function sld_onInit() {
        this._getAllElements();
        this.passwordInput.addEventListener('input', this);
        this.passwordConfirmInput.addEventListener('input', this);
        this.createPasswordButton.addEventListener('click', this);
        this.changePasswordButton.addEventListener('click', this);
        this.checkPasswordButton.addEventListener('click', this);

        // If the pseudo-input loses focus, then allow the user to restore focus
        // by touching the container around the pseudo-input.
        //this.passcodeContainer.addEventListener('click', function(evt) {
        //  this.passcodeInput.focus();
        //  evt.preventDefault();
        //}.bind(this));

        this._fetchSettings();
      },

      onInit: function sld_onInit(panel) {
        this._panel = panel;
        this.init();
      },

      onBeforeShow: function sld_onBeforeShow(panel, mode) {
        this._showDialogInMode(mode);
      },

      onShow: function sld_onShow() {
        this.passwordInput.focus();
      },

      _showDialogInMode: function sld_showDialogInMode(mode) {
        this._hideErrorMessage();
        this._MODE = mode;
        this.passwordPanel.dataset.mode = mode;
        this._updatePassWordUI();
      },

      handleEvent: function sld_handleEvent(evt) {
        var settings;
        var password;
        var lock;
        console.log("handleEvent");
        switch (evt.target) {
          case this.passwordInput:
            console.log("passwordInput");
            evt.preventDefault();
            if (this._passwordBuffer === '') {
              this._hideErrorMessage();
            }

            /*var code = evt.charCode;
            if (code !== 0 && (code < 0x30 || code > 0x39)) {
              return;
            }

           var key = String.fromCharCode(code);
            console.log("handleEvent: key "  + key);
            if (evt.charCode === 0) {
              if (this._passwordBuffer.length > 0) {
                this._passwordBuffer = this._passwordBuffer.substring(0,
                  this._passwordBuffer.length - 1);
                if (this.passwordPanel.dataset.passwordStatus === 'success') {
                  this._resetPasswordStatus();
                }
              }
            } else if (this._passwordBuffer.length < 128) {
              this._passwordBuffer += key;
            }*/

            this._passwordBuffer = document.getElementsByClassName("password-input")[0].value;
            console.log("handleEvent: _passwordBuffer: " + this._passwordBuffer);
            //this._updatePassWordUI();
            this._enablePassword();
            break;
          case this.passwordConfirmInput:
            console.log("passwordConfirmInput");
            evt.preventDefault();
            if (this._passwordConfirmBuffer === '') {
              this._hideErrorMessage();
            }

            /*var code = evt.charCode;
            console.log("handleEvent: code " + code);
            if (code !== 0 && (code < 0x30 || code > 0x39)) {
              return;
            }

            var key = String.fromCharCode(code);
            if (evt.charCode === 0) {
              if (this._passwordConfirmBuffer.length > 0) {
                this._passwordConfirmBuffer = this._passwordConfirmBuffer.substring(0,
                  this._passwordConfirmBuffer.length - 1);
                if (this.passwordConfirmPanel.dataset.passwordStatus === 'success') {
                  this._resetPasswordStatus();
                }
              }
            } else if (this._passwordConfirmBuffer.length < 128) {
              this._passwordConfirmBuffer += key;
            }*/
            
            this._passwordConfirmBuffer = document.getElementsByClassName("password-confirm-input")[0].value;
            console.log("handleEvent: _passwordConfirmBuffer " + this._passwordConfirmBuffer);
            this._updatePassWordUI();
            this._enablePassword();
            break;
          case this.createPasswordButton:
          case this.checkPasswordButton:
          case this.changePasswordButton:
            console.log("handleEvent: changePasswordButton");
            evt.stopPropagation();
            if (this.passwordPanel.dataset.passwordStatus !== 'success') {
              console.log("handleEvent: passwordStatus " + this.passwordPanel.dataset.passwordStatus);
              this._showErrorMessage();
              this.passwordInput.focus();
              return;
            }
            password = this._passwordBuffer.substring(0, 128);
            settings = navigator.mozSettings;
            console.log("Setting password !!");
            lock = settings.createLock();
            lock.set({
              'lockscreen.password-lock.code': password
            });
            lock.set({
              'lockscreen.password-lock.enabled': true
            });
            console.log("settings.password: " + this._settings.password);
            this._backToScreenLock();
            break;
        }
      },
      
      _enablePassword: function sld_enablePassword() {
        var settings;
        var password;
        var lock;
        console.log("_enablePassword: MODE " + this._MODE);
        console.log("this._passwordBuffer: " + this._passwordBuffer + " " +  this._passwordBuffer.length);
        console.log("this._passwordConfirmBuffer: " + this._passwordConfirmBuffer + " " +  this._passwordConfirmBuffer.length);
        var totalLength = this._passwordBuffer.length + this._passwordConfirmBuffer.length;
        if(totalLength <= this._checkingLength[this._MODE]) { 
            //&& (this._passwordBuffer.length === this._passwordConfirmBuffer.length
            //|| this._passwordConfirmBuffer.length <= this._checkingConfirmLength[this._mode])) {
          switch (this._MODE) {
            case 'create':
            case 'new':
              console.log("_enablePassword: new");
              if (this._passwordBuffer.length !== this._passwordConfirmBuffer.length) {
                break;
              }
              password = this._passwordBuffer.substring(0, 128);
              var passwordToConfirm = this._passwordConfirmBuffer.substring(0, 128);
              if (password != passwordToConfirm) {
                console.log("_enablePassword: NOK" + password + " / " + passwordToConfirm);
                this._passwordBuffer = '';
                this._passwordConfirmBuffer = '';
                this._showErrorMessage();
              } else {
                this._enableButton();
              }
              break;
            case 'confirm':
              console.log("_enablePassword: confirm");
              if (this._checkPassword()) {
                settings = navigator.mozSettings;
                lock = settings.createLock();
                lock.set({
                  'lockscreen.password-lock.enabled': false
                });
                this._backToScreenLock();
              } else {
                this._passwordBuffer = '';
                this._passwordConfirmBuffer = '';
              }
              break;
            case 'confirmLock':
              console.log("_enablePassword: confirmLock");
              if (this._checkPassword()) {
                settings = navigator.mozSettings;
                lock = settings.createLock();
                lock.set({
                  'lockscreen.enabled': false
                });
                this._backToScreenLock();
              } else {
                this._passwordBuffer = '';
                this._passwordConfirmBuffer = '';
              }
              break;
            case 'edit':
              console.log("_enablePassword: edit");
              if (this._checkPassword()) {
                this._passwordBuffer = '';
                this._passwordConfirmBuffer = '';
                this.passwordInput.value = '';
                this._updatePassWordUI();
                this._showDialogInMode('new');
              } else {
                this._passwordBuffer = '';
                this._passwordConfirmBuffer = '';
              }
              break;
          }

          // We're appending new elements to DOM so to make sure headers are
          // properly resized and centered, we emmit a lazyload event.
          // This will be removed when the gaia-header web component lands.
          window.dispatchEvent(new CustomEvent('lazyload', {
            detail: this._panel
          }));
        }
      },

      _fetchSettings: function sld_fetchSettings() {
        SettingsListener.observe('lockscreen.password-lock.code', 'hello',
          function(password) {
            this._settings.password = password;
        }.bind(this));
      },

      _showErrorMessage: function sld_showErrorMessage(message) {
        this.passwordPanel.dataset.passwordStatus = 'error';
      },

      _hideErrorMessage: function sld_hideErrorMessage() {
        this.passwordPanel.dataset.passwordStatus = '';
      },

      _resetPasswordStatus: function sld_resetPasswordStatus() {
        this.passwordPanel.dataset.passwordStatus = '';
      },

      _enableButton: function sld_enableButton() {
        this.passwordPanel.dataset.passwordStatus = 'success';
      },

      _updatePassWordUI: function sld_updatePassWordUI() {

        //this._passwordBuffer.value = '';
        //this._passwordConfirmBuffer.value = '';
        //for (var i = 0; i < 8; i++) {
        //  if (i < this._passwordBuffer.length) {
        //    this.passwordDigits[i].dataset.dot = true;
        //  } else {
        //    delete this.passwordDigits[i].dataset.dot;
        //  }
        // }
      },

      _checkPassword: function sld_checkPassword() {
        console.log("_changePassword");
        console.log("_changePassword: " + this._settings.password + " / " + this._passwordBuffer);
        if (this._settings.password != this._passwordBuffer) {
          this._showErrorMessage();
          return false;
        } else {
          this._hideErrorMessage();
          return true;
        }
      },

      _backToScreenLock: function sld_backToScreenLock() {
        console.log("_backToScreenLock")
        this._passwordBuffer = '';
        this._passwordConfirmBuffer = '';
        this.passwordInput.value = '';
        this.passwordConfirmInput.value = '';
        //this.passwordInput.blur();
        //this.passwordConfirmInput.blur();
        SettingsService.navigate('screenLock');
      }
    };
  };

  return ScreenLockPassword;
});
