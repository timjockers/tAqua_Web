#pragma once

#include "fileexchange.hpp"
#include "server.hpp"
#include "types.hpp"


class tAquaWeb {
public:
    tAquaWeb();
    ~tAquaWeb();

    void run();

private:
    void writePID();
    void deletePID();
    const std::filesystem::path pidPath = "taqua.pid";

    void stop() noexcept;

    ConfigManager configM;
    HTTPServer httpserver;
};

