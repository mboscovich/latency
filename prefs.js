import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

const DEFAULT_WAN_IP         = '8.8.8.8';
const DEFAULT_RESOLVE_DOMAIN = 'google.com';
const POSITION_VALUES        = ['left', 'right'];

// Convert Gdk.RGBA to hex string (#rrggbb)
function _rgbaToHex(rgba) {
    const r = Math.round(rgba.red   * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgba.green * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgba.blue  * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

// Build an ActionRow with a ColorButton suffix bound to a GSettings string key
function _makeColorRow(title, subtitle, settingKey, settings) {
    const row = new Adw.ActionRow({title, subtitle});

    const button = new Gtk.ColorButton({
        valign: Gtk.Align.CENTER,
        use_alpha: false,
    });

    const rgba = new Gdk.RGBA();
    rgba.parse(settings.get_string(settingKey));
    button.set_rgba(rgba);

    button.connect('color-set', () => {
        settings.set_string(settingKey, _rgbaToHex(button.get_rgba()));
    });
    settings.connect(`changed::${settingKey}`, () => {
        const updated = new Gdk.RGBA();
        updated.parse(settings.get_string(settingKey));
        button.set_rgba(updated);
    });

    row.add_suffix(button);
    return row;
}

export default class LatencyPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        // ── Display group ───────────────────────────────────────────────────
        const displayGroup = new Adw.PreferencesGroup({title: _('Display')});
        page.add(displayGroup);

        const latencyLabel = new Adw.SwitchRow({
            title: _('Show "Latency" Label'),
            subtitle: _('Display the word "Latency:" before the ping value'),
        });
        displayGroup.add(latencyLabel);
        settings.bind('show-latency-label', latencyLabel, 'active', Gio.SettingsBindFlags.DEFAULT);

        const positionRow = new Adw.ComboRow({
            title: _('Panel Position'),
            subtitle: _('Where to show the indicator in the panel'),
            model: new Gtk.StringList({strings: [_('Left'), _('Right')]}),
        });
        positionRow.selected = Math.max(0, POSITION_VALUES.indexOf(
            settings.get_string('latency-position')
        ));
        positionRow.connect('notify::selected', () => {
            settings.set_string('latency-position', POSITION_VALUES[positionRow.selected]);
        });
        settings.connect('changed::latency-position', () => {
            positionRow.selected = Math.max(0, POSITION_VALUES.indexOf(
                settings.get_string('latency-position')
            ));
        });
        displayGroup.add(positionRow);

        // ── Connection group ────────────────────────────────────────────────
        const connectionGroup = new Adw.PreferencesGroup({title: _('Connection')});
        page.add(connectionGroup);

        const ipWan = new Adw.EntryRow({
            title: _('IP WAN Address'),
            text: settings.get_string('latency-ip-wan') || DEFAULT_WAN_IP,
        });
        connectionGroup.add(ipWan);
        settings.bind('latency-ip-wan', ipWan, 'text', Gio.SettingsBindFlags.DEFAULT);

        const resolveDomain = new Adw.EntryRow({
            title: _('Resolve Domain'),
            text: settings.get_string('latency-resolve-domain') || DEFAULT_RESOLVE_DOMAIN,
        });
        connectionGroup.add(resolveDomain);
        settings.bind('latency-resolve-domain', resolveDomain, 'text', Gio.SettingsBindFlags.DEFAULT);

        const refreshIntervalRow = new Adw.SpinRow({
            title: _('Refresh Interval (s)'),
            subtitle: _('How often to run the ping check'),
            adjustment: new Gtk.Adjustment({
                lower: 1, upper: 3600, step_increment: 1, page_increment: 5,
            }),
        });
        refreshIntervalRow.value = settings.get_int('latency-refresh-interval');
        refreshIntervalRow.connect('notify::value', () => {
            settings.set_int('latency-refresh-interval', refreshIntervalRow.value);
        });
        settings.connect('changed::latency-refresh-interval', () => {
            refreshIntervalRow.value = settings.get_int('latency-refresh-interval');
        });
        connectionGroup.add(refreshIntervalRow);

        // ── Thresholds group ────────────────────────────────────────────────
        const thresholdGroup = new Adw.PreferencesGroup({
            title: _('Color Thresholds'),
            description: _('Latency is shown in green below warning, yellow below critical, red above critical'),
        });
        page.add(thresholdGroup);

        const warningRow = new Adw.SpinRow({
            title: _('Warning threshold (ms)'),
            subtitle: _('Above this value the indicator turns the warning color'),
            adjustment: new Gtk.Adjustment({
                lower: 1, upper: 10000, step_increment: 10, page_increment: 50,
            }),
        });
        warningRow.value = settings.get_int('latency-threshold-warning');
        warningRow.connect('notify::value', () => {
            settings.set_int('latency-threshold-warning', warningRow.value);
        });
        settings.connect('changed::latency-threshold-warning', () => {
            warningRow.value = settings.get_int('latency-threshold-warning');
        });
        thresholdGroup.add(warningRow);

        const criticalRow = new Adw.SpinRow({
            title: _('Critical threshold (ms)'),
            subtitle: _('Above this value the indicator turns the critical color'),
            adjustment: new Gtk.Adjustment({
                lower: 1, upper: 10000, step_increment: 10, page_increment: 50,
            }),
        });
        criticalRow.value = settings.get_int('latency-threshold-critical');
        criticalRow.connect('notify::value', () => {
            settings.set_int('latency-threshold-critical', criticalRow.value);
        });
        settings.connect('changed::latency-threshold-critical', () => {
            criticalRow.value = settings.get_int('latency-threshold-critical');
        });
        thresholdGroup.add(criticalRow);

        // ── Colors group ────────────────────────────────────────────────────
        const colorGroup = new Adw.PreferencesGroup({title: _('Colors')});
        page.add(colorGroup);

        colorGroup.add(_makeColorRow(
            _('Normal color'), _('Shown when latency is below the warning threshold'),
            'latency-color-ok', settings
        ));
        colorGroup.add(_makeColorRow(
            _('Warning color'), _('Shown when latency is between warning and critical thresholds'),
            'latency-color-warning', settings
        ));
        colorGroup.add(_makeColorRow(
            _('Critical color'), _('Shown when latency is above the critical threshold'),
            'latency-color-critical', settings
        ));
    }
}
