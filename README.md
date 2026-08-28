# tAqua_Web

`tAqua_Web` is a component of the **tAqua** project, an automated irrigation controller.

The overall project consists of several components. While **tAqua_Daemon** is responsible for hardware control and execution of the irrigation logic, **tAqua_Web** provides the web interface for configuring and operating the irrigation controller.

The web interface is intended to run directly on the same Raspberry Pi as `tAqua_Daemon`.

## Architecture

The project is divided into two main components:

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

This keeps the web interface and the hardware control logic separated.

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

For each relay configured as a valve, irrigation times can be configured.

A scheduled irrigation event can contain information such as:

* Day of the week
* Start time
* Irrigation duration
* Conditions under which the event should be executed

Multiple irrigation times can be configured for different days and valves.

The exact configuration options and scheduling behaviour are still subject to change during development.

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

In the future, the web interface is also intended to provide functionality for cancelling or stopping events. The exact behaviour of event cancellation, especially for events that are already being executed, is still being developed.

## Status

The web interface is intended to provide a live overview of the current state of the irrigation controller.

This should include information corresponding to the hardware status LEDs, such as:

* Which relays are currently active
* Which valves are currently being irrigated
* Which irrigation events are scheduled or approaching

The exact presentation of this information has not yet been defined. The goal is to provide a clear overview without simply reproducing the physical LED indicators of the controller.

## Upcoming Irrigation

The web interface is intended to display upcoming irrigation events.

This allows users to see when the next irrigation events are expected to start and which valves will be activated.

The exact layout and amount of information shown are still under development.

## Irrigation Log

A log is planned to provide information about recent irrigation events.

This can be used to see, for example, which valves were irrigated recently and when an irrigation event was executed.

The exact contents and storage of the log are not yet finalized.

## Weather Conditions

One of the planned features of tAqua is weather-dependent irrigation.

The long-term goal is to retrieve weather information from the Internet and use it when deciding whether a scheduled irrigation event should be executed.

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

`tAqua_Web` creates and modifies the configuration file:

```text
taqua.cfg
```

The configuration file uses **libconfig**.

The same configuration file is used by `tAqua_Daemon`, which reads the settings and applies them to the irrigation controller.

The exact syntax and structure of the configuration file can be found in the example configuration included in the project repositories.

For more information about the configuration and how it is processed, see the **tAqua_Daemon** repository.

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

`tAqua_Web` is intended to run on the same Raspberry Pi as `tAqua_Daemon`.

The repository can be cloned to a suitable directory on the Raspberry Pi.

The exact build and installation procedure has not yet been finalized because development of the web component has not started yet.

A future installation will likely follow the general approach used by `tAqua_Daemon`.

## Remote Access

A future goal is to make the irrigation controller accessible outside the local network.

One possible approach is to use a **Cloudflare Tunnel** to expose the web interface without directly exposing the Raspberry Pi to the Internet.

The exact remote-access and authentication concept has not yet been finalized.

The intended goal is to allow the irrigation controller to be monitored and operated remotely while keeping access to the system protected.

## Development Status

`tAqua_Web` is currently **under development**.

At the moment, development is focused primarily on **tAqua_Daemon**. The web component is planned as the corresponding user interface for the daemon and the overall tAqua system.

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

### tAqua_Web

This repository contains the web interface for the tAqua irrigation controller.

The web interface is intended to provide configuration, monitoring and manual operation of the irrigation system.

The project is currently in an early stage of development.
