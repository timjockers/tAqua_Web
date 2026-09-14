#include "web.hpp"

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
}
