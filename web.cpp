#include "web.hpp"

#include <iostream>
#include <string>
#include <array>

tAquaWeb::tAquaWeb()
    : configM("../tAqua_Daemon/taqua.cfg")
{}

tAquaWeb::~tAquaWeb()
{}

void tAquaWeb::run()
{       
    /*const std::array<RelayConfig, 8> rc = {RelayConfig::UNUSED, RelayConfig::VALVE, RelayConfig::UNUSED, RelayConfig::VALVE, RelayConfig::UNUSED, RelayConfig::VALVE, RelayConfig::UNUSED, RelayConfig::VALVE};
    configM.setRelayConfig(rc);
    configM.write();*/
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
}
