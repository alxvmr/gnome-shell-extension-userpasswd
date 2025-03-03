/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0
 */
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

import Gio from 'gi://Gio';

async function onStartChild() {
    try {
        const proc = Gio.Subprocess.new(['userpasswd'],
            Gio.SubprocessFlags.NONE);

        Main.panel.closeQuickSettings();
        
        const success = await proc.wait_check_async(null);
        // console.log (`The process ${success? 'succeeded' : 'failed'}`);
    } catch (e) {
        Main.notifyError (_("Error"), e.message);
    }
}

const UserpasswdToggle = GObject.registerClass(
    class UserpasswdToggle extends QuickToggle {
        constructor() {
            super({
                title: _("Change password"),
                iconName: 'dialog-password-symbolic',
                toggleMode: false,
            });

            this.connect('clicked', onStartChild);
        }
    }
);

const UserpasswdIndicator = GObject.registerClass(
    class UserpasswdIndicator extends SystemIndicator {
        constructor() {
            super();

            const toggle = new UserpasswdToggle ();
            this.quickSettingsItems.push (toggle);
        }
    }
);

export default class UserpasswdExtension extends Extension {
    enable() {
        this._indicator = new UserpasswdIndicator ();
        Main.panel.statusArea.quickSettings.addExternalIndicator (this._indicator);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
    }
}