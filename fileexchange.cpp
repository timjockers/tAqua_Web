#include "fileexchange.hpp"

#include <iostream>
using namespace libconfig;
using namespace std;


ConfigManager::ConfigManager(const string& filepath)
    : path(filepath)
{
}

bool ConfigManager::write()
{
    Setting &root = cfg.getRoot();

    if (relayConfigChanged)
    {
        relayConfigChanged = false;

        if (root.exists("relayConfig"))
        {
            root.remove("relayConfig");
        }

        Setting &relayConfSetting = root.add("relayConfig", Setting::TypeList);
        for (const RelayConfig& rc : relayConfig) {
            int intRC = static_cast<int>(rc);
            
            Setting &rcElement = relayConfSetting.add(Setting::TypeInt);
            rcElement = intRC;
        }
    }

    try {
        cfg.writeFile(path.c_str());
        return true;
    } 
    catch(const FileIOException &fioex) {
        cerr << "Error writing taqua.cfg!" << endl;
        return false;
    }
}

void ConfigManager::setRelayConfig(const array<RelayConfig, 8>& config) {
    relayConfig = config;
    relayConfigChanged = true;
}
