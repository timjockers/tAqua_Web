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

### Relay Configuration

Each of the eight relays can be configured through the web interface.

The available relay types are:

* **Unused**
* **Valve**
* **Permanent Power**

These relay types correspond to the functionality implemented by `tAqua_Daemon`.

The configuration is stored in `taqua.cfg`.

### Irrigation Scheduling

For each relay configured as a valve, irrigation events can be defined.

A scheduled irrigation event is defined in `taqua.cfg` as follows:

* Relay
* Start (Weekday and start time)
* Irrigation duration
* Conditions under which the event should be executed (e.g., weather conditions)

Multiple irrigation events can be configured for different days and valves.

## Events

Irrigation is handled by the event queue of `tAqua_Daemon`.

The web interface can be used to create manual irrigation events in addition to the automatically scheduled events.

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

## Status

The web interface is intended to provide a live overview of the current state of the irrigation controller.

This should include information corresponding to the hardware status LEDs, such as:

* Which relays are currently active
* Which valves are currently being irrigated
* Which irrigation events are scheduled or approaching

The exact presentation of this information has not yet been defined. The goal is to provide a clear overview without simply reproducing the physical LED indicators of the controller.

## Upcoming Irrigation Events

The web interface is intended to display upcoming irrigation events.

This allows users to see when the next irrigation events are expected to start and which valves will be activated.

The exact layout and amount of information shown are still under development.

## Irrigation Log

A log is planned to provide information about recent irrigation events.

This can be used to see, for example, which valves were irrigated recently and when an irrigation event was executed.

The exact contents and storage of the log are not yet finalized.

## Weather Conditions

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

The exact implementation and project structure are still under development.

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
git clone https://github.com/timjockers/tAqua_Web
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

### 4. Start the web server

After successful compilation, the web server can be started manually with:

```text
./_web
```
It is recommended to start `tAqua_Web` automatically when the Raspberry Pi boots, just like `tAqua_Daemon`. Run the following commands to set this up:

```text
Add instructions here
```

## Remote Access

Remote access is planned for a future release. One possible approach is
to use a Cloudflare Tunnel to provide secure access to the web interface
without directly exposing the Raspberry Pi to the Internet.

The exact implementation and authentication concept have not yet been
finalized.

## Development Status

`tAqua_Web` is currently **under development**.

The web component is planned as the corresponding user interface for the daemon and the overall tAqua system.

The architecture, configuration format, web interface, event handling and individual features may change during development.

Some features described in this README are therefore planned functionality rather than currently implemented functionality.

## Planned Features

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
