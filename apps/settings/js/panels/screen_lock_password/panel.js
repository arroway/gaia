define(function(require) {
  'use strict';

  var SettingsPanel = require('modules/settings_panel');
  var ScreenLockPassword =
    require('panels/screen_lock_password/screen_lock_password');

  return function ctor_screenlockPassword() {
    var screenLockPassword = ScreenLockPassword();

    return SettingsPanel({
      onInit: function(panel) {
        screenLockPassword.onInit(panel);
      },
      onBeforeShow: function(panel, mode) {
        screenLockPassword.onBeforeShow(panel, mode);
      },
      onShow: function() {
        screenLockPassword.onShow();
      }
    });
  };
});
