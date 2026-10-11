# tAqua_Web

`tAqua_Web` is a component of the [**tAqua** project](https://timjockers.github.io/tAqua/), an automated irrigation controller.

The overall project consists of several components. While **tAqua_Daemon** is responsible for hardware control and execution of the irrigation logic, **tAqua_Web** provides the web interface for configuring and operating the irrigation controller.

The web interface is designed to run directly on the same Raspberry Pi as `tAqua_Daemon`.

## Architecture

The tAqua project is divided into two main components:

```text
┌─────────────────────┐
│     tAqua_Web       │
│                     │
│ Web interface       │
│ Configuration       │
│ Status              │
│ Manual operation    │
└──────────┬──────────┘
           │
           │ writes
           ▼
      ┌───────────┐
      │ taqua.cfg │
      └─────┬─────┘
            │
            │ reads
            ▼
┌─────────────────────┐
│   tAqua_Daemon      │
│                     │
│ Configuration       │
│ Scheduling          │
│ Event Queue         │
│ Hardware control    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ Raspberry Pi 1 Model B+     │
│                             │
│  Relay 1 ───┐               │
│  Relay 2 ───┤               │
│  Relay 3 ───┤               │
│  ...        ├─ Hardware     │
│  Relay 8 ───┘               │
└─────────────────────────────┘
```

`tAqua_Web` and `tAqua_Daemon` are separate programs. The web interface does not directly control the relay hardware. Instead, configuration changes are stored in the shared `taqua.cfg` configuration file.

When the configuration is changed, the daemon can be notified by a signal and reloads the configuration.

This separation keeps the web interface independent from the hardware
control logic.

## Web Interface

`tAqua_Web` is intended to provide a central interface for configuring and monitoring the irrigation controller.

The exact design of the web interface is still under development. The following functionality is planned or currently being considered.

The exact design of the web interface has already been determined, but not all functions are implemented in the first version.

### Relay Configuration

Each of the eight relays can be configured through the web interface.

The available relay types are:

* **Unused**
* **Valve**
* **Permanent Power**

These relay types correspond to the functionality implemented by `tAqua_Daemon`.

### Button irrigation time

In the web interface, you can configure the irrigation time when a button is pressed.

### Irrigation Scheduling

For each relay configured as a valve, irrigation events can be defined.

A scheduled irrigation event is defined in `taqua.cfg` as follows:

* Relay
* Start (Weekday(s) and start time)
* Irrigation duration

Multiple irrigation events can be configured for different days and valves.

## Events

Irrigation is handled by the event queue of `tAqua_Daemon`.

The web interface can be used to create manual irrigation events in addition to the automatically scheduled events. (not implemented yet)

For example:

```text
Web interface
      │
      │ manual irrigation
      ▼
  Event Queue
      │
      ▼
tAqua_Daemon
      │
      ▼
   Valve ON
```

This means that manual operation through the web interface uses the same event-based system as scheduled irrigation.

In the future, the web interface is also intended to provide functionality for cancelling or stopping events. The exact behavior of event cancellation, especially for events that are already being executed, is still being developed.

## Status (not implemented yet)

The web interface is intended to provide a live overview of the current state of the irrigation controller.

This should include information corresponding to the hardware status LEDs, such as:

* Which relays are currently active
* Which valves are currently being irrigated
* Which irrigation events are scheduled or approaching

The exact presentation of this information has not yet been defined. The goal is to provide a clear overview without simply reproducing the physical LED indicators of the controller.

## Irrigation Log (not implemented yet)

A log is planned to provide information about recent irrigation events.

This can be used to see, for example, which valves were irrigated recently and when an irrigation event was executed.

The exact contents and storage of the log are not yet finalized.

## Weather Conditions (not implemented yet)

One of the planned features of tAqua is weather-dependent irrigation.

The long-term goal is to retrieve weather data from an external service and use it when deciding whether a scheduled irrigation event should be executed.

An initial approach is to consider both recent and forecast precipitation.

For example, a future irrigation event could be executed only if:

```text
Rainfall during the previous 12 hours
+
Expected rainfall during the next 12 hours
```

is below a configured threshold.

If sufficient rainfall has already occurred or is expected, the irrigation event could be skipped for that day.

The exact thresholds, weather service, data source and conditions are still under development and may change.

Possible future weather-related features include:

* Taking recent rainfall into account
* Taking forecast rainfall into account
* Skipping irrigation when sufficient rain has occurred or is expected
* Adjusting irrigation duration based on weather conditions
* Adding further weather-dependent conditions

## Configuration

`tAqua_Web` modifies the configuration file:

```text
taqua.cfg
```

The configuration file uses **libconfig**.

The same configuration file is used by `tAqua_Daemon`, which reads the settings and applies them to the irrigation controller.
The configuration file is located in the `tAqua_Daemon` directory. For `tAqua_Web` to access the configuration file, the directory structure must look like this:

```text
~/taqua/
├── tAqua_Daemon/
│   ├── _daemon
│   ├── taqua.cfg
│   └── taqua.pid
└── tAqua_Web/
    └── _web
```

For more information about the exact syntax and structure of the configuration file, [see the **tAqua_Daemon** repository](https://github.com/timjockers/tAqua_Daemon).
## Technology

`tAqua_Web` is planned as a lightweight web application running directly on the Raspberry Pi.

The project uses:

* **C++**
* **cpp-httplib** (`httplib.h`)
* **HTML**
* **CSS**
* **JavaScript**
* **libconfig**

The web server is implemented in C++ using `httplib.h`.

## Installation

`tAqua_Web` is designed to run on the same Raspberry Pi as `tAqua_Daemon`.

The project is written in **C++** and uses **CMake** as its build system.

### Directory Structure

`tAqua_Web` expects certain files, such as `taqua.cfg` and `taqua.pid`, to be located in the `tAqua_Daemon` directory. Therefore, both projects must be cloned into the same parent directory.

The resulting directory structure should look like this:

```text
~/taqua/
├── tAqua_Daemon/
│   ├── _daemon
│   ├── taqua.cfg
│   └── taqua.pid
└── tAqua_Web/
    └── _web
```

### Build Order

It is recommended to build and configure `tAqua_Daemon` before building `tAqua_Web`.

For detailed instructions on installing and building `tAqua_Daemon`, see the [tAqua_Daemon installation guide](https://github.com/timjockers/tAqua_Daemon/blob/main/README.md#installation).

### 1. Install additional required packages
```text
sudo apt update
sudo apt upgrade
sudo apt install nlohmann-json3-dev
```

### 2. Clone the repository
After installing `tAqua_Daemon`, the directory `~/taqua/` should already exist. Change to this directory:

```text
cd ~/taqua/
```

Then clone the `tAqua_Web` Git repository:

```text
git clone --branch v1.0 --depth 1 https://github.com/timjockers/tAqua_Web
```

The directory `tAqua_Web/` should have been created automatically.

### 3. Build the project using CMake
Configure the project using the included `CMakeLists.txt`. Run the following commands in the `~/taqua/tAqua_Web/` directory:

```text
cd tAqua_Web
cmake .
```

Then compile the project:

```text
make
```

### 5. Start the web server
After successful compilation, the web server can be started manually with:

```text
sudo ./_web
```

It is recommended to start `tAqua_Web` automatically when the Raspberry Pi boots, just like `tAqua_Daemon`. We use a **systemd service** for this purpose.
This service is configured to automatically wait until tAqua_Daemon is fully up and running before it attempts to start.

Create a new service file for tAqua_Web:
```bash
cd /etc/systemd/system/
sudo nano taqua_w.service
```

Paste the following lines into the file:
```text
[Unit]
Description=tAqua Web Service
Requires=taqua_d.service
After=network.target taqua_d.service

[Service]
Type=simple
ExecStart=/home/YOUR_USERNAME/taqua/tAqua_Web/_web
WorkingDirectory=/home/YOUR_USERNAME/taqua/tAqua_Web/
User=root
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```
**Important:** Just like in tAqua_Daemon, replace YOUR_USERNAME in the file with your actual Raspberry Pi username so the paths are correct.

Save and close the file (in nano, press `Ctrl+O`, `Enter`, then `Ctrl+X`).

Finally, run the following commands to reload systemd, enable the autostart for the web service, and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable taqua_w.service
sudo systemctl start taqua_w.service
```

## Remote Access

Remote access is planned for a future release. One possible approach is
to use a Cloudflare Tunnel to provide secure access to the web interface
without directly exposing the Raspberry Pi to the Internet.

The exact implementation and authentication concept have not yet been
finalized.

## Development Status

`tAqua_Web` is currently **under development**.

A first release is already available.

Some features described in this README are therefore planned functionality rather than currently implemented functionality.

## Planned Features - Summary

Possible future features include:

* Web-based relay configuration
* Configuration of irrigation schedules
* Manual irrigation through the web interface
* Live system status
* Overview of upcoming irrigation events
* Irrigation history and logging
* Event cancellation
* Stopping currently running irrigation events
* Weather-dependent irrigation
* Rainfall-based irrigation conditions
* Remote access through a secure tunnel
* Authentication and access control

The exact implementation of these features has not yet been decided.

## Related Projects

### tAqua_Daemon

`tAqua_Daemon` is responsible for the actual hardware control and execution of the irrigation logic.

It handles scheduling, the event queue, buttons, LEDs and the eight relay outputs.

The daemon reads the configuration generated by `tAqua_Web` from `taqua.cfg`.

The repository is available at:

[https://github.com/timjockers/tAqua_Daemon](https://github.com/timjockers/tAqua_Daemon)
