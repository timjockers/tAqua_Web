#include "web.hpp"

#include <atomic>
#include <chrono>
#include <csignal>
#include <thread>
#include <fstream>
#include <filesystem>

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

void tAquaWeb::writePID()
{
    pid_t pid = getpid();

    ofstream pidFile(pidPath);
    if (!pidFile)
    {
        cerr << "Could not open PID file" << endl;
        return;
    }
    pidFile << pid << '\n';
    if (!pidFile)
    {
        cerr << "Could not write PID file" << endl;
        return;
    }

    pidFile.close();
}

void tAquaWeb::deletePID()
{
    filesystem::remove(pidPath);
}

void tAquaWeb::run()
{
    signal(SIGINT, requestShutdown);
    signal(SIGTERM, requestShutdown);

    writePID();

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

    deletePID();
}

void tAquaWeb::stop() noexcept
{
    httpserver.stop();
}
