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
}
