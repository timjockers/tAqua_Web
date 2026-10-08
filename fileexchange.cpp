#include "fileexchange.hpp"

#include <iostream>
#include <cstddef>
#include <fstream>
#include <stdexcept>
#include <csignal>
using namespace libconfig;
using namespace std;


ConfigManager::ConfigManager(const string& taqua_cfg_path, const string& taqua_pid_path)
    : path(taqua_cfg_path), pid_path(taqua_pid_path)
{
    relayConfig = {RelayConfig::UNUSED};

    loadConfig();

    daemon_pid_loaded = readDaemonPID();
    if (!daemon_pid_loaded)
    {
        cout << "WARNING: Could not find taqua.pid in " << pid_path
             << ". Please start the daemon first, then restart the web server." << endl;
    }
}


bool ConfigManager::readDaemonPID()
{
    ifstream pidFile(pid_path);

    if (!pidFile)
    {
        cerr << "Could not open taqua.pid" << endl;
        return false;
    }

    pidFile >> daemon_pid;

    if (!daemon_pid)
    {
        cerr << "Could not read PID from taqua.pid" << endl;
        return false;
    }

    if (daemon_pid <= 0)
    {
        cerr << "Invalid daemon PID: " << daemon_pid << endl;
        return false;
    }

    return true;
}

bool ConfigManager::notifyDaemonConfigChanged()
{
    if (!daemon_pid_loaded)
    {   
        cout << "WARNING: Could not notify daemon: daemon pid not loaded!" << endl;
        return false;
    }

    if (kill(daemon_pid, 0) != 0)
    {
        perror("Daemon is not running");
        return false;
    }

    if (kill(daemon_pid, SIGUSR1) != 0)
    {
        perror("Could not send SIGUSR1");
        return false;
    }

    return true;
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
            
            bool valid = true;
            if (item.exists("valid")) {
                item.lookupValue("valid", valid);
            }

            int relay = 0;
            int duration = 0;

            if (!item.lookupValue("relay", relay)
                || !item.lookupValue("duration", duration)
                || relay < 0 || relay >= static_cast<int>(relayConfig.size()))
            {
                cerr << "Invalid scheduled event relay or duration" << endl;
                continue;
            }

            int minutes = 0;
            WeekdayMask weekdays = 0;

            if (item.exists("weekdays"))
            {
                int weekdayMask = 0;
                if (!item.lookupValue("weekdays", weekdayMask)
                    || weekdayMask < 0 || weekdayMask > 0x7f
                    || !item.lookupValue("start", minutes))
                {
                    cerr << "Invalid scheduled event weekday mask or start time" << endl;
                    continue;
                }

                weekdays = static_cast<WeekdayMask>(weekdayMask);
            }
            else
            {
                const Setting& start = item.lookup("start");
                const int weekday = start[0];
                minutes = start[1];

                if (weekday < 0 || weekday > 6)
                {
                    cerr << "Invalid legacy scheduled event weekday" << endl;
                    continue;
                }

                weekdays = weekdayBit(static_cast<Weekday>(weekday));
            }

            if (minutes < 0 || minutes >= 24 * 60)
            {
                cerr << "Invalid scheduled event start time" << endl;
                continue;
            }

            scheduledEvents.push_back({
                valid,
                static_cast<Relay>(relay),
                std::chrono::seconds(duration),
                weekdays,
                std::chrono::minutes(minutes)
            });
        }
    }
    catch (const SettingNotFoundException&)
    {
        cerr << "Error reading schedule" << endl;
    }
}


bool ConfigManager::writeConfig()
{
    try
    {
        updateRelayConfig();
        updateButtonIrrTime();
        updateScheduledEvents();

        cfg.writeFile(path.c_str());

        if (!notifyDaemonConfigChanged())
        {
            cerr << "Could not notify daemon" << endl;
            return false;
        }

        return true;
    }
    catch (const FileIOException& ex)
    {
        cerr << "I/O error while writing config file: "
             << ex.what() << endl;
    }
    catch (const SettingNotFoundException& ex)
    {
        cerr << "Config setting not found while writing file: "
             << ex.getPath() << endl;
    }
    catch (const SettingTypeException& ex)
    {
        cerr << "Config setting has wrong type while writing file: "
             << ex.getPath() << endl;
    }

    return false;
}

void ConfigManager::updateRelayConfig()
{
    Setting& r = cfg.lookup("relayConfig");

    if (r.getLength() != static_cast<int>(relayConfig.size()))
    {
        throw runtime_error("relayConfig has unexpected length");
    }

    for (size_t i = 0; i < relayConfig.size(); ++i)
    {
        r[i] = static_cast<int>(relayConfig[i]);
    }
}

void ConfigManager::updateButtonIrrTime()
{
    Setting& setting = cfg.lookup("buttonIrrigationTime");

    setting = static_cast<int>(buttonIrrTime.count());
}

void ConfigManager::updateScheduledEvents()
{
    Setting& scheduled = cfg.lookup("scheduled");

    while (scheduled.getLength() > 0)
    {
        scheduled.remove(scheduled.getLength() - 1);
    }

    for (const auto& event : scheduledEvents)
    {
        Setting& item = scheduled.add(Setting::TypeGroup);

        item.add("valid", Setting::TypeBoolean) = event.valid;

        item.add("relay", Setting::TypeInt) = static_cast<int>(event.relay);

        item.add("duration", Setting::TypeInt) = static_cast<int>(event.duration.count());

        item.add("weekdays", Setting::TypeInt) = static_cast<int>(event.weekdays);

        item.add("start", Setting::TypeInt) = static_cast<int>(chrono::duration_cast<chrono::minutes>(event.startTime).count());
    }
}


const array<RelayConfig, 8>& ConfigManager::getRelayConfig() const
{
    return relayConfig;
}

const chrono::seconds& ConfigManager::getButtonIrrTime() const
{
    return buttonIrrTime;
}

const vector<scheduledEvent>& ConfigManager::getScheduledEvents() const
{
    return scheduledEvents;
}


void ConfigManager::setRelayConfig(const array<RelayConfig, 8>& relay_config)
{
    relayConfig = relay_config;
}

void ConfigManager::setRelayConfigR(const Relay& relay, const RelayConfig& relay_config)
{
    relayConfig[static_cast<int>(relay)] = relay_config;
}

void ConfigManager::setButtonIrrTime(const chrono::seconds& irrigation_time)
{
    buttonIrrTime = irrigation_time;
}

void ConfigManager::setScheduledEvents(const std::vector<scheduledEvent>& scheduled_events)
{
    scheduledEvents.clear();
    scheduledEvents.reserve(scheduled_events.size());

    for (const auto& event : scheduled_events)
    {
        scheduledEvents.push_back(event);
    }
}
