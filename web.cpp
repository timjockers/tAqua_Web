#include "web.hpp"

#include <iostream>
#include <string>
#include <array>
#include <chrono>

tAquaWeb::tAquaWeb()
    : configM("../tAqua_Daemon/taqua.cfg")
{}

tAquaWeb::~tAquaWeb()
{}

void tAquaWeb::run()
{
    const std::array<RelayConfig, 8> rc = configM.getRelayConfig();

    for (auto& i : rc)
    {
        std::cout << static_cast<int>(i) << " ";
    }
    std::cout << std::endl;

    std::cout << "Button irrigation time: " << configM.getButtonIrrTime().count() << "s" << std::endl;

    const std::vector<scheduledEvent> s_events = configM.getScheduledEvents();

    for (auto& ev : s_events)
    {
        std::cout << "EVENT Relay: " << static_cast<int>(ev.relay)   // Relay
                  << "  Start(wd): " << static_cast<int>(ev.weekday) // Start - Weekday
                  << "  Start(mpm): " << ev.startTime.count()        // Start - Minutes past midnight
                  << "  Duration: " << ev.duration.count()
                  << std::endl;
    }


    configM.setRelayConfig(std::array<RelayConfig, 8>{
        RelayConfig::VALVE,
        RelayConfig::VALVE,
        RelayConfig::VALVE,
        RelayConfig::UNUSED,
        RelayConfig::UNUSED,
        RelayConfig::UNUSED,
        RelayConfig::UNUSED,
        RelayConfig::PERMANENTPOWER
    });

    configM.setButtonIrrTime(std::chrono::seconds(180));

    configM.setScheduledEvents(std::vector<scheduledEvent>{
        {
            Relay::R1,
            std::chrono::seconds(60),
            Weekday::Monday,
            std::chrono::minutes(480)
        },
        {
            Relay::R3,
            std::chrono::seconds(120),
            Weekday::Thursday,
            std::chrono::minutes(1380)
        }
    });

    if (!configM.writeConfig())
    {
        std::cerr << "Error writing taqua.cfg!" << std::endl;
    }
}
