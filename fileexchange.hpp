#pragma once

#include <string>
#include <array>
#include <vector>
#include <chrono>
#include <unistd.h>
#include <libconfig.h++>
#include "types.hpp"
#include "events.hpp"


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
