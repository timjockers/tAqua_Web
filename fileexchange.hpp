#pragma once

#include <string>
#include <array>
#include <libconfig.h++>
#include "types.hpp"


class ConfigManager {
public:
    ConfigManager(const std::string& filepath);

    void read();
    bool write();

    void setRelayConfig(const std::array<RelayConfig, 8>& config);

private:
    const std::string path;

    libconfig::Config cfg;

    std::array<RelayConfig, 8> relayConfig{RelayConfig::UNUSED};
    bool relayConfigChanged{false};
};