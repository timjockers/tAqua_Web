#pragma once

#include <string>
#include <array>
#include <vector>
#include <chrono>
#include <libconfig.h++>
#include "types.hpp"


class ConfigManager {
public:
    ConfigManager(const std::string& filepath);

    
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
