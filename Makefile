# Makefile for GNOME Shell Latency Extension

# Extension metadata
EXTENSION_UUID = latency@mboscovich.github.io
EXTENSION_NAME = latency

# Directories
SCHEMAS_DIR = schemas
INSTALL_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_UUID)
DIST_DIR    = dist

# Common files shared across all versions
COMMON_FILES = extension.js prefs.js show-ping-time.sh LICENSE README.md
SCHEMA_FILES = $(SCHEMAS_DIR)/org.gnome.shell.extensions.latency.gschema.xml
COMPILED_SCHEMA = $(SCHEMAS_DIR)/gschemas.compiled

.PHONY: help build install uninstall clean check-deps check zip

# Default target
all: build

help:
	@echo "Available targets:"
	@echo "  build        - Compile schemas and prepare the extension"
	@echo "  install      - Install the extension locally"
	@echo "  uninstall    - Remove the extension"
	@echo "  zip          - Build ZIP for extensions.gnome.org (GNOME 45+)"
	@echo "  clean        - Clean build artifacts"
	@echo "  check-deps   - Check required dependencies"
	@echo "  check        - Check extension structure"
	@echo "  help         - Show this help message"

build: $(COMPILED_SCHEMA)
	@echo "Building extension..."
	@chmod +x show-ping-time.sh
	@echo "Extension built successfully!"

$(COMPILED_SCHEMA): $(SCHEMA_FILES)
	@echo "Compiling GSettings schemas..."
	@glib-compile-schemas $(SCHEMAS_DIR)/
	@echo "Schemas compiled successfully!"

# ─── Local install ────────────────────────────────────────────────────────────

install: build
	@echo "Installing extension to $(INSTALL_DIR)..."
	@mkdir -p $(INSTALL_DIR)/$(SCHEMAS_DIR)
	@cp $(COMMON_FILES) $(INSTALL_DIR)/
	@cp metadata.json $(INSTALL_DIR)/
	@cp $(SCHEMA_FILES) $(INSTALL_DIR)/$(SCHEMAS_DIR)/
	@cp $(COMPILED_SCHEMA) $(INSTALL_DIR)/$(SCHEMAS_DIR)/
	@echo "Extension installed successfully!"
	@echo ""
	@echo "To enable the extension:"
	@echo "1. Restart GNOME Shell (Alt+F2, type 'r', press Enter on X11)"
	@echo "2. Enable the extension: gnome-extensions enable $(EXTENSION_UUID)"

uninstall:
	@echo "Uninstalling extension..."
	@if [ -d "$(INSTALL_DIR)" ]; then \
		rm -rf "$(INSTALL_DIR)"; \
		echo "Extension uninstalled successfully!"; \
	else \
		echo "Extension not found in $(INSTALL_DIR)"; \
	fi

# ─── Distribution ZIP for extensions.gnome.org ──────────────────────────────

zip: build
	@echo "Building ZIP..."
	@rm -rf $(DIST_DIR)/latency && mkdir -p $(DIST_DIR)/latency/$(SCHEMAS_DIR)
	@cp $(COMMON_FILES)    $(DIST_DIR)/latency/
	@cp metadata.json      $(DIST_DIR)/latency/
	@cp $(SCHEMA_FILES)    $(DIST_DIR)/latency/$(SCHEMAS_DIR)/
	@cp $(COMPILED_SCHEMA) $(DIST_DIR)/latency/$(SCHEMAS_DIR)/
	@cd $(DIST_DIR)/latency && zip -r ../../latency.zip . -x "*.DS_Store"
	@rm -rf $(DIST_DIR)/latency
	@echo "Created latency.zip"

# ─── Utilities ───────────────────────────────────────────────────────────────

clean:
	@echo "Cleaning build artifacts..."
	@rm -f $(COMPILED_SCHEMA)
	@rm -rf $(DIST_DIR)
	@rm -f latency.zip
	@echo "Clean completed!"

check-deps:
	@echo "Checking dependencies..."
	@command -v glib-compile-schemas >/dev/null 2>&1 || { echo "Error: glib-compile-schemas not found. Install: sudo apt install libglib2.0-dev"; exit 1; }
	@command -v ping >/dev/null 2>&1 || { echo "Error: ping not found. Install: sudo apt install iputils-ping"; exit 1; }
	@command -v host >/dev/null 2>&1 || { echo "Error: host not found. Install: sudo apt install bind9-host"; exit 1; }
	@echo "All dependencies are available!"

check:
	@echo "Checking extension structure..."
	@for file in $(COMMON_FILES) metadata.json; do \
		if [ ! -f "$$file" ]; then \
			echo "Warning: $$file not found"; \
		fi; \
	done
	@for file in $(SCHEMA_FILES); do \
		if [ ! -f "$$file" ]; then \
			echo "Error: $$file not found"; \
			exit 1; \
		fi; \
	done
	@echo "Extension structure check completed!"
