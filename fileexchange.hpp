#pragma once

#include <string>
#include <array>
#include <vector>
#include <chrono>
#include <libconfig.h++>
#include "types.hpp"
#include "events.hpp"


class ConfigManager {
public:
    ConfigManager(const std::string& filepath);

    const std::array<RelayConfig, 8>& getRelayConfig() const;
    const std::chrono::seconds& getButtonIrrTime() const;
    const std::vector<scheduledEvent>& getScheduledEvents() const;
    
    void setRelayConfig(const std::array<RelayConfig, 8>& relay_config);
    void setButtonIrrTime(const std::chrono::seconds& irrigation_time);
    void setScheduledEvents(const std::vector<scheduledEvent>& scheduled_events);

    bool writeConfig();

private:
    void loadConfig();
    void read();
    void store();

    void updateRelayConfig();
    void updateButtonIrrTime();
    void updateScheduledEvents();

    const std::string path;

    libconfig::Config cfg;

    std::array<RelayConfig, 8> relayConfig;
    std::chrono::seconds buttonIrrTime;
    std::vector<scheduledEvent> scheduledEvents;
};
