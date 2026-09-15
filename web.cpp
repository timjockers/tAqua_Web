#include "web.hpp"

#include <atomic>
#include <chrono>
#include <csignal>
#include <thread>

namespace {
std::atomic_bool shutdownRequested{false};

void requestShutdown(int)
{
    shutdownRequested.store(true, std::memory_order_relaxed);
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
    std::signal(SIGINT, requestShutdown);
    std::signal(SIGTERM, requestShutdown);

    std::atomic_bool serverStopped{false};
    std::thread serverThread([this, &serverStopped]() {
        httpserver.start("0.0.0.0", 8080);
        serverStopped.store(true, std::memory_order_relaxed);
    });

    while (!shutdownRequested.load(std::memory_order_relaxed)
           && !serverStopped.load(std::memory_order_relaxed)) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    stop();
    serverThread.join();
}

void tAquaWeb::stop() noexcept
{
    httpserver.stop();
}
