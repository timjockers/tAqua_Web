#include "web.hpp"

#include <atomic>
#include <chrono>
#include <csignal>
#include <thread>

using namespace std;

namespace {
    atomic_bool shutdownRequested{false};

    void requestShutdown(int)
    {
        shutdownRequested.store(true, memory_order_relaxed);
    }
}

tAquaWeb::tAquaWeb()
    : configM("../tAqua_Daemon/taqua.cfg", "../tAqua_Daemon/taqua.pid"),
      httpserver(&configM)
{}

tAquaWeb::~tAquaWeb()
{}

void tAquaWeb::run()
{
    signal(SIGINT, requestShutdown);
    signal(SIGTERM, requestShutdown);

    atomic_bool serverStopped{false};
    thread serverThread([this, &serverStopped]() {
        httpserver.start("0.0.0.0", 80);
        serverStopped.store(true, memory_order_relaxed);
    });

    while (!shutdownRequested.load(memory_order_relaxed) && !serverStopped.load(memory_order_relaxed)) {
        this_thread::sleep_for(chrono::milliseconds(100));
    }

    stop();
    serverThread.join();
}

void tAquaWeb::stop() noexcept
{
    httpserver.stop();
}
