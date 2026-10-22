#pragma once

#include <string>
#include <array>
#include <vector>
#include <chrono>
#include <condition_variable>
#include <cstdint>
#include <mutex>
#include <unistd.h>
#include <libconfig.h++>
#include <sys/types.h>
#include "types.hpp"
#include "events.hpp"

std::string readFile(const std::string& filepath);


class ConfigManager {
public:
    ConfigManager(const std::string& taqua_cfg_path, const std::string& taqua_pid_path);

    const std::array<RelayConfig, 8>& getRelayConfig() const;
    const std::chrono::seconds& getButtonIrrTime() const;
    const std::vector<scheduledEvent>& getScheduledEvents() const;

    void setRelayConfig(const std::array<RelayConfig, 8>& relay_config);
    void setRelayConfigR(const Relay& relay, const RelayConfig& relay_config);
    void setButtonIrrTime(const std::chrono::seconds& irrigation_time);
    void setScheduledEvents(const std::vector<scheduledEvent>& scheduled_events);

    bool writeConfig();

    void notifyWebPIDReady();

private:
    bool readDaemonPID();
    bool notifyDaemonConfigChanged();
    pid_t daemon_pid;
    bool daemon_pid_loaded;

    void loadConfig();
    void read();
    void store();

    void updateRelayConfig();
    void updateButtonIrrTime();
    void updateScheduledEvents();

    const std::string path;
    const std::string pid_path;

    libconfig::Config cfg;

    std::array<RelayConfig, 8> relayConfig;
    std::chrono::seconds buttonIrrTime;
    std::vector<scheduledEvent> scheduledEvents;
};

class StatusManager {
public:
    struct Snapshot {
        std::array<StatusIndicator, 8> status;
        std::uint64_t version;
    };

    StatusManager(const std::string& filepath);

    void updateStatus();
    Snapshot getSnapshot() const;
    Snapshot waitForChange(std::uint64_t version, std::chrono::milliseconds timeout) const;

private:
    void read();
    void store();

    const std::string path;

    libconfig::Config cfg;

    std::array<StatusIndicator, 8> irrigationStatus;
    mutable std::mutex statusMutex;
    mutable std::condition_variable statusChanged;
    std::uint64_t statusVersion = 0;
};
