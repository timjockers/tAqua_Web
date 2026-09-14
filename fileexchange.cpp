#include "fileexchange.hpp"

#include <iostream>
#include <cstddef>
using namespace libconfig;
using namespace std;


ConfigManager::ConfigManager(const string& filepath)
    : path(filepath)
{
    relayConfig = {RelayConfig::UNUSED};

    loadConfig();
}

void ConfigManager::loadConfig()
{
    read();
    store();
}

void ConfigManager::read()
{
    try
    {
        cfg.readFile(path.c_str());
    }
    catch(const FileIOException &fioex)
    {
        cerr << "I/O error while reading file." << endl;
    }
    catch(const ParseException &pex)
    {
        cerr << "Parse error at " << pex.getFile() << ":" << pex.getLine()
                << " - " << pex.getError() << std::endl;
    }
}

void ConfigManager::store()
{
    try
    {
        const Setting& r = cfg.lookup("relayConfig");

        if (r.getLength() != static_cast<int>(relayConfig.size()))
        {
            cerr << "Length of relayConfig is not "
                      << relayConfig.size()
                      << endl;
            return;
        }

        for (size_t i = 0; i < relayConfig.size(); ++i)
        {
            relayConfig[i] = static_cast<RelayConfig>(
                static_cast<int>(r[i])
            );
        }
    }
    catch (const SettingNotFoundException&)
    {
        cerr << "Error: relayConfig could not be found." << endl;
    }

    try
    {
        int value = 0;
        cfg.lookupValue("buttonIrrigationTime", value);
        buttonIrrTime = chrono::seconds(value);
    }
    catch (const SettingNotFoundException&)
    {
        cerr << "Error: buttonIrrigationTime could not be found." << endl;
    }
    catch (const SettingTypeException&)
    {
        cerr << "Error: buttonIrrigationTime is not an integer." << endl;
    }

    try
    {   
        scheduledEvents.clear();

        const Setting& scheduled = cfg.lookup("scheduled");

        for (size_t i = 0; i < scheduled.getLength(); ++i)
        {
            const Setting& item = scheduled[i];

            int relay = 0;
            int duration = 0;

            item.lookupValue("relay", relay);
            item.lookupValue("duration", duration);

            const Setting& start = item.lookup("start");
            int weekday = start[0];
            int minutes = start[1];

            scheduledEvents.push_back({
                static_cast<Relay>(relay),
                std::chrono::seconds(duration),
                static_cast<Weekday>(weekday),
                std::chrono::minutes(minutes)
            });
        }
    }
    catch (const SettingNotFoundException&)
    {
        cerr << "Error reading schedule" << endl;
    }
}

const array<RelayConfig, 8>& ConfigManager::getRelayConfig()
{
    return relayConfig;
}

const chrono::seconds& ConfigManager::getButtonIrrTime()
{
    return buttonIrrTime;
}

const vector<scheduledEvent>& ConfigManager::getScheduledEvents()
{
    return scheduledEvents;
}

void ConfigManager::setRelayConfig(const array<RelayConfig, 8>& relay_config)
{
    relayConfig = relay_config;
}
