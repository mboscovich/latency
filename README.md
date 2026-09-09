# Latency - GNOME Shell Extension

A GNOME Shell extension that displays internet latency (ping) in the top panel. It also detects when the internet connection is lost or when there is a DNS problem.

## Screenshots

![Panel indicator showing latency in the top bar](screenshots/screenshot-1.png)

![Preferences window with all available settings](screenshots/screenshot-2.png)

## Features

- Real-time latency display in the top panel (configurable refresh interval, default 5 seconds)
- Color-coded indicator based on configurable thresholds (green / yellow / red)
- Customizable colors for each state (normal, warning, critical)
- Configurable panel position (left or right)
- Configurable "Latency:" label (can be hidden to show only the ping value)
- Automatic detection of connection loss
- DNS problem detection
- Quick access to preferences by clicking the indicator
- Customizable ping target IP and DNS resolve domain

## GNOME Shell version support

| GNOME version | Supported |
|---|---|
| 45, 46, 47, 48, 49, 50 | Yes |

## Prerequisites

Before building and installing this extension, make sure you have the following installed:

- GNOME Shell 45 or later
- `glib-compile-schemas` (part of `glib2-devel` or `libglib2.0-dev`)
- `make`
- `ping`
- `host` (for DNS checking)

### Installing prerequisites

**Ubuntu/Debian:**
```bash
sudo apt install libglib2.0-dev make iputils-ping bind9-host
```

**Fedora/RHEL:**
```bash
sudo dnf install glib2-devel make iputils bind-utils
```

**Arch Linux:**
```bash
sudo pacman -S glib2 make iputils bind
```

## Building and installing

```bash
git clone https://github.com/mboscovich/latency.git
cd latency
make install
```

This copies the extension into `~/.local/share/gnome-shell/extensions/`.

After installing:

1. **Restart GNOME Shell:**
   - X11: `Alt + F2` → type `r` → Enter
   - Wayland: log out and log back in

2. **Enable the extension:**
```bash
gnome-extensions enable latency@mboscovich.github.io
```

## Configuration

Click the indicator in the panel to open a menu, then select **Preferences**.

Alternatively:
- Open the GNOME Extensions app and click the settings icon for Latency
- Or run: `gnome-extensions prefs latency@mboscovich.github.io`

### Display

| Setting | Description |
|---|---|
| Show "Latency" Label | Toggle the `Latency:` prefix before the ping value |
| Panel Position | Place the indicator on the **Left** or **Right** side of the panel |

### Connection

| Setting | Default | Description |
|---|---|---|
| IP WAN Address | `8.8.8.8` | IP used for the ping check |
| Resolve Domain | `google.com` | Domain used for the DNS check |
| Refresh Interval | `5` s | How often to run the ping check (1–3600 seconds) |

### Color thresholds

| Setting | Default | Description |
|---|---|---|
| Warning threshold | `100` ms | Above this value the indicator turns the warning color |
| Critical threshold | `300` ms | Above this value the indicator turns the critical color |

### Colors

| Setting | Default | Description |
|---|---|---|
| Normal color | White | Latency is below the warning threshold |
| Warning color | Yellow | Latency is between warning and critical thresholds |
| Critical color | Red | Latency is above the critical threshold |

When the connection is lost or there is a DNS problem, the indicator reverts to the default panel text color.

## Usage

Once installed and enabled, the extension shows in the panel and updates at the configured interval (default 5 seconds):

| Display | Meaning |
|---|---|
| `29.4ms` | Current latency (colored based on thresholds) |
| `Latency: 29.4ms` | Same, with label prefix enabled |
| `[ No internet connection ]` | Ping failed |
| `[ DNS Problem ]` | Ping succeeded but DNS resolution failed |

## Makefile targets

| Target | Description |
|---|---|
| `make build` | Compile schemas and prepare the extension |
| `make install` | Install the extension locally |
| `make uninstall` | Remove the extension |
| `make zip` | Build ZIP for extensions.gnome.org |
| `make clean` | Remove build artifacts and ZIPs |
| `make check-deps` | Verify all required tools are installed |

## Troubleshooting

**Schema error on startup:**
```bash
glib-compile-schemas schemas/
```

**Permission denied on ping script:**
```bash
chmod +x show-ping-time.sh
```

**Extension not appearing after install:**
1. Restart GNOME Shell (see above)
2. Check it is enabled: `gnome-extensions list --enabled`
3. Check for errors: `journalctl -f -o cat /usr/bin/gnome-shell`

## License

GNU General Public License v2.0 or later. See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. Feel free to open a Pull Request or an issue.
