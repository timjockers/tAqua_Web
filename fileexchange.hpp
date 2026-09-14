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

    const std::array<RelayConfig, 8>& getRelayConfig();
    const std::chrono::seconds& getButtonIrrTime();
    const std::vector<scheduledEvent>& getScheduledEvents();
    
    void setRelayConfig(const std::array<RelayConfig, 8>& relay_config);

private:
    void loadConfig();
    void read();
    void store();

    const std::string path;

    libconfig::Config cfg;

    std::array<RelayConfig, 8> relayConfig;
    std::chrono::seconds buttonIrrTime;
    std::vector<scheduledEvent> scheduledEvents;
};
