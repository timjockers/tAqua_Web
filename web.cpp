#include "web.hpp"

#include <iostream>
#include <string>
#include <array>
#include <chrono>

tAquaWeb::tAquaWeb()
    : configM("../tAqua_Daemon/taqua.cfg", "../tAqua_Daemon/taqua.pid"),
      httpserver(&configM)
{}

tAquaWeb::~tAquaWeb()
{}

void tAquaWeb::run()
{
    httpserver.start("0.0.0.0", 8080);
}
