#pragma once

#include <string>
#include <libconfig.h++>


class ConfigManager {
public:
    ConfigManager(const std::string& filepath);

    void write();
    
private:
    const std::string path;

    libconfig::Config cfg;
};